#!/usr/bin/env node
/**
 * build-manifest.ts — generate an asset manifest for a project
 *
 * Walks an asset directory, computes SHA-256 for every file, infers
 * compression hints from filename suffixes, and writes a manifest.json
 * that the Viewer can use to preload + verify assets.
 *
 * Usage:
 *   node --import tsx scripts/build-manifest.ts <assets-dir> -o <manifest.json> \
 *        --project-id <id> --experience-id <id>
 *
 * Exit codes:
 *   0 — success
 *   1 — bad arguments
 *   2 — assets dir not found
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { AssetManifest, ManifestAsset } from '../lib/3d/manifest';
import { validateManifest } from '../lib/3d/manifest';

interface BuildArgs {
  input: string;
  output: string;
  projectId: string;
  experienceId: string;
  baseUrl: string;
}

function parseArgs(argv: string[]): BuildArgs {
  const args: BuildArgs = {
    input: '',
    output: '',
    projectId: '',
    experienceId: '',
    baseUrl: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--output' || a === '-o') args.output = argv[++i] ?? '';
    else if (a === '--project-id') args.projectId = argv[++i] ?? '';
    else if (a === '--experience-id') args.experienceId = argv[++i] ?? '';
    else if (a === '--base-url') args.baseUrl = argv[++i] ?? '';
    else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith('-') && !args.input) args.input = a;
  }
  if (!args.input || !args.output || !args.projectId || !args.experienceId) {
    printHelp();
    process.exit(1);
  }
  return args;
}

function printHelp(): void {
  console.log(`build-manifest.ts — generate asset manifest

Usage:
  node --import tsx scripts/build-manifest.ts <assets-dir> -o <manifest.json> \\
       --project-id <id> --experience-id <id> [--base-url <url>]`);
}

function kindOf(filename: string): ManifestAsset['kind'] {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.glb':
    case '.gltf':
      return 'glb';
    case '.splat':
    case '.ply':
    case '.spz':
      return 'splat';
    case '.usdz':
      return 'usdz';
    case '.hdr':
    case '.exr':
      return 'hdr';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.webp':
    case '.avif':
      return 'panorama';
    case '.basis':
    case '.ktx2':
      return 'texture';
    default:
      return 'texture';
  }
}

function compressionOf(filename: string): ManifestAsset['compression'] {
  const lower = filename.toLowerCase();
  return {
    draco: /\.draco\./.test(lower),
    meshopt: /\.meshopt\./.test(lower),
    ktx2: /\.ktx2\./.test(lower) || /\.basis$/.test(lower),
  };
}

async function walk(dir: string, root: string): Promise<string[]> {
  const out: string[] = [];
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full, root)));
    } else {
      out.push(path.relative(root, full));
    }
  }
  return out;
}

async function sha256(p: string): Promise<string> {
  const buf = await fs.readFile(p);
  return createHash('sha256').update(buf).digest('hex');
}

function inferGroup(rel: string): string {
  const top = rel.split(/[\\/]/)[0]?.toLowerCase() ?? '';
  if (['scene', 'scenes', 'models', 'glb', 'gltf'].includes(top)) return 'scene';
  if (['panorama', 'panos', 'tour', '360'].includes(top)) return 'tour';
  if (['splat', 'splats', 'gaussian'].includes(top)) return 'splat';
  if (['ui', 'icons', 'textures'].includes(top)) return 'ui';
  if (['audio', 'music', 'sfx'].includes(top)) return 'audio';
  return 'misc';
}

function isCritical(rel: string): boolean {
  const top = rel.split(/[\\/]/)[0]?.toLowerCase() ?? '';
  return ['scene', 'scenes', 'models'].includes(top);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const inAbs = path.resolve(args.input);
  const outAbs = path.resolve(args.output);

  try {
    await fs.access(inAbs);
  } catch {
    console.error(`[build-manifest] assets dir not found: ${inAbs}`);
    process.exit(2);
  }

  const files = (await walk(inAbs, inAbs)).sort();
  console.log(`[build-manifest] scanning ${files.length} files under ${inAbs}`);

  const base = args.baseUrl.replace(/\/$/, '');
  const assets: ManifestAsset[] = [];
  for (const rel of files) {
    const abs = path.join(inAbs, rel);
    const stat = await fs.stat(abs);
    const hash = await sha256(abs);
    assets.push({
      url: `${base}/${rel.replace(/\\/g, '/')}`,
      name: rel,
      kind: kindOf(rel),
      size: stat.size,
      sha256: hash,
      compression: compressionOf(rel),
      group: inferGroup(rel),
      critical: isCritical(rel),
    });
  }

  const manifest: AssetManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    projectId: args.projectId,
    experienceId: args.experienceId,
    assets,
  };

  const errors = validateManifest(manifest);
  if (errors.length > 0) {
    console.error('[build-manifest] generated manifest failed validation:');
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }

  await fs.writeFile(outAbs, JSON.stringify(manifest, null, 2));
  console.log(`[build-manifest] wrote ${outAbs} (${assets.length} assets)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[build-manifest] fatal:', err);
    process.exit(1);
  });
}

export { kindOf, compressionOf, inferGroup, isCritical, sha256 };
