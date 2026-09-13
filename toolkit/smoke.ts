/*
 * The toolkit's own smoke: scaffold → check → pack → wrap → install-shape.
 *
 *   node smoke.ts
 *
 * It exists because everything it covers passes by hand and fails in the one
 * situation that matters — a stranger, on a clean machine, who has never run
 * any of it. Each assertion below is a mistake that was actually made while
 * this was written.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { idFromPackageName, idIsClaimable, abiKeyword, EXTENSION_KEYWORD } from './src/publish.ts';

const root = import.meta.dirname;
const wizard = path.join(root, '../create-extension/index.ts');
const cli = path.join(root, 'bin/fbk-pack.ts');
const tmp = mkdtempSync(path.join(os.tmpdir(), 'fbk-smoke-'));

let failures = 0;
function check(what: string, ok: boolean, detail = ''): void {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${what}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failures++;
}
const run = (cmd: string, args: string[], cwd = tmp) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

console.log('\nid derivation');
check('a scoped name becomes publisher.name', idFromPackageName('@acme/deepseam-extension') === 'acme.deepseam');
check('the -extension suffix is not part of the identity',
  idFromPackageName('@acme/deepseam') === idFromPackageName('@acme/deepseam-extension'));
check('an unscoped name has no publisher half', idFromPackageName('deepseam') === 'deepseam');
check('a derived id may be claimed', idIsClaimable('@acme/deepseam-extension', 'acme.deepseam'));
// The grandfather clause: ids published before npm was the channel are in
// decks forever as meta.componentSet and can never be renamed.
check('a bare id is grandfathered', idIsClaimable('@folienbaukasten/geo-extension', 'geo'));
check('one publisher cannot claim another’s dotted id',
  !idIsClaimable('@acme/deepseam-extension', 'evil.deepseam'));

/*
 * Every provides combination, because the wizard has to *remove* things for
 * two of them: a components-only pack must ship no stylesheet and a
 * theme-only pack no components, and fbk-pack rejects both mistakes. A
 * scaffolder that emits a project which will not pack is worse than none.
 */
for (const provides of ['both', 'theme', 'components'] as const) {
  console.log(`\nscaffold --provides ${provides}`);
  const dir = path.join(tmp, provides);
  run('node', [wizard, dir, '--package', `@acme/${provides}-thing-extension`, '--name',
    'Test Extension', '--publisher', 'Acme GmbH', '--provides', provides]);

  const pack = JSON.parse(readFileSync(path.join(dir, 'pack.json'), 'utf8')) as
    { id: string; provides?: string[] };
  check('the id is derived from the npm name', pack.id === `acme.${provides}-thing`, pack.id);
  check('no placeholder survives the copy',
    !readdirSync(dir).some((f) => f.endsWith('.ts') &&
      readFileSync(path.join(dir, f), 'utf8').includes('__ID__')));
  check('a theme-only pack declares no components',
    provides !== 'theme' || pack.components === undefined);
  check('a components-only pack ships no stylesheet',
    provides !== 'components' || !existsSync(path.join(dir, 'theme.css')));
  // npm renames a packaged `.gitignore`, so the template ships it unhidden
  // and the wizard restores it. Leaving both behind puts a stray file in
  // every scaffold that nobody can explain.
  check('the unhidden gitignore does not survive',
    existsSync(path.join(dir, '.gitignore')) && !existsSync(path.join(dir, 'gitignore')));

  const packed = run('node', [cli, 'pack', dir, '--out', path.join(dir, 'dist')]);
  check('it packs', packed.includes('.fbkset'), packed.trim());

  const wrapped = run('node', [cli, 'publish', dir, '--package',
    `@acme/${provides}-thing-extension`, '--out', path.join(dir, 'npm')]);
  check('it wraps for npm', wrapped.includes('npm publish'));

  const meta = JSON.parse(
    readFileSync(path.join(dir, 'npm/package/package.json'), 'utf8'),
  ) as {
    keywords: string[];
    folienbaukasten: {
      pack?: string;
      platformAbi: number;
      components?: { glyph?: string; schema?: unknown }[];
    };
  };
  // Search is how the Browse tab finds anything; without the keyword the
  // package is on npm and invisible to the app.
  check('the wrapper carries the discovery keyword', meta.keywords.includes(EXTENSION_KEYWORD));
  // Compatibility answerable from a search result, without fetching each
  // candidate's metadata one at a time.
  check('and the ABI keyword', meta.keywords.includes(abiKeyword(meta.folienbaukasten.platformAbi)));
  check('and names a pack file that is in the tarball',
    !!meta.folienbaukasten.pack &&
      existsSync(path.join(dir, 'npm/package', meta.folienbaukasten.pack)));
  /*
   * The glyphs and schemas travel OUTSIDE the pack, or a card for an
   * extension nobody has installed has no picture and the model has no
   * vocabulary — which is the whole basis of previewing before installing,
   * and the only thing that makes a paid listing worth publishing.
   */
  if (provides !== 'theme') {
    const comps = meta.folienbaukasten.components ?? [];
    check('every component ships a glyph beside the pack',
      comps.length > 0 && comps.every((c) => !!c.glyph &&
        existsSync(path.join(dir, 'npm/package', c.glyph))));
    check('and its prop schema', comps.every((c) => !!c.schema));
  }
}

/* A listing package — a paid extension, discoverable but not installable. */
console.log('\npublish --purchase (a paid extension’s listing)');
const paid = path.join(tmp, 'both');
run('node', [cli, 'publish', paid, '--package', '@acme/both-thing-extension',
  '--out', path.join(paid, 'listing'), '--purchase', 'https://buy.polar.sh/x']);
const listing = JSON.parse(
  readFileSync(path.join(paid, 'listing/package/package.json'), 'utf8'),
) as {
  folienbaukasten: { pack?: string; purchase?: string; components?: { glyph?: string }[] };
  files: string[];
};
check('it carries the checkout URL', listing.folienbaukasten.purchase === 'https://buy.polar.sh/x');
// The whole point of a listing: the inert half travels, the executable half
// is what is being sold.
check('and ships no pack', listing.folienbaukasten.pack === undefined);
check('and lists no pack file', !listing.files.some((f) => f.endsWith('.fbkset')));
// The point of a listing: everything needed to SHOW the extension travels,
// and only the executable half is withheld. A Buy card with no pictures
// would be an advertisement, which is also the thing npm removes as spam.
check('but still ships the glyphs, so its card is as good as a free one’s',
  (listing.folienbaukasten.components ?? []).every((c) => !!c.glyph &&
    existsSync(path.join(paid, 'listing/package', c.glyph))));

rmSync(tmp, { recursive: true, force: true });
console.log(failures === 0 ? '\ntoolkit smoke ok\n' : `\ntoolkit smoke: ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
