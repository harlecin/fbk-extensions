import type { AgendaItemSpec, BlockSpec, CardSpec, ChapterSpec, ChartSpec, DriverSpec, FindingSpec, HeaderSpec, InsightSpec, KpiSpec, MatrixSpec, QuoteColumnSpec, QuoteSpec, SlideComponentSpec, TableSpec, TimelineEventSpec } from './schema';
/** The complete layout vocabulary — every set renders every one of these. */
export type SharedSlide = TitleSlideSpec | SplitSlideSpec | FreeformSlideSpec | TwoBlockSlideSpec | WhileArrowSlideSpec | ChartSlideSpec | TableSlideSpec | AgendaSlideSpec | TimelineSlideSpec | KpiSlideSpec | MatrixSlideSpec | DriverTreeSlideSpec | QuoteSlideSpec | QuotesSlideSpec | ChaptersSlideSpec | CardsSlideSpec | ComponentSlideSpec | WebSlideSpec;
/** Opening slide: heading, byline and an optional figure. The optional
 * fields are the union of what sets render — a set's title view ignores the
 * ones it has no place for. */
export interface TitleSlideSpec {
    layout: 'title';
    props: {
        /** Small uppercase line above the heading, e.g. "Strategic review". */
        eyebrow?: string;
        heading: string;
        subheading?: string;
        /** Short framing labels under the subtitle, e.g. scope or workstreams. */
        chips?: string[];
        author?: string;
        /** Display string; formatting is the author's choice. */
        date?: string;
        /** Title figure on the right side. Whether it is bled to the edge
         * (cover) or shown whole (contain) is the set's choice. */
        imageUrl?: string;
    };
}
/** Two content blocks side by side — the workhorse comparison/detail slide. */
export interface TwoBlockSlideSpec {
    layout: 'two-block';
    props: {
        header: HeaderSpec;
        left: BlockSpec;
        right: BlockSpec;
        finding?: FindingSpec;
        source?: string;
    };
}
/** "While a … (left) we need to consider b (right)", joined by a blade. */
export interface WhileArrowSlideSpec {
    layout: 'while-arrow';
    props: {
        header: HeaderSpec;
        left: BlockSpec;
        /** Rendered with `left`'s variant: the two halves are one sentence
         * across an arrow, so they always share a treatment. */
        right: BlockSpec;
        finding?: FindingSpec;
        source?: string;
    };
}
/** One chart given the whole body — bar, stacked-bar, line or waterfall. */
export interface ChartSlideSpec {
    layout: 'chart';
    props: {
        header: HeaderSpec;
        chart: ChartSpec;
        finding?: FindingSpec;
        source?: string;
    };
}
/** A data table filling the body; cells hold text, numbers or harvey balls. */
export interface TableSlideSpec {
    layout: 'table';
    props: {
        header: HeaderSpec;
        table: TableSpec;
        finding?: FindingSpec;
        source?: string;
    };
}
/** Agenda / table of contents: numbered topics on hairline-separated rows,
 * with an optional picture column. Four to six items read best. */
export interface AgendaSlideSpec {
    layout: 'agenda';
    props: {
        header: HeaderSpec;
        items: AgendaItemSpec[];
        /** Picture on the right side (object-fit: cover), as on the title slide. */
        imageUrl?: string;
    };
}
/** Chronology on a horizontal axis; events alternate above and below it.
 * Three to six events fit; more crowd the columns. */
export interface TimelineSlideSpec {
    layout: 'timeline';
    props: {
        header: HeaderSpec;
        events: TimelineEventSpec[];
        finding?: FindingSpec;
        source?: string;
    };
}
/**
 * A row of big-number KPI tiles with labels and optional deltas, over
 * supporting blocks that say what the numbers mean.
 *
 * The tiles alone do not make a slide — four figures floating in the body
 * region read as a fragment. `blocks` is what turns the headline numbers
 * into an argument, and it is where the "so what" belongs; two or three is
 * the natural width. It stays optional so a bare KPI row still renders (the
 * tiles then sit at the top of the body, never centred in it).
 */
export interface KpiSlideSpec {
    layout: 'kpis';
    props: {
        header: HeaderSpec;
        kpis: KpiSpec[];
        /** Supporting "so what" blocks under the tiles. Two or three. */
        blocks?: BlockSpec[];
        finding?: FindingSpec;
        source?: string;
    };
}
/** Options placed on two named axes — the "where do we play" slide. */
export interface MatrixSlideSpec {
    layout: 'matrix';
    props: {
        header: HeaderSpec;
        matrix: MatrixSpec;
        finding?: FindingSpec;
        source?: string;
    };
}
/** One root metric decomposed into the levers that move it. Three branches
 * is the natural width; two and four also fit. */
export interface DriverTreeSlideSpec {
    layout: 'driver-tree';
    props: {
        header: HeaderSpec;
        /** The metric being decomposed, shown in the accent root box. */
        root: string;
        branches: DriverSpec[];
        finding?: FindingSpec;
        source?: string;
    };
}
/** A single quote given the whole slide — the one voice worth pausing on. */
export interface QuoteSlideSpec {
    layout: 'quote';
    props: {
        /** Optional: a bare quote with no action title is a legitimate beat. */
        header?: HeaderSpec;
        quote: QuoteSpec;
        source?: string;
    };
}
/** Verbatim voice-of-customer evidence in two themed columns. */
export interface QuotesSlideSpec {
    layout: 'quotes';
    props: {
        header: HeaderSpec;
        columns: QuoteColumnSpec[];
        finding?: FindingSpec;
        source?: string;
    };
}
/** Section divider: the numbered chapters the deck is about to walk through.
 * Two to four chapters; the columns get cramped beyond that. */
export interface ChaptersSlideSpec {
    layout: 'chapters';
    props: {
        header: HeaderSpec;
        chapters: ChapterSpec[];
    };
}
/** A grid of cards. Two to six cards; `columns` overrides the automatic
 * choice (3 for four or more cards, otherwise one column per card). */
export interface CardsSlideSpec {
    layout: 'cards';
    props: {
        header: HeaderSpec;
        cards: CardSpec[];
        columns?: 2 | 3;
        /** Optional 3-up takeaway strip under the grid. */
        insights?: InsightSpec[];
        finding?: FindingSpec;
        source?: string;
    };
}
/** A slide whose whole body is one extension-supplied component (a bespoke
 * pricing sheet, framework diagram, …). Only useful when the extension that
 * ships the named kind is installed; without it the body shows an install
 * placeholder and the deck still renders. */
export interface ComponentSlideSpec {
    layout: 'component';
    props: {
        header: HeaderSpec;
        component: SlideComponentSpec;
        source?: string;
    };
}
/** A slide body the model authors directly, as a web page fragment.
 *
 * The body rectangle only: header, footer, slide number and canvas belong to
 * the theme, and the palette reaches the markup as CSS custom properties
 * already resolved for the active set — so a web body still follows a theme
 * swap. Raw colours and font faces are rejected for exactly that reason;
 * everything else CSS can do is open, which is the point of the layout.
 *
 * Web Mode only — a hand-authored layout cannot be measured into PowerPoint
 * shapes, so this is the one layout with no PPTX story at all.
 *
 * Reach for it when the vocabulary genuinely cannot draw the slide: a hero,
 * an opener, a diagram. A deck of hand-written bodies has no theme and no
 * consistency, which is what the layouts are for. */
export interface WebSlideSpec {
    layout: 'web';
    props: {
        header: HeaderSpec;
        /** The body's markup. A fragment, not a document: no <html>, <head>,
         * <script>, <style> or <iframe>, and no network URLs. Tag the meaningful
         * elements `data-pptx` ("text", "shape", "image", …) so the picker lands
         * on them. */
        html: string;
        /** Author styles, injected as one <style> block scoped to this slide's
         * body — selectors cannot reach another slide or the chrome. Theme
         * tokens are already declared: use them (var(--color-accent),
         * var(--font-family)); raw colours and font families are rejected. */
        css?: string;
        /** The body's editable copy, keyed by name. An element written as
         * `<h2 data-edit="text.headline"></h2>` shows `text.headline` and stays
         * double-click editable in the editor — which also means a wording
         * change is a one-key write, not a rewrite of the markup. */
        text?: Record<string, string>;
        /** Own the whole 1280×720 canvas instead of the body band — for a
         * full-bleed section opener. The theme's footer still paints over it, so
         * keep the bottom strip clear. */
        bleed?: boolean;
        /** Draw the theme's footer. Default true, and only meaningful under
         * `bleed` — a banded body always reserves the footer's strip, so there
         * is nothing to decide there.
         *
         * It exists for the converted cover. A `title` slide is the one layout
         * that signs nothing: no page number, no deck note. Converting one has
         * to be able to say that, or every cover comes back from the conversion
         * wearing a footer it never had. */
        footer?: boolean;
        finding?: FindingSpec;
        source?: string;
    };
}
/** One chart. */
export interface ChartSlot {
    kind: 'chart';
    chart: ChartSpec;
}
/** One table. */
export interface TableSlot {
    kind: 'table';
    table: TableSpec;
}
/** One content block — the card/callout box. */
export interface BlockSlot {
    kind: 'block';
    block: BlockSpec;
}
/** A stack of KPI tiles. In a split slot two or three fit and four get
 * cramped; in a freeform item they fill the item's width, so let the area
 * say how many. */
export interface KpisSlot {
    kind: 'kpis';
    kpis: KpiSpec[];
}
/** A horizontal timeline — the events alternate above and below the axis,
 * so give it a wide, short area. Freeform only: a timeline in half a slide
 * reads as a list. */
export interface TimelineSlot {
    kind: 'timeline';
    events: TimelineEventSpec[];
}
/** A 2×2 positioning matrix. Wants a near-square area — it has two axes to
 * label and a plot that only reads square. Freeform only. */
export interface MatrixSlot {
    kind: 'matrix';
    matrix: MatrixSpec;
}
/** One or more quote columns under their accent bars. Freeform only; reach
 * for it when verbatim evidence sits beside something else on the slide. */
export interface QuotesSlot {
    kind: 'quotes';
    columns: QuoteColumnSpec[];
}
/** The takeaway strip: equal columns under a hairline rule. A full-width
 * band, so give it the whole body width and little height. Freeform only. */
export interface InsightsSlot {
    kind: 'insights';
    insights: InsightSpec[];
}
/** A driver tree: the root metric on the left, its branches on the right.
 * Freeform only — the root column is a fixed width, so a narrow area leaves
 * the branches nothing. */
export interface DriverTreeSlot {
    kind: 'driver-tree';
    /** The metric being decomposed. */
    root: string;
    branches: DriverSpec[];
}
/** A component an installed extension provides, by namespaced kind — the
 * same reference the `component` layout takes, so a pack component can be
 * one item among many instead of owning the whole body. Without the
 * extension the item shows the install placeholder and the .pptx export is
 * refused rather than written blank. Freeform only. */
export interface ExtensionSlot {
    kind: 'extension';
    component: SlideComponentSpec;
}
/** One side of a split slide — exactly one kind of content. The four that
 * survive half a slide; the rest of the vocabulary is in `SlotSpec`. */
export type SplitSlotSpec = ChartSlot | TableSlot | BlockSlot | KpisSlot;
/** Everything a slot can be. A freeform `component` item takes one of
 * these; `split` takes the narrower `SplitSlotSpec`. */
export type SlotSpec = SplitSlotSpec | TimelineSlot | MatrixSlot | QuotesSlot | InsightsSlot | DriverTreeSlot | ExtensionSlot;
/** Two independent content slots side by side — a chart next to the table
 * behind it, KPIs beside the trend they summarize, a block arguing what the
 * evidence next to it shows. The composition slide for pairings the fixed
 * layouts don't cover; prefer a fixed layout when one fits. */
export interface SplitSlideSpec {
    layout: 'split';
    props: {
        header: HeaderSpec;
        left: SplitSlotSpec;
        right: SplitSlotSpec;
        /** Width ratio left:right. Default '1:1'; give a chart or table the
         * wider side. */
        ratio?: '1:1' | '1:2' | '2:1';
        finding?: FindingSpec;
        source?: string;
    };
}
/** Where a freeform item sits: fractional placement inside the slide's
 * body region (between the header and footer bands), each value a percent
 * of the body's width or height. Items may overlap; later items draw on
 * top. Spacing between items is the author's choice — nothing is inserted
 * automatically, so leave gutters where the design wants them. */
export interface FreeformAreaSpec {
    /** Left edge, % of body width; x + w must stay ≤ 100.
     * @minimum 0
     * @maximum 100 */
    x: number;
    /** Top edge, % of body height; y + h must stay ≤ 100.
     * @minimum 0
     * @maximum 100 */
    y: number;
    /** Width, % of body width.
     * @exclusiveMinimum 0
     * @maximum 100 */
    w: number;
    /** Height, % of body height.
     * @exclusiveMinimum 0
     * @maximum 100 */
    h: number;
}
/** Type-scale steps a freeform item's text may name — theme steps, never px.
 * One list for all three kinds of label: a `text` run, a `box`'s centred
 * label and a `shape`'s. A second copy of the union is how a callout ends up
 * offering a size the renderer has never heard of.
 *
 * `xs` is the caption step the theme has always defined and this list used
 * to stop short of. It was added because the flow→freeform conversion needs
 * it: a source line is set at `--text-xs`, and with the smallest name
 * available being `sm` the conversion had to round it UP — so converting a
 * slide grew its source line by 2px, which is exactly the kind of silent
 * shift that makes a converted slide read as subtly wrong. Reach for it for
 * captions and footnotes, not for body copy. */
export type FreeformTextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
/**
 * Every colour the theme defines, as one palette.
 *
 * Text and fills used to draw from two lists of different widths — a caption
 * could be `positive` green while a box could not be filled with it, for no
 * reason anyone chose. One palette, and what a token is *for* is the
 * author's business: the inspector paints each swatch in the colour this set
 * resolves it to, so the choice is made by looking rather than by guessing
 * what a name means.
 *
 * Readability is deliberately not enforced. A `faint` label on a `faint` box
 * is unreadable and is also nobody's business but the author's — the swatch
 * showed them both. What the platform still guarantees is that these are
 * TOKENS: a deck survives a set swap, and the exporter resolves every one to
 * a real PowerPoint fill.
 */
export type FreeformColor = 'text' | 'muted' | 'faint' | 'inverse' | 'accent' | 'accent-deep' | 'accent-soft' | 'positive' | 'negative' | 'bg' | 'box' | 'box-border' | 'edge-muted' | 'highlight' | 'highlight-soft' | 'highlight-deep';
/** Text colors a freeform item may name — the whole palette. */
export type FreeformTextColor = FreeformColor;
/** Fills a freeform box may name — theme tokens, never raw colors. */
/** Fills a freeform box may name: the palette, plus `none` for no fill at
 * all — which is a box's own state rather than a colour, and the one thing
 * text has no use for. */
export type FreeformBoxFill = FreeformColor | 'none';
/** Gradient fills — box only (the SVG preset shapes stay solid). Each is a
 * theme-defined two-stop gradient: `accent-gradient` the saturated hero/tile
 * wash (labels render inverse), `soft-gradient` a barely-there panel wash. */
export type FreeformGradientFill = 'accent-gradient' | 'soft-gradient';
/** Corner rounding steps a freeform box may name — theme radii, never px.
 * `pill` fully rounds the shorter edge (stadium/capsule). */
export type FreeformRadius = 'none' | 'sm' | 'md' | 'lg' | 'pill';
/** Drop-shadow steps a freeform box may name — theme shadows, never raw
 * values. `soft` is a subtle lift, `lifted` a pronounced card float. */
export type FreeformShadow = 'none' | 'soft' | 'lifted';
/** Fields every freeform item carries.
 *
 * `id` is the item's identity across slides: items sharing an id on
 * *adjacent* freeform slides morph into each other when presenting
 * (position, size — reveal.js auto-animate) and the exported PPTX carries
 * a PowerPoint Morph transition matching them the same way. Duplicate a
 * slide, move the items, and the motion designs itself. Omit it and the
 * item simply cuts like everything else. */
interface FreeformItemBase {
    /** Stable identity for cross-slide morphing. Unique within a slide;
     * reuse the same id on the neighbouring slide to animate between them. */
    id?: string;
    area: FreeformAreaSpec;
}
/** Everything an item that the platform *draws* can carry on top of its
 * placement. `chart` and `table` deliberately do not extend this: both
 * export as a PPTX graphicFrame, which carries neither a rotation nor an
 * alpha, so offering either there would be a control that works on screen
 * and is silently dropped in the .pptx. A field that only sometimes
 * survives is worse than one that is not offered. */
interface FreeformDrawnBase extends FreeformItemBase {
    /** 0–1. Fades the whole item — everything it draws, together: a box's
     * fill, border and label, a picture, a caption, a component's subtree.
     * For washes and de-emphasis. Default 1.
     * @minimum 0
     * @maximum 1 */
    opacity?: number;
    /** Rotation in degrees, clockwise about the item's centre. Small tilts
     * (±4–8°) read as a deliberate accent — a snapshot pinned to the slide, a
     * stamp over a panel; keep anything meant to be read level.
     * @minimum -180
     * @maximum 180 */
    rotate?: number;
}
/** A run of text in one grid area. Font, exact sizes and colors come from
 * the theme; the size/weight/color fields pick among its tokens. */
export interface FreeformTextSpec extends FreeformDrawnBase {
    type: 'text';
    /** Separate strings are separate paragraphs. */
    text: string | string[];
    /** Type-scale step. Default 'md'. */
    size?: FreeformTextSize;
    weight?: 'regular' | 'medium' | 'bold';
    color?: FreeformTextColor;
    align?: 'left' | 'center' | 'right';
    /** Vertical placement inside the area. Default 'top'. */
    valign?: 'top' | 'middle' | 'bottom';
    /**
     * Line spacing, as a ratio of the font size. Default absent, which is the
     * theme's body leading (`--line-height`) — so leaving it off is what every
     * existing slide already does and nothing moves.
     *
     * It exists because display type wants tighter leading than body copy, and
     * a freeform text item had no way to ask: a 44px numeral set at the body's
     * 1.4 sits 9px lower in its line box than the same numeral in a fixed
     * layout, which is what made a converted slide's headings visibly jump
     * against an unconverted one. `tight` for big numerals and display lines,
     * `snug` for headings, `relaxed` for large body copy.
     */
    leading?: 'tight' | 'snug' | 'relaxed' | 'normal';
}
/** A rectangle in one grid area: background panel, accent bar (span one
 * row/column for a line), or a labeled shape. With `radius` and `shadow` it
 * becomes a card — the rounded, lifted tile a styled slide is built from. */
export interface FreeformBoxSpec extends FreeformDrawnBase {
    type: 'box';
    /** Optional label, centered in the box. */
    text?: string;
    /** Type-scale step for that label — a number in a big callout tile and a
     * word on a small badge are not the same size. Ignored when there is no
     * `text`. Default 'md'. */
    size?: FreeformTextSize;
    /** Default 'box' (the neutral panel fill). 'none' with a border is an
     * outline-only frame; the gradient fills are theme-defined washes. */
    fill?: FreeformBoxFill | FreeformGradientFill;
    /** The label's colour. Default 'text'. Worth setting whenever `fill` is
     * dark: the label does not pick a readable ink for you, because "readable"
     * depends on a theme's actual colours and guessing it would quietly
     * override an author who meant it. */
    color?: FreeformColor;
    /** Outline: `true` for the theme's panel border, or a token to pick its
     * colour. Default false. */
    border?: boolean | FreeformColor;
    /** How thick that outline is. Default 'hairline' — 1px, which is what
     * every bordered box drew before this existed, so leaving it off changes
     * nothing.
     *
     * The ladder is the LINE's (`hairline` 1, `regular` 2, `heavy` 4), so the
     * two cannot disagree about what "heavy" means. Note the different
     * defaults: a line defaults to `regular` because a 1px connector is
     * usually too faint to follow, while a border defaults to `hairline`
     * because an outline is a boundary, not a stroke. */
    borderWidth?: 'hairline' | 'regular' | 'heavy';
    /** Corner rounding. Default 'sm' (the theme's base radius). */
    radius?: FreeformRadius;
    /** Drop shadow. Default 'none'. Use on cards over a plain background —
     * never on thin bars or full-bleed panels. */
    shadow?: FreeformShadow;
}
/** Shapes beyond the rectangle. Each is a PowerPoint preset, so an exported
 * deck carries a real editable shape rather than a picture of one:
 *
 * - `ellipse` — the oval, and the only circle there is: give it a square
 *   area and it *is* a circle (there is no separate `circle` kind)
 * - `ring` — a donut; the hole is a quarter of the width, PowerPoint's default
 * - `triangle` — apex at the top centre
 * - `diamond`
 * - `chevron` — the arrow block a process row is built from
 * - `callout` — a rounded speech bubble with a tail; see `tail` for where
 *   the tail points
 * - `arrow` — a right-pointing block arrow; rotate it for the other three
 * - `star` — five-pointed
 * - `hexagon` — flat top and bottom, points left and right
 * - `pentagon` — regular, apex at the top centre
 * - `cylinder` — a can seen from slightly above; the database/volume glyph
 * - `parallelogram` — the leaning rectangle (a flow-chart input step)
 *
 * All stretch to fill their area, exactly as their PowerPoint counterparts
 * do, so a circle needs a square area.
 */
export type FreeformShapeKind = 'ellipse' | 'ring' | 'triangle' | 'diamond' | 'chevron' | 'callout' | 'arrow' | 'star' | 'hexagon' | 'pentagon' | 'cylinder' | 'parallelogram';
/** The tip of a `callout`'s tail, in percent of the item's own area. Values
 * outside 0–100 are the point, not a mistake: the bubble fills the area and
 * the tail reaches *out* of it towards whatever is being spoken about — a
 * tip inside the box leaves only a stub. */
export interface FreeformTailSpec {
    /** % of the item's width; < 0 is left of the bubble, > 100 right of it.
     * @minimum -200
     * @maximum 300 */
    x: number;
    /** % of the item's height; < 0 is above the bubble, > 100 below it.
     * @minimum -200
     * @maximum 300 */
    y: number;
}
/** A non-rectangular shape in one area. Fills, borders and the optional
 * centered label work exactly as they do on `box`. */
export interface FreeformShapeSpec extends FreeformDrawnBase {
    type: 'shape';
    shape: FreeformShapeKind;
    /** Where a `callout`'s tail points — ignored by every other shape.
     * Default `{ x: 25, y: 130 }`, a tail hanging below the bubble's left. */
    tail?: FreeformTailSpec;
    /** Optional label, centered in the shape. Keep it short — a triangle or a
     * ring has far less usable middle than its area suggests. */
    text?: string;
    /** Type-scale step for that label, exactly as on `box`. Ignored when there
     * is no `text`. Default 'md'. */
    size?: FreeformTextSize;
    /** Default 'box' (the neutral panel fill). 'none' with a border is an
     * outline-only shape. */
    fill?: FreeformBoxFill;
    /** The label's colour. Default 'text'; see `FreeformBoxSpec.color`. */
    color?: FreeformColor;
    /** Outline: `true` for the theme's panel border, or a token to pick its
     * colour. Default false. */
    border?: boolean | FreeformColor;
    /** How thick that outline is. Default 'hairline' — 1px, which is what
     * every bordered box drew before this existed, so leaving it off changes
     * nothing.
     *
     * The ladder is the LINE's (`hairline` 1, `regular` 2, `heavy` 4), so the
     * two cannot disagree about what "heavy" means. Note the different
     * defaults: a line defaults to `regular` because a 1px connector is
     * usually too faint to follow, while a border defaults to `hairline`
     * because an outline is a boundary, not a stroke. */
    borderWidth?: 'hairline' | 'regular' | 'heavy';
}
/** A straight connector between two points in the body — annotation arrows,
 * flow links, leader lines. Unlike the other items it is placed by its two
 * endpoints, not an area; the exported deck carries a real PowerPoint
 * connector with the same arrowheads.
 *
 * **It deliberately has no `rotate`** — and so deliberately extends neither
 * base: `FreeformItemBase` is `id` + `area`, which a line has no use for,
 * and `FreeformDrawnBase` adds the `rotate` it must not have. A line's
 * rotation IS its endpoints: turning it is moving `to`, and a separate angle
 * would be a second way to say the one thing, with no answer for which wins.
 * Tilt a line by dragging an end, not by typing a number. (`opacity` is
 * absent for the plainer reason that nothing has asked for a faded
 * connector; add it here if that changes.) */
export interface FreeformLineSpec {
    /** Stable identity for cross-slide morphing (see box/shape `id`). */
    id?: string;
    type: 'line';
    /** Start point, % of body width/height.
     * @minimum 0
     * @maximum 100 */
    from: {
        x: number;
        y: number;
    };
    /** End point, % of body width/height. Arrowheads point here (`arrow:
     * 'end'`). */
    to: {
        x: number;
        y: number;
    };
    /** Default 'text'. */
    color?: FreeformTextColor;
    /** Stroke weight step: hairline 1px, regular 2px, heavy 4px.
     * Default 'regular'. */
    weight?: 'hairline' | 'regular' | 'heavy';
    /** Default 'solid'. */
    style?: 'solid' | 'dashed';
    /** Arrowheads: none, at `to`, or both ends. Default 'none'. */
    arrow?: 'none' | 'end' | 'both';
}
/** An image filling one grid area. */
export interface FreeformImageSpec extends FreeformDrawnBase {
    type: 'image';
    url: string;
    /** cover crops to fill, contain shows the whole image. Default 'cover'. */
    fit?: 'cover' | 'contain';
}
/** A chart in one grid area. */
export interface FreeformChartSpec extends FreeformItemBase {
    type: 'chart';
    chart: ChartSpec;
}
/** A table in one grid area. */
export interface FreeformTableSpec extends FreeformItemBase {
    type: 'table';
    table: TableSpec;
}
/** A platform component or an installed pack component, placed as one item
 * — the KPI stack, the timeline, the driver tree, rendered by the same
 * component the dedicated layout uses, with the theme owning every token
 * and CSS owning the internal alignment.
 *
 * This is what to reach for instead of assembling a card out of a box and
 * three text runs: the item carries the component's own spec, so it still
 * follows a theme swap, still answers inline editing, and still exports as
 * real shapes rather than as a drawing of itself.
 *
 * **`area.h` means something different here.** For every other item the
 * four area values are exact. For a component the height is a MINIMUM: the
 * item renders at its natural height and never below `h`, because its
 * content can change under it and a reworded block in a fixed-height box
 * either clips or leaves a hole. Growth runs downward out of the area; it
 * does not push the items below it, because nothing on a freeform slide
 * reflows. `x`, `y` and `w` are exact as everywhere else. Give `h` the
 * height you want the item to occupy when it is empty — a matrix or a
 * driver tree has no natural height of its own and will take exactly `h`. */
export interface FreeformComponentSpec extends FreeformDrawnBase {
    type: 'component';
    /** Which component, and its spec — see `SlotSpec`. */
    content: SlotSpec;
}
export type FreeformItemSpec = FreeformTextSpec | FreeformBoxSpec | FreeformShapeSpec | FreeformLineSpec | FreeformImageSpec | FreeformChartSpec | FreeformTableSpec | FreeformComponentSpec;
/** Free composition on a 12×8 grid inside the bounded body region — the
 * escape hatch for genuinely bespoke slides. Reach for a fixed layout (or
 * `split`) first: freeform trades their guardrails for placement freedom,
 * and overflowing items are reported, not resolved. Chrome (header, footer,
 * finding, source) still comes from the platform. */
export interface FreeformSlideSpec {
    layout: 'freeform';
    props: {
        /** Optional: a freeform slide may run header-less, which gives the items
         * the body band the header would have taken. */
        header?: HeaderSpec;
        items: FreeformItemSpec[];
        /** Own the whole 1280x720 canvas instead of the body band, the way the
         * `web` layout's opener does. Every item's `area` is then a percent of
         * the canvas, so items can sit in the safe-area margins and over the
         * chrome bands.
         *
         * This is what a slide converted from a flowed layout runs in: a header
         * and a findings banner sit OUTSIDE the body band, so converting them
         * into items that land where they were needs a coordinate space that
         * reaches them. The header and finding props are dropped by that
         * conversion for the same reason — they are items now, and keeping both
         * would draw them twice. The footer still signs the slide, so keep the
         * bottom strip clear. */
        bleed?: boolean;
        /** Draw the theme's footer. Default true, and only meaningful under
         * `bleed` — a banded body always reserves the footer's strip, so there
         * is nothing to decide there.
         *
         * It exists for the converted cover. A `title` slide is the one layout
         * that signs nothing: no page number, no deck note. Converting one has
         * to be able to say that, or every cover comes back from the conversion
         * wearing a footer it never had. */
        footer?: boolean;
        finding?: FindingSpec;
        source?: string;
    };
}
export {};
