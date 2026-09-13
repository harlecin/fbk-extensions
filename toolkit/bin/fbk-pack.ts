#!/usr/bin/env node
/*
 * fbk-pack — build and check a Folienbaukasten extension.
 *
 *   fbk-pack pack    [dir] [--out dist] [--version 1.2.0] [--id acme]
 *                          [--name "Acme Slate"] [--publisher "Acme GmbH"]
 *                          [--key you.pem --key-id you]
 *   fbk-pack check   [dir]
 *   fbk-pack publish [dir] --package @scope/name-extension [--out dist/npm]
 *                          [--purchase https://buy.polar.sh/…] [--key … --key-id …]
 *   fbk-pack abi
 *
 * `dir` defaults to the current directory. Packing runs every check first: a
 * pack that would not install is not written.
 *
 * Nothing here needs a checkout of the app. What the platform requires — the
 * ABI major, the pack format, the design tokens a theme owes, the runtime
 * shims, the manifest rules — is read from ../abi, emitted from the app by
 * `node tools/emit-abi.ts` and checked in beside the extensions.
 */
import path from 'node:path';
import { abi, provenance } from '../src/abi.ts';
import { checkExtension, packExtension } from '../src/pack.ts';
import { buildWrapper, idFromPackageName, idIsClaimable } from '../src/publish.ts';
import type { Findings } from '../src/check.ts';
import type { PackConfig } from '../src/config.ts';

const argv = process.argv.slice(2);
const command = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'pack';
const positional = argv.slice(command === argv[0] ? 1 : 0).filter((a) => !a.startsWith('--'));
const flag = (name: string): string | undefined => {
  const at = argv.indexOf(`--${name}`);
  return at > 0 ? argv[at + 1] : undefined;
};

/** Anything not preceded by a flag is the directory. */
function targetDir(): string {
  const flagged = new Set<string>();
  for (const [i, a] of argv.entries()) if (a.startsWith('--')) flagged.add(argv[i + 1] ?? '');
  return positional.find((a) => !flagged.has(a)) ?? '.';
}

function report(findings: Findings): void {
  for (const w of findings.warnings) console.warn(`warning: ${w}`);
  for (const e of findings.errors) console.error(`error: ${e}`);
}

const overrides: Partial<PackConfig> = {
  ...(flag('id') ? { id: flag('id') } : {}),
  ...(flag('name') ? { name: flag('name') } : {}),
  ...(flag('version') ? { version: flag('version') } : {}),
  ...(flag('publisher') ? { publisher: flag('publisher') } : {}),
};

switch (command) {
  case 'abi': {
    console.log(
      `platform ABI ${abi.platformAbi}, pack format ${abi.packFormatVersion}\n` +
        `emitted from app ${provenance.app} (${provenance.commit}) on ${provenance.emittedAt}\n` +
        `${abi.requiredTokens.length} required tokens, ${abi.requiredBoxStyles.length} box ` +
        `styles, ${abi.platformExports.length} platform exports, ${abi.layouts.length} layouts\n` +
        `layouts: ${abi.layouts.join(', ')}`,
    );
    break;
  }
  case 'check': {
    const { ext, findings } = await checkExtension(targetDir(), overrides);
    report(findings);
    if (findings.errors.length > 0) {
      console.error(`\n${ext.id}: ${findings.errors.length} error(s) — this pack would not build`);
      process.exit(1);
    }
    console.log(
      `${ext.id} ${ext.version}: ok — provides ${ext.provides.join(' + ')}, ` +
        `${(ext.config.components ?? []).length} component(s), ABI ${abi.platformAbi}` +
        `${findings.warnings.length ? `, ${findings.warnings.length} warning(s)` : ''}`,
    );
    break;
  }
  case 'pack': {
    const keyFile = flag('key');
    const keyId = flag('key-id');
    if (keyFile && !keyId) {
      console.error('--key needs --key-id (the name this key has in the app)');
      process.exit(1);
    }
    const result = await packExtension(targetDir(), {
      outDir: flag('out') ?? 'dist',
      overrides,
      ...(keyFile ? { key: { file: keyFile, keyId: keyId! } } : {}),
    });
    report(result.findings);
    if (result.findings.errors.length > 0) {
      console.error('\nno pack was written.');
      process.exit(1);
    }
    console.log(
      `${result.file} (${(result.bytes / 1024).toFixed(0)} kB)` +
        `${result.signed ? ', signed' : ', unsigned'}` +
        `${result.manifest.templates?.length ? `, ${result.manifest.templates.length} template(s)` : ''}` +
        `${result.manifest.components?.length ? `, ${result.manifest.components.length} component(s)` : ''}`,
    );
    break;
  }
  /*
   * Build the pack, then wrap it in a directory `npm publish` understands.
   *
   * It stops short of publishing. Sending a package to the registry is
   * public and effectively irreversible — npm allows unpublish for 72 hours
   * and never again — so the last step stays a thing a person types.
   */
  case 'publish': {
    const packageName = flag('package');
    if (!packageName) {
      console.error(
        'publish needs --package, the npm name to publish under\n' +
          '  e.g. --package @folienbaukasten/geo-extension',
      );
      process.exit(1);
    }
    const keyFile = flag('key');
    const keyId = flag('key-id');
    if (keyFile && !keyId) {
      console.error('--key needs --key-id (the name this key has in the app)');
      process.exit(1);
    }
    const outDir = flag('out') ?? 'dist/npm';
    const purchase = flag('purchase');

    const result = await packExtension(targetDir(), {
      outDir: path.join(outDir, '.pack'),
      overrides,
      ...(keyFile ? { key: { file: keyFile, keyId: keyId! } } : {}),
    });
    report(result.findings);
    if (result.findings.errors.length > 0) {
      console.error('\nnothing was published — the pack itself does not build.');
      process.exit(1);
    }

    /*
     * The npm name and the pack id must agree, because the npm registry is
     * what makes the id unique. A name that derived to something else would
     * hand two publishers the same install slot, and `meta.componentSet`
     * records the bare id in every deck forever — this is the last moment it
     * can be caught.
     */
    if (!idIsClaimable(packageName, result.manifest.id)) {
      console.error(
        `error: ${packageName} derives the id '${idFromPackageName(packageName)}', but this ` +
          `extension's id is '${result.manifest.id}'.\n` +
          'Rename the package, or set the id in pack.json to the derived form.',
      );
      process.exit(1);
    }
    if (!result.manifest.id.includes('.')) {
      console.warn(
        `warning: '${result.manifest.id}' is a bare id in a first-come namespace. New ` +
          `extensions should use the '${idFromPackageName(packageName)}' form, where npm ` +
          'prevents collisions. Existing published ids keep theirs — a deck records the id ' +
          'forever and renaming one breaks it.',
      );
    }

    const wrapper = await buildWrapper({
      packFile: result.file,
      manifest: result.manifest,
      packageName,
      outDir: path.join(outDir, 'package'),
      ...(purchase ? { purchase } : {}),
      ...(flag('license') ? { license: flag('license')! } : {}),
      ...(flag('repository') ? { repository: flag('repository')! } : {}),
    });

    console.log(
      `${wrapper.packageName}@${wrapper.version} → ${wrapper.dir}\n` +
        `  ${wrapper.files.join(', ')}` +
        `${wrapper.listing ? '\n  listing only — no pack, the card will read Buy' : ''}` +
        `${result.signed ? '\n  the pack is signed' : '\n  the pack is unsigned (installs as “unverified source”)'}`,
    );
    console.log(`\nPublish it with:\n  npm publish ${wrapper.dir} --access public`);
    break;
  }
  default:
    console.error(`unknown command '${command}' — expected pack, check, publish or abi`);
    process.exit(1);
}
