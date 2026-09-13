import type { InsightSpec } from '../deck/schema';
/**
 * Takeaway strip: equal columns under a hairline rule, each an accent lead-in
 * and one line of explanation. A lighter alternative to the FindingsBanner
 * when a slide has several parallel takeaways rather than one statement.
 *
 * Rules and dividers are 1px `shape` divs (per-side borders export as full
 * outlines); the columns are a grid so they stay equal regardless of length.
 */
export declare function InsightRail({ insights, path }: {
    insights: InsightSpec[];
    path?: string;
}): import("react").JSX.Element;
