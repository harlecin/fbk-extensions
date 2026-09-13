export interface WaterfallSegments {
    /** Invisible stack offset. */
    base: (number | null)[];
    increase: (number | null)[];
    decrease: (number | null)[];
    total: (number | null)[];
    /**
     * Label value per category — magnitudes, unsigned: PPTX stacked-chart
     * labels come from the (positive) series values, so ECharts shows the
     * same; the bar color conveys direction.
     */
    labels: number[];
    /**
     * Running total after each category — the height at which category i's
     * bar hands over to i+1. Both renderers draw the connector line there
     * (ECharts a custom series, PPTX a native `<c:serLines>`).
     */
    ends: number[];
}
/**
 * How much of a category band the column fills. Shared so the preview and
 * the .pptx put the same amount of air between bars: ECharts takes the
 * fraction directly, PowerPoint takes the gap *between* bands.
 */
export declare const WF_BAR_FRACTION = 0.56;
export declare const WF_GAP_WIDTH_PCT: number;
/**
 * How far the exporter nudges each bar label past the segment's top edge,
 * as a fraction of the chart area (a `<c:manualLayout>` offset on the
 * label, from its `inEnd` anchor). A fixed constant, not per-bar
 * arithmetic: OOXML has no `outEnd` for stacked charts, and this is the
 * declarative stand-in — ECharts says the same thing with position 'top'.
 */
export declare const WF_LABEL_RAISE = -0.04;
export declare function computeWaterfall(rawDeltas: Array<number | null>, totalIndices?: number[]): WaterfallSegments;
