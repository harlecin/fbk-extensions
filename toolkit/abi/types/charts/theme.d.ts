/** Chart-relevant theme tokens, resolved from CSS custom properties at
 * runtime so theme.css stays the single source of truth. */
export interface ChartTheme {
    /** Series palette, '#rrggbb'. */
    series: string[];
    positive: string;
    negative: string;
    /** Waterfall totals. */
    neutral: string;
    /** The theme's accent, for the one series that carries the argument. */
    accent: string;
    fontFamily: string;
    textColor: string;
    mutedColor: string;
}
export declare function readChartTheme(): ChartTheme;
