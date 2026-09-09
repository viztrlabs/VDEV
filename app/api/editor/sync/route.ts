import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SceneSnapshot } from '@/lib/3d/bridge/types';

const DATA_DIR = path.join(process.cwd(), 'data', 'editor');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'latest-scene.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * GET /api/editor/sync
 * Hydrates the latest scene snapshot
 */
export async function GET(req: NextRequest) {
  try {
    ensureDataDir();

    if (fs.existsSync(SNAPSHOT_FILE)) {
      const content = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      const snapshot: SceneSnapshot = JSON.parse(content);
      return NextResponse.json({ snapshot, cached: true });
    }

    // Default sample snapshot
    const defaultSnapshot: SceneSnapshot = {
      id: 'default-scene',
      version: 1,
      name: 'VizTR 3D Interactive Scene',
      engine: 'three',
      camera: {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 60,
      },
      entities: [
        {
          id: 'ent-cube-1',
          name: 'Hero Cube',
          type: 'mesh',
          position: { x: 0, y: 1, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          materialId: 'mat-arch-cube',
        },
        {
          id: 'ent-sphere-1',
          name: 'Accent Sphere',
          type: 'mesh',
          position: { x: 3, y: 0.8, z: 1 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          materialId: 'mat-accent-sphere',
        },
      ],
      materials: [
        {
          id: 'mat-arch-cube',
          name: 'Architectural Emerald',
          color: '#3ecf8e',
          roughness: 0.3,
          metalness: 0.2,
          opacity: 1,
          wireframe: false,
        },
        {
          id: 'mat-accent-sphere',
          name: 'Electric Indigo',
          color: '#6366f1',
          roughness: 0.1,
          metalness: 0.8,
          opacity: 1,
          wireframe: false,
        },
      ],
      hotspots: [],
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ snapshot: defaultSnapshot, cached: false });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to read scene snapshot' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/sync
 * Persists updated scene snapshot
 */
export async function POST(req: NextRequest) {
  try {
    const snapshot: SceneSnapshot = await req.json();

    if (!snapshot || !snapshot.id) {
      return NextResponse.json({ error: 'Invalid scene snapshot payload' }, { status: 400 });
    }

    ensureDataDir();

    // Increment version and timestamp
    const updatedSnapshot: SceneSnapshot = {
      ...snapshot,
      version: (snapshot.version || 0) + 1,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(updatedSnapshot, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      id: updatedSnapshot.id,
      version: updatedSnapshot.version,
      updatedAt: updatedSnapshot.updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save scene snapshot' },
      { status: 500 }
    );
  }
}
