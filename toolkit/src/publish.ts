/*
 * Wrap a built `.fbkset` in an npm package (SPECS/EXTENSIONS.md in the app
 * repo — "Installing from npm").
 *
 * The tempting design is to make the npm package *be* the extension —
 * `manifest.json` and `set.js` at the top level — and it is the wrong one.
 * The tarball carries the **built pack**, and the app extracts one file and
 * hands it to the install path it already has. Everything that took a year to
 * settle survives untouched: the signature over file digests, the trust
 * verdict, the accept-once keyed on id and version, the atomic slot swap,
 * side-by-side majors, the ABI check. npm is a delivery vehicle, not a second
 * package format — and the same `.fbkset` is still the thing sold on Polar or
 * emailed to a customer, so there is one artefact, built one way, distributed
 * three ways.
 *
 * Nothing here talks to the registry. It writes a directory that `npm
 * publish` understands, prints the command, and stops: publishing is
 * irreversible and public, and a tool that does it as a side effect of
 * building is a tool that will do it by accident.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { abi, type SetPackManifest } from './abi.ts';

/** Every wrapper carries this, and the Browse tab's search filters on it. */
export const EXTENSION_KEYWORD = 'folienbaukasten-extension';

/**
 * The ABI as a keyword, so compatibility is answerable from a *search
 * result* rather than by fetching every candidate's metadata one at a time.
 * An extension that supports two majors publishes both.
 */
export function abiKeyword(platformAbi: number): string {
  return `folienbaukasten-abi-${platformAbi}`;
}

/**
 * What the app reads out of a wrapper's `package.json`.
 *
 * Enough to draw a card — name, publisher, swatch, what it provides — before
 * anything is downloaded, which is the whole reason it is here rather than
 * only inside the pack. `pack` names the file to extract; `purchase` marks a
 * *listing*: metadata for an extension sold on Polar, shipping no pack at
 * all, whose card reads Buy rather than Install.
 */
export interface WrapperMeta {
  id: string;
  provides: ('theme' | 'components')[];
  platformAbi: number;
  /** Pack file inside the tarball. Absent on a listing package. */
  pack?: string;
  swatch?: SetPackManifest['swatch'];
  components?: {
    kind: string;
    description?: string;
    webOnly?: boolean;
    /**
     * Path, inside THIS tarball, of the component's glyph.
     *
     * Copied out of the pack rather than referenced inside it, because the
     * whole point is to be readable before the pack is downloaded — and, for
     * a listing package, when there is no pack at all. It is what lets the
     * Browse tab draw a card, and the detail page a full contact sheet, for
     * an extension nobody has installed.
     */
    glyph?: string;
    /**
     * The component's prop schema. Shipped for the same reason: it is what
     * teaches the model this extension's vocabulary, so a deck can be
     * *written* against a pack that is not installed — and, for a paid one,
     * before it is bought.
     */
    schema?: unknown;
  }[];
  /** Polar checkout URL. Present iff this is a listing package. */
  purchase?: string;
}

export interface WrapperOptions {
  /** The built pack to wrap. */
  packFile: string;
  manifest: SetPackManifest;
  /** npm package name, e.g. `@folienbaukasten/geo-extension`. */
  packageName: string;
  outDir: string;
  /** README shipped in the tarball; the extension's own, when it has one. */
  readme?: string;
  license?: string;
  repository?: string;
  /** Sell it instead of shipping it: no pack in the tarball, a Buy card. */
  purchase?: string;
}

export interface WrapperResult {
  dir: string;
  packageName: string;
  version: string;
  /** True when no pack was included — a listing for a paid extension. */
  listing: boolean;
  files: string[];
}

/**
 * npm names allow things a pack id does not, and the mapping has to be
 * mechanical or the two namespaces drift and collisions come back.
 *
 * `@scope/name-extension` → `scope.name`, the `publisher.name` form. The
 * trailing `-extension` is dropped because it is a convention of the npm
 * name, not part of the identity — `@acme/deepseam-extension` and
 * `@acme/deepseam` must not be two different extensions.
 */
export function idFromPackageName(packageName: string): string {
  const scoped = /^@([^/]+)\/(.+)$/.exec(packageName);
  const base = (scoped ? scoped[2]! : packageName).replace(/-extension$/, '');
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return scoped ? `${clean(scoped[1]!)}.${clean(base)}` : clean(base);
}

/**
 * Whether a pack id is one this package name may claim.
 *
 * Exact derivation, or a bare id — which is the grandfather clause. The ids
 * published before npm was the distribution channel (`geo`, `strategy`,
 * `ctrl`) are recorded in decks as `meta.componentSet` forever and cannot be
 * renamed without breaking them. New extensions get the derived form, where
 * the npm registry does the collision-prevention that no scheme of ours can.
 */
export function idIsClaimable(packageName: string, id: string): boolean {
  return id === idFromPackageName(packageName) || !id.includes('.');
}

/**
 * Lift the glyph SVGs out of the built pack.
 *
 * Read from the pack rather than from the author's source directory so that
 * what the card shows is exactly what the installed extension draws — the two
 * could differ if a glyph changed after the last pack, and a preview that
 * lies about the thing it previews is worse than none.
 */
async function extractGlyphs(
  packFile: string,
  manifest: SetPackManifest,
  dir: string,
): Promise<Map<string, string>> {
  const wanted = new Map<string, string>();
  for (const c of manifest.components ?? []) if (c.glyph) wanted.set(c.kind, c.glyph);
  if (wanted.size === 0) return new Map();

  const zip = await JSZip.loadAsync(readFileSync(packFile));
  const written = new Map<string, string>();
  for (const [kind, rel] of wanted) {
    const entry = zip.file(rel);
    if (!entry) continue;
    const target = path.join(dir, rel);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, await entry.async('nodebuffer'));
    written.set(kind, rel);
  }
  return written;
}

export async function buildWrapper(opts: WrapperOptions): Promise<WrapperResult> {
  const { manifest, packageName } = opts;
  const listing = !!opts.purchase;
  const dir = path.resolve(opts.outDir);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const packName = path.basename(opts.packFile);
  if (!existsSync(opts.packFile)) throw new Error(`no pack at ${opts.packFile}`);
  const glyphs = await extractGlyphs(opts.packFile, manifest, dir);
  const meta: WrapperMeta = {
    id: manifest.id,
    provides: manifest.provides ?? ['theme'],
    platformAbi: manifest.platformAbi,
    // A listing ships no code — that is the half being sold. It still carries
    // everything needed to *show* the extension, which is what makes a paid
    // card as informative as a free one.
    ...(listing ? { purchase: opts.purchase! } : { pack: packName }),
    ...(manifest.swatch ? { swatch: manifest.swatch } : {}),
    ...(manifest.components?.length
      ? {
          components: manifest.components.map((c) => ({
            kind: c.kind,
            ...(c.description ? { description: c.description } : {}),
            ...(c.webOnly ? { webOnly: true } : {}),
            ...(glyphs.has(c.kind) ? { glyph: glyphs.get(c.kind)! } : {}),
            ...(c.schema ? { schema: c.schema } : {}),
          })),
        }
      : {}),
  };

  const pkg = {
    name: packageName,
    version: manifest.version,
    description: manifest.description ?? `${manifest.name}, a Folienbaukasten extension.`,
    keywords: [EXTENSION_KEYWORD, abiKeyword(manifest.platformAbi), 'folienbaukasten', 'slides'],
    ...(manifest.publisher ? { author: manifest.publisher } : {}),
    ...(opts.license ? { license: opts.license } : {}),
    ...(opts.repository ? { repository: opts.repository } : {}),
    // Not a Node module and never imported: the app reads the tarball, it
    // does not resolve the package. Saying so stops a bundler from trying.
    private: false,
    files: [...(listing ? [] : [packName]), ...(glyphs.size ? ['glyphs'] : []), 'README.md'],
    folienbaukasten: meta,
    $comment:
      'A Folienbaukasten extension, delivered through npm. The .fbkset beside this file is ' +
      'the extension; the app downloads this tarball, verifies it against the registry’s own ' +
      'integrity digest, extracts that one file and installs it. Nothing here is imported as ' +
      'a Node module, and no install script runs — the app never invokes npm.',
  };

  writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  const files = ['package.json'];

  if (!listing) {
    copyFileSync(opts.packFile, path.join(dir, packName));
    files.push(packName);
  }
  for (const rel of new Set(glyphs.values())) files.push(rel);

  writeFileSync(path.join(dir, 'README.md'), readmeFor(manifest, packageName, opts));
  files.push('README.md');

  return { dir, packageName, version: manifest.version, listing, files };
}

/**
 * The tarball's README — what npmjs.com shows on the package page.
 *
 * It is read by people deciding whether to install, and by nobody's build. So
 * it leads with what the extension provides and how to get it, and it states
 * the app compatibility, which is the question the registry page cannot
 * answer and the one that generates the support mail.
 */
function readmeFor(
  manifest: SetPackManifest,
  packageName: string,
  opts: WrapperOptions,
): string {
  const provides = manifest.provides ?? ['theme'];
  const lines: string[] = [
    `# ${manifest.name}`,
    '',
    manifest.description ?? '',
    '',
    `A **[Folienbaukasten](https://github.com/harlecin/folienbaukasten)** extension` +
      `${manifest.publisher ? ` by ${manifest.publisher}` : ''}.`,
    '',
    '## What it provides',
    '',
  ];
  if (provides.includes('theme')) {
    lines.push('- **A theme** — the colours, type and the header and footer every slide wears.');
  }
  for (const c of manifest.components ?? []) {
    lines.push(
      `- **${c.kind.split('/').slice(1).join('/')}**${c.webOnly ? ' *(web only)*' : ''}` +
        `${c.description ? ` — ${c.description}` : ''}`,
    );
  }
  if (manifest.templates?.length) {
    lines.push(`- **${manifest.templates.length} starter deck(s)** to begin from.`);
  }
  lines.push(
    '',
    '## Installing',
    '',
    opts.purchase
      ? `This is a paid extension. [Buy it](${opts.purchase}), then double-click the ` +
        '`.fbkset` you receive — the app installs it.'
      : 'Open **Extensions → Browse** in Folienbaukasten and search for it. This package is ' +
        'the delivery vehicle: it carries a prebuilt `.fbkset`, and the app extracts and ' +
        'installs that. It is not a Node module — do not `npm install` it into a project.',
    '',
    '## Compatibility',
    '',
    `Built for **platform ABI ${manifest.platformAbi}**` +
      `${manifest.platformAbi === abi.platformAbi ? '' : ' (not this toolkit’s)'}. An app that ` +
      'speaks a different ABI refuses it at install and says so; if that happens, update the ' +
      'app, or ask the publisher for a build that matches.',
    '',
    '---',
    '',
    `\`${packageName}\` ${manifest.version}${manifest.publisher ? ` · ${manifest.publisher}` : ''}`,
    '',
  );
  return lines.join('\n');
}

/** The extension's own README, if it has one worth shipping. */
export function readmeOf(dir: string): string | undefined {
  const file = path.join(dir, 'README.md');
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}
