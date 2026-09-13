/*
 * Build the wizard for publishing — see the toolkit's build.ts for why the
 * published tarball is JavaScript rather than the TypeScript this runs from
 * on the machine it was written on.
 *
 * `template/` is data and is copied into the tarball untouched. The bundle
 * finds it relative to itself, so the output has to stay exactly one
 * directory below the package root.
 */
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
rmSync(path.join(root, 'dist'), { recursive: true, force: true });

await build({
  entryPoints: [path.join(root, 'index.ts')],
  outfile: path.join(root, 'dist/index.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  logLevel: 'info',
});

console.log('create-extension: built dist/index.js');
