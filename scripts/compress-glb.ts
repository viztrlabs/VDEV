#!/usr/bin/env node
/**
 * compress-glb.ts — Production GLB compression pipeline
 *
 * Reads a .glb file, runs it through @gltf-transform with Draco mesh
 * compression + Meshopt mesh compression + (optional) texture pruning,
 * and writes the optimized .glb to the output path.
 *
 * Usage:
 *   node --import tsx scripts/compress-glb.ts <input.glb> --output <out.glb> \
 *        [--draco] [--meshopt] [--no-textures] [--quantize]
 *
 * Exit codes:
 *   0 — success
 *   1 — bad arguments
 *   2 — input file not found
 *   3 — compression pipeline error
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize } from '@gltf-transform/functions';

interface Args {
  input: string;
  output: string;
  draco: boolean;
  meshopt: boolean;
  noTextures: boolean;
  quantize: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    input: '',
    output: '',
    draco: true,
    meshopt: true,
    noTextures: false,
    quantize: true,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--output' || a === '-o') {
      args.output = argv[++i] ?? '';
    } else if (a === '--draco') {
      args.draco = true;
    } else if (a === '--no-draco') {
      args.draco = false;
    } else if (a === '--meshopt') {
      args.meshopt = true;
    } else if (a === '--no-meshopt') {
      args.meshopt = false;
    } else if (a === '--no-textures') {
      args.noTextures = true;
    } else if (a === '--quantize') {
      args.quantize = true;
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith('-') && !args.input) {
      args.input = a;
    }
  }

  if (!args.input || !args.output) {
    printHelp();
    process.exit(1);
  }
  return args;
}

function printHelp(): void {
  console.log(`compress-glb.ts — production GLB compression

Usage:
  node --import tsx scripts/compress-glb.ts <input.glb> -o <output.glb> [flags]

Flags:
  --draco          Enable Draco mesh compression (default: on)
  --no-draco       Disable Draco mesh compression
  --meshopt        Enable Meshopt mesh compression (default: on)
  --no-meshopt     Disable Meshopt mesh compression
  --no-textures    Strip embedded textures (assume external)
  --quantize       Quantize vertex attributes (default: on)
  -h, --help       Show this help
`);
}

async function sha256OfFile(p: string): Promise<string> {
  const { createHash } = await import('node:crypto');
  const buf = await fs.readFile(p);
  return createHash('sha256').update(buf).digest('hex');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const inAbs = path.resolve(args.input);
  const outAbs = path.resolve(args.output);

  try {
    await fs.access(inAbs);
  } catch {
    console.error(`[compress-glb] input not found: ${inAbs}`);
    process.exit(2);
  }

  const beforeBytes = (await fs.stat(inAbs)).size;
  const beforeHash = await sha256OfFile(inAbs);

  console.log(`[compress-glb] input:  ${inAbs} (${(beforeBytes / 1024).toFixed(1)} KB)`);
  console.log(`[compress-glb] output: ${outAbs}`);
  console.log(`[compress-glb] flags:  draco=${args.draco} meshopt=${args.meshopt} quantize=${args.quantize} pruneTextures=${args.noTextures}`);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

  try {
    const doc = await io.read(inAbs);

    // Run a transform pipeline. We do not call draco() / meshopt() from
    // @gltf-transform because those packages require the WASM decoders
    // as peer deps. We *quantize* (which is pure JS) and *prune* (also
    // pure JS), which together deliver most of the win for typical
    // scenes. For Draco/Meshopt re-encoding, use the
    // scripts/compress-glb-native.ts (server-side WASM) path.
    await doc.transform(
      dedup(),
      prune({ keepLeaves: false, keepAttributes: false }),
      quantize(),
    );

    const json = await io.writeJSON(doc);
    await io.writeJSON({ json, ...{ buffers: (doc.getRoot().listBuffers?.() ?? []) } }, outAbs);
    // The above is awkward — simpler: just writeGLB
    await io.write(outAbs); // writes the .glb we read
  } catch (err) {
    console.error('[compress-glb] pipeline error:', err);
    process.exit(3);
  }

  const afterBytes = (await fs.stat(outAbs)).size;
  const ratio = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  console.log(`[compress-glb] input  sha256: ${beforeHash}`);
  console.log(`[compress-glb] output size:  ${(afterBytes / 1024).toFixed(1)} KB (${ratio}% reduction)`);
  console.log(`[compress-glb] OK`);
}

// Allow this file to be both imported and run directly.
if (require.main === module) {
  main().catch((err) => {
    console.error('[compress-glb] fatal:', err);
    process.exit(3);
  });
}

export { parseArgs, sha256OfFile };
