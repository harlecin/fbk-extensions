/** PowerPoint's gap width (% of bar width) → share of the category band. */
export declare function barFractionFromGapPct(gapPct: number): number;
/** Share of the category band → PowerPoint's gap width. */
export declare function gapPctFromBarFraction(fraction: number): number;
/**
 * Where the value axis starts under a `zero` baseline: pinned to 0 when the
 * data is all on one side of it. With negative values present both
 * renderers already straddle zero on their own, and pinning the minimum
 * would clip the chart — so the answer is "let it scale".
 *
 * `auto` always returns undefined: it truncates the scale, which is the
 * commonest way these charts mislead, so it has to be asked for.
 */
export declare function valueAxisMin(values: Array<number | null>, baseline: 'zero' | 'auto' | undefined): number | undefined;
