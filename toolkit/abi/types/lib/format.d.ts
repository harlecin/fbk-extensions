export type NumberStyle = 'plain' | 'compact' | 'percent';
export interface NumberFormatOptions {
    style?: NumberStyle;
    /** Fraction digits. Defaults: plain 0, compact 1, percent auto (see below). */
    decimals?: number;
}
/**
 * plain:   1234567  → "1,234,567"
 * compact: 1234567  → "1.2M"   (k / M / B)
 * percent: 0.423    → "42%"    (input is a fraction)
 */
export declare function formatNumber(value: number, opts?: NumberFormatOptions): string;
