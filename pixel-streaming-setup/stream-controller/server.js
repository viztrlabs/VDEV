'use strict';

/**
 * VizTR Stream Controller — GPU-PC sidecar service
 * --------------------------------------------------
 * Runs ON the GPU workstation next to the Unreal Engine 5 Pixel Streaming
 * build + Cirrus signalling server. The VizTR Next.js backend (running anywhere)
 * proxies /api/pixel-streaming/* to this service over HTTP.
 *
 * Responsibilities:
 *   POST /start   -> spawn the packaged UE5 build with Pixel Streaming flags
 *   POST /stop    -> SIGTERM the UE5 process (graceful spin-down)
 *   GET  /status  -> live process health + Cirrus streamer count
 *
 * It is safe to run even when UE5 is not installed: it reports
 * { ue5Available: false } and will not crash. Point UE5_EXE at your
 * packaged build to go live.
 */

const http = require('http');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---- Config (env-overridable) -------------------------------------------
const PORT = Number(process.env.CONTROLLER_PORT || 3001);
const UE5_EXE = process.env.UE5_EXE || '';
const CIRRUS_URL = process.env.CIRRUS_URL || 'http://localhost';
const CIRRUS_HTTP_PORT = Number(process.env.CIRRUS_HTTP_PORT || 80);
const STREAMER_PORT = Number(process.env.PS_STREAMER_PORT || 8888);
const PS_URL = process.env.PS_SIGNALING_URL || 'ws://localhost:8889';
const EXTRA_UE5_ARGS = (process.env.UE5_EXTRA_ARGS || '')
  .split(' ')
  .filter(Boolean);

// Default UE5 executable guess by platform (override with UE5_EXE)
function defaultUE5Path() {
  if (UE5_EXE) return UE5_EXE;
  if (os.platform() === 'win32') {
    return path.resolve(
      process.env.UE5_BUILD_DIR ||
        'C:/VizTR/Builds/ApexTower/Windows/ApexTower.exe'
    );
  }
  if (os.platform() === 'darwin') {
    return path.resolve(
      process.env.UE5_BUILD_DIR || '/Applications/VizTR/ApexTower.app/Contents/MacOS/ApexTower'
    );
  }
  return path.resolve(
    process.env.UE5_BUILD_DIR || '/opt/viztr/builds/ApexTower/ApexTower.sh'
  );
}

const UE5_PATH = defaultUE5Path();
const UE5_AVAILABLE = (() => {
  try {
    return fs.existsSync(UE5_PATH);
  } catch {
    return false;
  }
})();

// ---- In-memory session registry ----------------------------------------
/** @type {Map<string, {proc: import('child_process').ChildProcess|null, startedAt: string, streamId: string, resolution: string, fps: number, status: string}>} */
const sessions = new Map();

function nowISO() {
  return new Date().toISOString();
}

function ue5Args(streamId, resolution, fps) {
  const resMap = {
    '720p': '1280x720',
    '1080p': '1920x1080',
    '2k': '2560x1440',
    '4k': '3840x2160',
  };
  const res = resMap[resolution] || resMap['4k'];
  return [
    `-PixelStreamingURL=${PS_URL}`,
    `-PixelStreamingPort=${STREAMER_PORT}`,
    `-ResX=${res.split('x')[0]}`,
    `-ResY=${res.split('x')[1]}`,
    `-RenderOffScreen`,
    `-ForceRes`,
    `-fps=${fps}`,
    `-StreamerId=${streamId}`,
    ...EXTRA_UE5_ARGS,
  ];
}

// ---- Cirrus streamer count (best-effort) --------------------------------
async function cirrusStreamerCount() {
  return new Promise((resolve) => {
    const req = http.get(
      `${CIRRUS_URL}:${CIRRUS_HTTP_PORT}/stats.json`,
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.streamers ? json.streamers.length : 0);
          } catch {
            resolve(0);
          }
        });
      }
    );
    req.on('error', () => resolve(0));
    req.setTimeout(1500, () => req.destroy());
  });
}

// ---- HTTP helpers -------------------------------------------------------
function sendJSON(res, code, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// ---- Handlers -----------------------------------------------------------
async function handleStart(req, res) {
  const body = await readBody(req);
  const streamId = body.streamId || 'apex-tower-ue5';
  const resolution = body.resolution || '4k';
  const fps = Number(body.fps || 60);

  if (!UE5_AVAILABLE) {
    return sendJSON(res, 200, {
      success: true,
      simulated: true,
      ue5Available: false,
      sessionId: `stream_${Date.now()}`,
      status: 'ALLOCATED',
      webrtcSignalingUrl: process.env.NEXT_PUBLIC_PS_SIGNALING_URL || PS_URL,
      message:
        'UE5 build not found at configured path. Set UE5_EXE to a packaged build to go live. Returning simulated allocation.',
      streamId,
      resolution,
      fps,
    });
  }

  const existing = sessions.get(streamId);
  if (existing && existing.proc && !existing.proc.killed) {
    return sendJSON(res, 200, {
      success: true,
      status: 'ALREADY_RUNNING',
      streamId,
      webrtcSignalingUrl: process.env.NEXT_PUBLIC_PS_SIGNALING_URL || PS_URL,
    });
  }

  try {
    const proc = spawn(UE5_PATH, ue5Args(streamId, resolution, fps), {
      detached: false,
      windowsHide: true,
      env: { ...process.env },
    });

    proc.on('exit', (code, signal) => {
      const s = sessions.get(streamId);
      if (s) {
        s.status = 'terminated';
        s.proc = null;
      }
      console.log(`[stream-controller] UE5 (${streamId}) exited code=${code} signal=${signal}`);
    });

    proc.stderr.on('data', (d) => {
      const line = d.toString();
      if (/error|fail|exception/i.test(line)) {
        console.error(`[stream-controller][ue5][${streamId}] ${line.trim()}`);
      }
    });

    sessions.set(streamId, {
      proc,
      startedAt: nowISO(),
      streamId,
      resolution,
      fps,
      status: 'ALLOCATED',
    });

    return sendJSON(res, 200, {
      success: true,
      simulated: false,
      ue5Available: true,
      sessionId: `stream_${Date.now()}`,
      status: 'ALLOCATED',
      webrtcSignalingUrl: process.env.NEXT_PUBLIC_PS_SIGNALING_URL || PS_URL,
      pid: proc.pid,
      streamId,
      resolution,
      fps,
      message: 'UE5 Pixel Streaming process spawned. Connect via Cirrus once streamer registers.',
    });
  } catch (err) {
    return sendJSON(res, 500, {
      success: false,
      error: `Failed to launch UE5: ${err.message}`,
    });
  }
}

async function handleStop(req, res) {
  const body = await readBody(req);
  const streamId = body.streamId || 'apex-tower-ue5';
  const s = sessions.get(streamId);

  if (!s || !s.proc) {
    return sendJSON(res, 200, {
      success: true,
      status: 'ENDED',
      streamId,
      message: 'No active UE5 process for this streamId (already idle or simulated).',
    });
  }

  try {
    s.proc.kill('SIGTERM');
    s.status = 'terminated';
    s.proc = null;
    return sendJSON(res, 200, {
      success: true,
      status: 'ENDED',
      streamId,
      message: 'GPU instance gracefully spun down.',
      endedAt: nowISO(),
    });
  } catch (err) {
    return sendJSON(res, 500, {
      success: false,
      error: `Failed to stop UE5: ${err.message}`,
    });
  }
}

async function handleStatus(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const streamId = url.searchParams.get('streamId') || 'apex-tower-ue5';
  const streamers = await cirrusStreamerCount();
  const s = sessions.get(streamId);

  return sendJSON(res, 200, {
    ue5Available: UE5_AVAILABLE,
    ue5Path: UE5_PATH,
    streamId,
    activeNodes: sessions.size,
    clusterHealth: UE5_AVAILABLE ? 'OPTIMAL' : 'NO_GPU_BUILD',
    gpuUtilization: s && s.proc ? 'active' : 'idle',
    cirrusStreamers: streamers,
    session: s
      ? {
          streamId: s.streamId,
          status: s.status,
          resolution: s.resolution,
          fps: s.fps,
          startedAt: s.startedAt,
          pid: s.proc ? s.proc.pid : null,
        }
      : null,
  });
}

// ---- Router -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJSON(res, 204, {});
  const pathname = (req.url || '/').split('?')[0];

  try {
    if (req.method === 'POST' && pathname === '/start') return await handleStart(req, res);
    if (req.method === 'POST' && pathname === '/stop') return await handleStop(req, res);
    if (req.method === 'GET' && pathname === '/status') return await handleStatus(req, res);
    if (pathname === '/health') return sendJSON(res, 200, { ok: true, ue5Available: UE5_AVAILABLE });
    return sendJSON(res, 404, { error: 'Not found' });
  } catch (err) {
    return sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[stream-controller] listening on :${PORT}`);
  console.log(`[stream-controller] UE5 build: ${UE5_AVAILABLE ? 'FOUND' : 'NOT FOUND'} -> ${UE5_PATH}`);
  console.log(`[stream-controller] Cirrus: ${CIRRUS_URL}:${CIRRUS_HTTP_PORT}`);
});
