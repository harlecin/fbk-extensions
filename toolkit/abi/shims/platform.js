// Injected in place of `@folienbaukasten/platform` — the surface a theme pack
// is allowed to build against (src/sets/platform.ts). Resolved at load time
// from the app's own module instances, so a pack shares the platform's React
// components rather than carrying a snapshot of them.
//
// The lists below have to name every VALUE export of src/sets/platform.ts —
// ESM named exports cannot be spread from a runtime object. Miss one and
// `npm run pack:set` fails on that name, which is the intended failure: it
// is loud, and it happens to whoever added the export.
const runtime = globalThis.__FBK_SET_RUNTIME__;
if (!runtime) {
  throw new Error('This theme was loaded without the Folien Baukasten set runtime.');
}
const platform = runtime.platform;

// Every value export of src/sets/platform.ts, named so it can be re-exported.
const NAMES = [
  'Block', 'BlockArrow', 'Card', 'ChartView', 'ContentSlide', 'DriverTree',
  'FindingsBanner', 'HarveyBall', 'HARVEY_SIZE_PX', 'HARVEY_STROKE_PX',
  'InsightRail', 'KpiTile', 'Matrix', 'QuoteColumn', 'SlideFrame',
  'SourceLine', 'Table', 'Timeline', 'formatNumber', 'headerTitle',
  'platformDefaults', 'SLIDE_HEIGHT', 'SLIDE_WIDTH',
  'bandCentre', 'bandCentreX', 'bandCentreY', 'spreadLabels', 'valueY',
  'LABEL_MIN_GAP',
];

// A theme built against a NEWER app than the one loading it destructures
// `undefined` here and dies later, inside React, as a blank slide with no
// clue attached. Fail at load instead, naming what is missing: the loader
// already has a path for a theme that will not load (the deck renders in
// the default theme and the slides say so), and "the app is older than the
// theme" is something a person can act on.
const missing = NAMES.filter((name) => platform[name] === undefined);
if (missing.length > 0) {
  throw new Error(
    `This theme needs platform features this app does not have: ${missing.join(', ')}. ` +
      'The app is older than the theme — update the app, or install a build of the ' +
      'theme made for it.',
  );
}

export const {
  Block, BlockArrow, Card, ChartView, ContentSlide, DriverTree, FindingsBanner,
  HarveyBall, HARVEY_SIZE_PX, HARVEY_STROKE_PX, InsightRail, KpiTile, Matrix,
  QuoteColumn, SlideFrame, SourceLine, Table, Timeline, formatNumber,
  headerTitle, platformDefaults, SLIDE_HEIGHT, SLIDE_WIDTH,
  bandCentre, bandCentreX, bandCentreY, spreadLabels, valueY, LABEL_MIN_GAP,
} = platform;
