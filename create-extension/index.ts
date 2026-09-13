#!/usr/bin/env node
/*
 * `npm create @folienbaukasten/extension`
 *
 * Scaffolds a Folienbaukasten extension: a theme, slide types, or both.
 *
 * What this writes is not really a starter project — it is a **brief**. The
 * template ships an AGENTS.md that says what an extension may and may not
 * be, prop types whose doc comments *become* the JSON Schema the model
 * writes against, and three commands that verify a change without the app.
 * So "add a slide type that shows a RACI matrix" is a reasonable thing to say
 * to an assistant inside the result, and the checks catch it when the
 * assistant is wrong. That is the pitch, and it is why the template is a
 * worked example rather than an empty skeleton.
 *
 * The one question that cannot be changed later is the **name**. An
 * extension's id is written into every deck as `meta.componentSet` and into
 * every component kind, so it is asked first, derived from the npm package
 * name, and validated — because npm's registry is what makes it unique, and
 * a flat first-come namespace is a collision waiting to be somebody's
 * problem.
 */
import { createInterface } from 'node:readline/promises';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { stdin, stdout } from 'node:process';

/* `dist/index.js` at publish time, `index.ts` in the repo — the template sits
 * beside the package root either way. */
const TEMPLATE = existsSync(path.join(import.meta.dirname, 'template'))
  ? path.join(import.meta.dirname, 'template')
  : path.join(import.meta.dirname, '../template');

/** Files that only make sense when the extension provides that half. */
const THEME_ONLY_FILES = ['theme.css', 'components/Header.tsx', 'components/Footer.tsx'];
const COMPONENT_FILES = [
  'components.ts',
  'components/PricingSheet.tsx',
  'components/Flow.tsx',
  'glyphs/pricing-sheet.svg',
  'glyphs/flow.svg',
];

interface Answers {
  dir: string;
  packageName: string;
  id: string;
  name: string;
  description: string;
  publisher: string;
  provides: ('theme' | 'components')[];
}

/**
 * `@scope/name-extension` → `scope.name`.
 *
 * Kept byte-identical to `idFromPackageName` in the toolkit's publish.ts:
 * the wizard writes the id and `fbk-pack publish` re-derives it to check the
 * package may claim it, so two implementations that disagree would produce a
 * project that scaffolds cleanly and refuses to publish.
 */
function idFromPackageName(packageName: string): string {
  const scoped = /^@([^/]+)\/(.+)$/.exec(packageName);
  const base = (scoped ? scoped[2]! : packageName).replace(/-extension$/, '');
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return scoped ? `${clean(scoped[1]!)}.${clean(base)}` : clean(base);
}

/** npm's own rules, minus the ones a scaffolder cannot check (availability). */
function packageNameProblem(name: string): string | null {
  if (!name) return 'A name is required.';
  if (name.length > 214) return 'That is longer than npm allows (214 characters).';
  if (!/^(@[a-z0-9][a-z0-9-._]*\/)?[a-z0-9][a-z0-9-._]*$/.test(name)) {
    return 'npm names are lowercase, and may use - . _ and one @scope/ prefix.';
  }
  const id = idFromPackageName(name);
  if (!/^[a-z][a-z0-9.-]*[a-z0-9]$/.test(id)) return `That derives an unusable id ("${id}").`;
  if (id.length > 40) return `That derives an id longer than 40 characters ("${id}").`;
  return null;
}

/*
 * Every answer can also arrive as a flag:
 *
 *   npm create @folienbaukasten/extension my-ext -- \
 *     --package @acme/deepseam-extension --name "Deep Seam" \
 *     --publisher "Acme GmbH" --provides theme,components
 *
 * Not a convenience bolted on afterwards — it is what makes the wizard
 * usable from a script, from CI, and by an assistant setting a project up on
 * somebody's behalf, which given what the template is *for* is a first-class
 * case rather than an edge one. It also makes it testable, and a scaffolder
 * nobody can test end to end is one that breaks silently.
 */
const flags = new Map<string, string>();
for (const [i, arg] of process.argv.slice(2).entries()) {
  const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
  if (!match) continue;
  flags.set(match[1]!, match[2] ?? process.argv.slice(2)[i + 1] ?? '');
}

/**
 * Interactive only on a terminal.
 *
 * `readline` hands out lines as they arrive: with piped stdin every line
 * lands before the second question is asked, and those questions then wait
 * for input that has already been and gone. Rather than buffer around that,
 * a non-TTY run must say everything in flags — and is told exactly which one
 * is missing instead of hanging.
 */
const interactive = stdin.isTTY === true;
const rl = interactive ? createInterface({ input: stdin, output: stdout }) : null;

async function ask(question: string, fallback = '', flag?: string): Promise<string> {
  const given = flag ? flags.get(flag) : undefined;
  if (given) return given.trim();
  if (!rl) {
    if (fallback) return fallback;
    console.error(`\nNot a terminal, so nothing can be asked. Pass --${flag ?? 'value'}.`);
    process.exit(1);
  }
  const answer = (await rl.question(fallback ? `${question} (${fallback}) ` : `${question} `)).trim();
  return answer || fallback;
}

async function askChoice<T extends string>(
  question: string,
  options: { value: T; label: string }[],
  flag?: string,
): Promise<T> {
  const given = flag ? flags.get(flag) : undefined;
  if (given) {
    const match = options.find((o) => o.value === given.trim());
    if (match) return match.value;
    console.error(
      `\n--${flag} must be one of: ${options.map((o) => o.value).join(', ')} (got "${given}")`,
    );
    process.exit(1);
  }
  if (!rl) return options[0]!.value;
  console.log(`\n${question}`);
  options.forEach((o, i) => console.log(`  ${i + 1}) ${o.label}`));
  for (;;) {
    const raw = (await rl.question(`  choose 1-${options.length} (1) `)).trim() || '1';
    const at = Number(raw);
    if (Number.isInteger(at) && at >= 1 && at <= options.length) return options[at - 1]!.value;
    console.log('  — not one of those.');
  }
}

async function collect(argvDir?: string): Promise<Answers> {
  console.log('\nA Folienbaukasten extension — a theme, slide types, or both.\n');

  const dir = path.resolve(argvDir || (await ask('Directory to create it in:', 'my-extension', 'dir')));
  if (existsSync(dir) && readdirSync(dir).length > 0) {
    console.error(`\n${dir} already exists and is not empty. Refusing to write into it.`);
    process.exit(1);
  }

  // The npm name first, because the id comes out of it and the id is the one
  // answer that is permanent.
  let packageName = '';
  for (;;) {
    packageName = await ask('\nnpm package name:', '', 'package');
    const problem = packageNameProblem(packageName);
    if (!problem) break;
    console.log(`  — ${problem}`);
  }
  const id = idFromPackageName(packageName);
  console.log(
    `  → extension id "${id}"\n` +
      '    Permanent: every deck written with this records it, and every slide type is\n' +
      '    namespaced under it. Publishing the npm name is what makes it yours.',
  );

  const name = await ask('\nDisplay name:', titleFrom(id), 'name');
  const description = await ask(
    'One line about it:',
    `${name}, a Folienbaukasten extension.`,
    'description',
  );
  const publisher = await ask('Publisher (shown in the install dialog):', 'Unknown', 'publisher');

  const provides = await askChoice(
    'What does it provide?',
    [
      { value: 'both', label: 'A theme and slide types — the full example (recommended)' },
      { value: 'theme', label: 'A theme only — colours, type, header and footer' },
      { value: 'components', label: 'Slide types only — portable across every theme' },
    ] as const,
    'provides',
  );

  return {
    dir,
    packageName,
    id,
    name,
    description,
    publisher,
    provides: provides === 'both' ? ['theme', 'components'] : [provides],
  };
}

/** Every placeholder the template carries, in one place. */
function substitutions(a: Answers): [RegExp, string][] {
  return [
    [/__PKGNAME__/g, a.packageName],
    [/__ID__/g, a.id],
    [/__NAME__/g, a.name],
    [/__DESCRIPTION__/g, a.description],
    [/__PUBLISHER__/g, a.publisher],
  ];
}

/** `acme.deepseam` → `Deep Seam`, a default worth offering rather than "My Extension". */
function titleFrom(id: string): string {
  return (id.split('.').pop() ?? id)
    .split('-')
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * Trim the template to what was asked for.
 *
 * A theme-only pack must not ship `components`, and a components-only pack
 * must not ship a stylesheet — `fbk-pack` rejects both, because a
 * components-only `set.css` would never be linked and a theme with no chrome
 * is not a theme. Doing the surgery here means the scaffold always packs.
 */
function prune(dir: string, provides: Answers['provides']): void {
  const drop = [
    ...(provides.includes('theme') ? [] : THEME_ONLY_FILES),
    ...(provides.includes('components') ? [] : COMPONENT_FILES),
  ];
  for (const rel of drop) {
    rmSync(path.join(dir, rel), { force: true });
  }
}

function scaffold(a: Answers): void {
  mkdirSync(a.dir, { recursive: true });
  cpSync(TEMPLATE, a.dir, { recursive: true });

  const subs = substitutions(a);
  for (const file of walk(a.dir)) {
    let body: string;
    try {
      body = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const [pattern, value] of subs) body = body.replace(pattern, value);
    writeFileSync(file, body);
  }

  prune(a.dir, a.provides);
  rewriteForProvides(a);
  // npm refuses to publish a `.gitignore` inside a package and renames it on
  // pack; shipping it as `gitignore` and restoring it here is the convention
  // every scaffolder uses for the same reason.
  const hidden = path.join(a.dir, 'gitignore');
  if (existsSync(hidden)) {
    cpSync(hidden, path.join(a.dir, '.gitignore'));
    rmSync(hidden, { force: true });
  }
}

/**
 * The two files whose *contents* depend on what the extension provides.
 *
 * Everything else is a whole file that is either present or absent; these
 * two mention both halves and have to be edited rather than dropped.
 */
function rewriteForProvides(a: Answers): void {
  const hasTheme = a.provides.includes('theme');
  const hasComponents = a.provides.includes('components');
  if (hasTheme && hasComponents) return;

  const packFile = path.join(a.dir, 'pack.json');
  const pack = JSON.parse(readFileSync(packFile, 'utf8')) as Record<string, unknown>;
  pack.provides = a.provides;
  if (!hasComponents) delete pack.components;
  writeFileSync(packFile, `${JSON.stringify(pack, null, 2)}\n`);

  const entry = path.join(a.dir, 'index.ts');
  let src = readFileSync(entry, 'utf8');
  if (!hasTheme) {
    src = src
      .replace(/^import '\.\/theme\.css';\n/m, '')
      .replace(/^import \{ Footer \}.*\n/m, '')
      .replace(/^import \{ Header \}.*\n/m, '')
      .replace(/^ {2}chrome: \{ Header, Footer \},\n/m, '');
  }
  if (!hasComponents) {
    src = src
      .replace(/^import \{ PricingSheet \}.*\n/m, '')
      .replace(/^import \{ Flow \}.*\n/m, '')
      .replace(/\n {2}\/\*\*\n(?: \*.*\n)*? \*\/\n {2}components: \{[\s\S]*?\n {2}\},\n/m, '\n');
  }
  writeFileSync(entry, src);

  const tsconfigFile = path.join(a.dir, 'tsconfig.json');
  const tsconfig = JSON.parse(readFileSync(tsconfigFile, 'utf8')) as { include: string[] };
  tsconfig.include = tsconfig.include.filter(
    (i) => hasComponents || (i !== 'components.ts' && i !== 'components'),
  );
  writeFileSync(tsconfigFile, `${JSON.stringify(tsconfig, null, 2)}\n`);
}

const argvDir = process.argv.slice(2).find((a) => !a.startsWith('-'));
const answers = await collect(argvDir);
scaffold(answers);
rl?.close();

const rel = path.relative(process.cwd(), answers.dir) || '.';
console.log(`
Created ${rel}

  cd ${rel}
  npm install
  npm run check      every compatibility check, in one pass
  npm run pack       → dist/${answers.id}-1.0.0.fbkset

Then double-click that file: the app installs it. Read README.md first —
it is written to be handed to whoever, or whatever, is doing the writing.
`);
