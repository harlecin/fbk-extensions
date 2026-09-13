/**
 * The platform surface an installed theme pack builds against (ui.md A9).
 *
 * A compiled-in set under src/sets/ imports whatever it likes by relative
 * path. A pack cannot: it is built separately, ships as one prebuilt ESM
 * file, and has to keep working against a later app. So the things a theme
 * may reach for are enumerated here, and this module *is* the ABI — adding
 * to it is a minor `PLATFORM_ABI` bump, removing from it a major one.
 *
 * Pack code imports it as `@folienbaukasten/platform`; tools/pack-set.ts
 * rewrites that specifier to a shim reading the live objects off
 * `globalThis` (src/sets/runtime.ts), because a pack cannot bundle its own
 * React — two React copies in one page is two renderers, and the shared
 * components below would be built by the wrong one.
 *
 * Everything here is *rendering* surface. Nothing gives a theme access to
 * the project, the file system, or IPC — a theme styles slides.
 */
export { Block } from '../components/Block';
export { BlockArrow } from '../components/BlockArrow';
export { Card } from '../components/Card';
export { ChartView } from '../components/ChartView';
export { DriverTree } from '../components/DriverTree';
export { FindingsBanner } from '../components/FindingsBanner';
export { HarveyBall, HARVEY_SIZE_PX, HARVEY_STROKE_PX } from '../components/HarveyBall';
export { headerTitle } from '../components/HeaderTitle';
export { InsightRail } from '../components/InsightRail';
export { KpiTile } from '../components/KpiTile';
export { Matrix } from '../components/Matrix';
export { QuoteColumn } from '../components/QuoteColumn';
export { SourceLine } from '../components/SourceLine';
export { Table } from '../components/Table';
export { Timeline } from '../components/Timeline';
export { ContentSlide } from '../components/slide/ContentSlide';
export { SlideFrame } from '../components/slide/SlideFrame';
export { platformDefaults } from '../components/slide/registry';
export { formatNumber } from '../lib/format';
export { SLIDE_HEIGHT, SLIDE_WIDTH } from '../deck/schema';
export { bandCentre, bandCentreX, bandCentreY, spreadLabels, valueY, LABEL_MIN_GAP, } from '../charts/geometry';
export type { ComponentSet, SetChrome, SlideView, SlideViewProps, LayoutName } from './types';
export type { NumberFormatOptions, NumberStyle } from '../lib/format';
export type * from '../deck/layouts';
export type { DeckMeta, HeaderSpec, SlideSpec } from '../deck/schema';
export type { PlotArea } from '../charts/geometry';
export type { ChartOrientation, ChartSeries, ChartSpec, ChartTone, ChartType, } from '../deck/schema';
