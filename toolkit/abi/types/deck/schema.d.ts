import type { DataSource } from './data.ts';
export type { CellValue, DataRef, DataSheet, DataSource } from './data.ts';
/** Slide canvas in CSS pixels. Maps 1:1 to a 13.333in × 7.5in (16:9) PPTX
 * slide at 96 DPI. */
export declare const SLIDE_WIDTH = 1280;
export declare const SLIDE_HEIGHT = 720;
/** 914400 EMU per inch / 96 px per inch. */
export declare const EMU_PER_PX = 9525;
export interface DeckMeta {
    title: string;
    /**
     * One line saying what this deck is for. Shown as the subtitle of a
     * starter-deck card in the New deck dialog, which is where a theme's
     * templates are chosen — `tools/pack-set.ts` reads it straight off the
     * deck when it builds the pack manifest, so a template describes itself
     * rather than being described somewhere else that can drift.
     */
    description?: string;
    author?: string;
    /** ISO date, e.g. "2026-08-16". Formatting is a renderer concern. */
    date?: string;
    /** Footer text shown on every content slide (e.g. confidentiality note). */
    footer?: string;
    /**
     * Small mark shown in the header of every content slide, where the active
     * theme has a place for one. Root-relative like every other image URL
     * (`/logo.svg`, `/project/assets/logo.png`); themes without a logo slot
     * ignore it, which is why it is optional and never a layout prop.
     */
    logoUrl?: string;
    /** Component set that defines this deck's layouts. Default "consulting". */
    componentSet?: string;
    /**
     * Display name of an *installed* theme this deck was written in, recorded
     * so a machine that lacks the theme can say "This deck uses Acme Theme by
     * Acme GmbH" instead of "unknown component set 'acme'". Never set for
     * built-in themes — the recipient has those.
     */
    componentSetName?: string;
    /** Publisher of the installed theme, for the same message. */
    componentSetPublisher?: string;
    /**
     * Version of an *installed* theme (ui.md A9) this deck was written against,
     * e.g. "2.1.0". Only its major matters: fixes and additions inside a major
     * are picked up automatically, while a theme that changes how slides look
     * ships a new major and installs beside the old one — so a deck someone has
     * already presented keeps rendering as it did until they choose otherwise.
     * Absent (the normal case, and every deck in a built-in theme) means "the
     * newest installed".
     */
    componentSetVersion?: string;
    /**
     * Web Mode: the deck trades its PowerPoint export for
     * the whole browser. A validation profile, not a rendering mode — when
     * true, the web-only vocabulary (extra chart types, web-only extension
     * components) validates, and PPTX export is refused with a clear message.
     * Absent or false = PowerPoint mode = the strict profile. Toggled by the
     * editor's "Activate Web Mode" button, never by the model.
     */
    webMode?: boolean;
}
/** A slide as the platform sees it; the selected component set gives
 * `layout` meaning and types `props`. */
export interface SlideSpec {
    layout: string;
    props: unknown;
}
export interface Deck {
    meta: DeckMeta;
    slides: SlideSpec[];
    /**
     * Workbook data imported into this deck (src/deck/data.ts). Any prop in
     * any slide may be a `{ "$ref": "source!Sheet!A1:D9" }` pointer into it
     * instead of a literal; every render path resolves the deck before it
     * renders, so components never see a ref.
     */
    data?: DataSource[];
}
/** Action title + sub-action title shown at the top of content slides. */
export interface HeaderSpec {
    /**
     * A substring of `title` to render in the theme's highlight colour — the
     * one phrase the slide turns on ("what we *found*"). Must appear in the
     * title verbatim; ignored when it does not. One phrase per slide: a
     * highlight that repeats stops being one.
     */
    highlight?: string;
    title: string;
    subtitle?: string;
    /** Short category label above the title, e.g. "Market entry" — a few words,
     * not a sentence. Sets that have no place for one ignore it. */
    kicker?: string;
}
/** Harvey ball fill level in quarters. */
export type HarveyValue = 0 | 25 | 50 | 75 | 100;
/**
 * A content block. `box` is the neutral container, `callout` the
 * accent-colored findings box. Body strings are separate paragraphs.
 */
export interface BlockSpec {
    title?: string;
    body: string | string[];
    /**
     * Bulleted points under the body. Use for parallel items a reader scans
     * (evidence, criteria, steps); keep prose in `body`. Both may appear —
     * body sets up the point, bullets enumerate it.
     */
    bullets?: string[];
    variant?: 'box' | 'callout';
    /** Optional harvey-ball rating rendered next to the block title. */
    rating?: HarveyValue;
}
/** Findings/recommendation banner: accent label segment + statement bar. */
export interface FindingSpec {
    /** Label in the accent segment. Default "Findings". */
    label?: string;
    text: string;
}
/** One KPI stat tile. */
export interface KpiSpec {
    /** Rendered uppercase. */
    label: string;
    /** Numbers are formatted per valueStyle; strings pass through. */
    value: number | string;
    valueStyle?: 'plain' | 'compact' | 'percent';
    /** Fraction, e.g. 0.42 → "▲ 42%"; sign picks the arrow. */
    delta?: number;
    /** Context after the delta, e.g. "vs PY". */
    deltaLabel?: string;
    /** Which direction is good (colors the delta). Default 'up'; churn-like
     * metrics use 'down' so a falling value shows green. */
    deltaGood?: 'up' | 'down';
    /**
     * The run behind the number, oldest first, and ENDING AT THE PERIOD
     * `value` REPORTS — the last point is the same figure the tile shows, in
     * the same units. A series that ends anywhere else draws a line that
     * contradicts the number printed above it, which is worse than no line.
     *
     * Supply the readings only. Every coordinate is derived from them: the run
     * is normalised to its own min and max, so units never matter and no axis
     * is drawn. Do not compute positions, percentages or a path.
     *
     * A delta says the number moved; a sparkline says how it moved, and the
     * two answer different objections. Six to eight points read cleanly; fewer
     * looks arbitrary, more turns to noise at tile size.
     *
     * @minItems 2
     */
    series?: number[];
    /**
     * Goal for the period, in the value's units. Draws a meter under the
     * number instead of a sparkline, and turns "24.3M" into "24.3M of the 30M
     * we committed to".
     *
     * `deltaGood` sets which way the goal reads. The default 'up' makes it a
     * TARGET to reach, and the meter fills toward it. 'down' makes it a CAP
     * not to breach — the meter then fills with how much of the allowance is
     * spent, and going over reads in the negative colour instead of showing a
     * full bar, which is what a churn figure at 140% of its goal would
     * otherwise look like.
     *
     * A tile takes a sparkline or a meter, not both — two rows of geometry
     * under one number is the point at which a tile stops being readable from
     * the third row. `series` wins if a deck sets both.
     */
    target?: number;
    /** One short line under the number: the caveat, the denominator, the
     * thing an audience asks about before it believes the figure. */
    note?: string;
    /** The one tile the slide is actually about — drawn in the theme's
     * emphasis treatment. Marking every tile marks none. */
    emphasis?: boolean;
}
/** One numbered entry of an agenda / table of contents. */
export interface AgendaItemSpec {
    title: string;
    /** Optional one-line detail under the topic. */
    note?: string;
}
/** One box on a 2×2 matrix. */
export interface MatrixPointSpec {
    label: string;
    /** Horizontal position, 0 (left) – 100 (right). */
    x: number;
    /** Vertical position, 0 (bottom) – 100 (top). */
    y: number;
    /** Draws the box in the accent color — the option being argued for. */
    emphasis?: boolean;
}
/**
 * 2×2 positioning matrix: two named axes, optional quadrant captions and the
 * boxes placed on it. Five to eight points stay readable; beyond that the
 * boxes start to overlap, which the renderer will not resolve for you.
 */
export interface MatrixSpec {
    /** Axis names, rendered at the low→high end of each axis. */
    xAxis: string;
    yAxis: string;
    /** Quadrant captions, clockwise from top-left. */
    quadrants?: [string, string, string, string];
    points: MatrixPointSpec[];
}
/** One branch of a driver tree. */
export interface DriverSpec {
    title: string;
    /** Separate paragraphs, as in BlockSpec. */
    body?: string | string[];
}
/** A verbatim quote with its attribution. */
export interface QuoteSpec {
    text: string;
    /** Who said it, e.g. "CFO, mid-market retailer". */
    attribution?: string;
}
/** One themed column of quotes. `tone` colors the column's accent bar. */
export interface QuoteColumnSpec {
    title: string;
    tone?: 'positive' | 'negative';
    quotes: QuoteSpec[];
}
/** One numbered chapter on a section-divider slide. */
export interface ChapterSpec {
    title: string;
    /** One or two lines on what the chapter covers. */
    body?: string;
}
/** One card in a card grid. */
export interface CardSpec {
    title?: string;
    body: string | string[];
    /** Accent bar + tinted fill — the card that carries the argument. */
    emphasis?: boolean;
}
/** One entry of the insight rail: an accent lead-in and its explanation. */
export interface InsightSpec {
    label: string;
    text: string;
}
/** One event on a timeline, in chronological order. */
export interface TimelineEventSpec {
    /** Short date or phase label, e.g. "Q1 2027". Display string. */
    date?: string;
    title: string;
    /** Why the event matters — one or two lines. */
    body?: string;
}
/**
 * `line`, `bar`, `stacked-bar` and `waterfall` work in every deck — they map
 * to native PowerPoint charts. `pie`, `donut` and `radar` are **Web Mode
 * only**: they render in the browser (preview, HTML and
 * PDF export) but have no faithful pptxgenjs counterpart, so a PowerPoint
 * mode deck rejects them at validation.
 */
export type ChartType = 'line' | 'bar' | 'stacked-bar' | 'waterfall' | 'pie' | 'donut' | 'radar';
/**
 * A colour slot, resolved by the theme — never a literal colour. `series`
 * is the series' own place in the theme's ramp; `accent` is the theme's
 * accent (`--color-accent`) for the one series that carries the argument;
 * the rest are the tokens a controlling chart reasons in ("this point is
 * bad news"), so a deck says what a mark *means* and the set says what
 * that looks like.
 */
export type ChartTone = 'series' | 'positive' | 'negative' | 'neutral' | 'muted' | 'accent';
export interface ChartSeries {
    name: string;
    /**
     * One value per category. `null` is a gap — a plan that stops where the
     * forecast starts, an actual that has not happened yet. A line breaks
     * there; a bar is simply absent. Never write 0 to mean "no value".
     */
    values: Array<number | null>;
    /**
     * How the series is painted, bar-like types only. `hollow` is an outline
     * with no fill, `hatched` a diagonal pattern — between them, plus solid
     * and a tone, every IBCS scenario notation (actual, previous year, plan,
     * forecast) can be expressed without the platform knowing what a scenario
     * is.
     */
    fill?: 'solid' | 'hollow' | 'hatched';
    /** Colour slot for the whole series. Default: the theme's ramp. */
    tone?: ChartTone;
    /**
     * Colour slot per point; `null` keeps the series colour. What a variance
     * series needs: the same bar is good news or bad news by point, and the
     * sign alone does not say which.
     */
    pointTones?: (ChartTone | null)[];
    /** Dashed stroke, line charts only — a series that is not actual. */
    dash?: boolean;
}
/**
 * Which way a bar chart reads. `columns` is vertical (the default);
 * `bars` is horizontal, first category at the TOP — the shape a variance
 * breakdown reads in. Line charts ignore it.
 */
export type ChartOrientation = 'columns' | 'bars';
/**
 * The inner plot rect as fractions of the chart box (see
 * `ChartSpec.plotArea`). Re-declared here rather than imported so the deck
 * schema stays one file for the JSON-Schema generator.
 */
export interface PlotArea {
    /** @minimum 0 @maximum 1 */
    x: number;
    /** @minimum 0 @maximum 1 */
    y: number;
    /** @minimum 0 @maximum 1 */
    w: number;
    /** @minimum 0 @maximum 1 */
    h: number;
}
/**
 * Our own chart contract — never raw ECharts options — so the same data
 * renders identically in ECharts (HTML) and as a native PPTX chart.
 *
 * Waterfall: exactly one series whose values are deltas. Indices listed in
 * `totalIndices` are checkpoint bars drawn from zero showing the running
 * total; their value is ignored except at index 0, where it seeds the start.
 * `pointTones` on that series recolours individual bars — how a cost bridge
 * says that a decrease is the good news (default: increase `positive`,
 * decrease `negative`, totals `neutral`).
 *
 * Pie/donut: one series; `categories` name the slices, the series values
 * size them. Radar: `categories` are the spokes, each series one polygon.
 */
export interface ChartSpec {
    type: ChartType;
    categories: string[];
    series: ChartSeries[];
    /** How values are formatted on axes and labels. percent expects fractions. */
    valueStyle?: 'plain' | 'compact' | 'percent';
    showDataLabels?: boolean;
    /** Bar/stacked-bar only. Default `columns`. */
    orientation?: ChartOrientation;
    /**
     * Pins the inner plot rect — the data area, excluding axis labels — as
     * fractions of the chart's own box. Both renderers take the same four
     * numbers (ECharts an explicit `grid`, PowerPoint a `<c:manualLayout>`
     * with `layoutTarget="inner"`), so the position of a category band stops
     * being each renderer's private business and becomes arithmetic anyone
     * can repeat — which is what lets something OUTSIDE the chart line up
     * with the bars (`src/charts/geometry.ts`).
     *
     * Leave it out and each renderer auto-fits, which looks better on its own
     * and cannot be aligned against. Set it, and leave room: axis labels are
     * drawn outside this rect, so long category names want a bigger `x`.
     */
    plotArea?: PlotArea;
    /** Line charts: draw a symbol at each data point. Default true. */
    showSymbol?: boolean;
    /**
     * Where the value axis starts. Default `zero` — a truncated axis is the
     * commonest way a chart misleads, so `auto` has to be asked for.
     */
    baseline?: 'zero' | 'auto';
    /**
     * Explicit value-axis bounds — the words a shared scale is made of. A
     * grid of small multiples that does not pass the same `valueMax` to every
     * chart is nine different rulers. `valueMin` overrides `baseline`.
     */
    valueMin?: number;
    valueMax?: number;
    /**
     * Distance between gridlines, in value units. Pin it alongside `valueMax`
     * or each renderer picks its own ladder and then draws the pinned maximum
     * as an extra tick on top of the one nearest it — two labels in the same
     * three pixels at the top of the chart.
     */
    valueStep?: number;
    /**
     * Default true. `false` deletes the value axis AND its gridlines, in both
     * renderers — the IBCS look is labels on the marks and no axis furniture,
     * and it is also what lets two stacked charts align: with no value-axis
     * labels there is no label width to disagree about.
     */
    showValueAxis?: boolean;
    /** Default true. `false` for the upper panel of a pair that shares its
     * category axis with the chart below it. */
    showCategoryAxis?: boolean;
    /** Default: shown when there is more than one series. */
    showLegend?: boolean;
    /**
     * Line charts only: print each series' value at its last non-null point.
     * The renderer places the label — no coordinate of ours is involved. The
     * IBCS way to read a trend without hunting through a legend.
     */
    endLabels?: boolean;
    /**
     * Gap between bars as a percentage of bar width (PowerPoint's own unit,
     * mirrored into ECharts). Lower is fatter; 0 makes bars touch.
     * @minimum 0
     * @maximum 500
     */
    barGapPct?: number;
    /**
     * Overlap between adjacent bars WITHIN one category group, in
     * PowerPoint's unit: 0 (the default) makes them touch — the IBCS pair —
     * negative opens a gap, positive overlaps them.
     * @minimum -100
     * @maximum 100
     */
    barOverlapPct?: number;
    /** waterfall only */
    totalIndices?: number[];
}
/**
 * A slide body supplied by an installed extension: a bespoke pricing sheet, framework
 * diagram, disclosure block. The platform hosts it in the `component`
 * layout's body region; it cannot touch the chrome bands.
 */
export interface SlideComponentSpec {
    /**
     * Namespaced component kind, `<extension-id>/<component-name>` — e.g.
     * "acme/pricing-sheet". The namespace makes collisions impossible and
     * tells the install prompt where the component comes from.
     * @pattern ^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$
     */
    kind: string;
    /** Props for the component, validated against the schema its extension
     * ships. Unvalidated when the extension is not installed. */
    props?: unknown;
}
/** A table cell: text, a number (formatted per column), or a harvey ball. */
export type TableCell = string | number | {
    harvey: HarveyValue;
};
export interface TableColumn {
    header: string;
    /** Default: numbers right, harvey center, text left. */
    align?: 'left' | 'center' | 'right';
    /** Formatting for numeric cells in this column. */
    valueStyle?: 'plain' | 'compact' | 'percent';
}
export interface TableSpec {
    columns: TableColumn[];
    rows: TableCell[][];
}
