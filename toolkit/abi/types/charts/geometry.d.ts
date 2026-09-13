/** The inner plot rect — the data area, excluding axis labels. */
export interface PlotArea {
    x: number;
    y: number;
    w: number;
    h: number;
}
/**
 * Centre of category band `i` of `n`, as a fraction along the plot axis.
 *
 * Both renderers put a bar group AND a line's data point at the centre of
 * its category band (ECharts' `boundaryGap: true`, which is the category
 * default; Excel and PowerPoint do the same for line charts). Anything
 * anchored to a category — a marker rule, a row in a side column — belongs
 * here, not at `i / (n - 1)`, which is the edge-to-edge spacing a scatter
 * plot would use and is off by half a band everywhere but the middle.
 */
export declare function bandCentre(i: number, n: number): number;
/** Band centre in the chart box's own coordinates: along x for columns and
 * lines, along y for horizontal bars (category axis inverted, so band 0 is
 * at the top). */
export declare function bandCentreX(plot: PlotArea, i: number, n: number): number;
export declare function bandCentreY(plot: PlotArea, i: number, n: number): number;
/**
 * Where a value sits vertically, as a fraction of the chart box — only
 * meaningful when the spec pins BOTH bounds, because otherwise each renderer
 * picks its own "nice" axis maximum and the answer differs between them.
 */
export declare function valueY(plot: PlotArea, value: number, min: number, max: number): number;
/**
 * Minimum vertical distance between two end labels, as a fraction of the
 * chart box. A 9pt label in a half-slide-tall chart is about this much.
 */
export declare const LABEL_MIN_GAP = 0.034;
/**
 * Pushes overlapping labels apart, top-first, preserving their order.
 *
 * Returns one offset per input (fraction of the chart box, negative is up),
 * so a caller can apply them wherever its renderer takes an offset. Order is
 * preserved deliberately: a label that has swapped places with its
 * neighbour is worse than one sitting slightly off its line.
 */
export declare function spreadLabels(ys: number[], minGap?: number): number[];
