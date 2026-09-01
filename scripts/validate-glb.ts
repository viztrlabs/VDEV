#!/usr/bin/env node
/**
 * validate-glb.ts — glTF 2.0 spec compliance check
 *
 * Wraps the official `gltf-validator` package and prints a structured
 * pass/fail report. Used by CI to gate uploads to the asset CDN.
 *
 * Usage:
 *   node --import tsx scripts/validate-glb.ts <input.glb>
 *
 * Exit codes:
 *   0 — valid
 *   1 — invalid (errors present)
 *   2 — input not found
 *   3 — validator crash
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

interface ValidatorIssue {
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  offset?: number;
  length?: number;
  pointer?: string;
}

interface ValidatorReport {
  issues: ValidatorIssue[];
  info?: Record<string, unknown>;
}

async function loadValidator(): Promise<(buf: ArrayBuffer, options: { uri: string; maxIssues?: number; externalResourceFunction?: unknown }) => Promise<ValidatorReport>> {
  // gltf-validator is a CommonJS package; dynamic import works in Node 22+
  // but we use require() to be safe across runtimes.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = await import('gltf-validator');
  // The package exports a default function in some versions; normalize.
  const fn = (mod as unknown as { default?: typeof mod.validate }).default ?? (mod as unknown as { validate: typeof mod.validate }).validate ?? (mod as unknown as () => never);
  return fn as unknown as (buf: ArrayBuffer, options: { uri: string; maxIssues?: number; externalResourceFunction?: unknown }) => Promise<ValidatorReport>;
}

async function main(): Promise<void> {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node --import tsx scripts/validate-glb.ts <input.glb>');
    process.exit(1);
  }
  const abs = path.resolve(input);
  try {
    await fs.access(abs);
  } catch {
    console.error(`[validate-glb] not found: ${abs}`);
    process.exit(2);
  }

  const buf = await fs.readFile(abs);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  const validate = await loadValidator();
  let report: ValidatorReport;
  try {
    report = await validate(ab, { uri: abs, maxIssues: 200 });
  } catch (err) {
    console.error('[validate-glb] validator crashed:', err);
    process.exit(3);
  }

  const errors = report.issues.filter((i) => i.severity === 'ERROR');
  const warnings = report.issues.filter((i) => i.severity === 'WARNING');
  const infos = report.issues.filter((i) => i.severity === 'INFO');

  for (const i of report.issues) {
    const where = i.pointer ? ` (at ${i.pointer})` : '';
    const tag = i.severity.padEnd(7);
    console.log(`  ${tag} [${i.code}] ${i.message}${where}`);
  }
  console.log(`[validate-glb] ${abs}: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info`);

  process.exit(errors.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[validate-glb] fatal:', err);
    process.exit(3);
  });
}
