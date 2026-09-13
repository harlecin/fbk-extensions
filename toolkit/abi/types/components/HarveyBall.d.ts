import type { HarveyValue } from '../deck/schema';
/**
 * Harvey ball, rendered as inline SVG. Exported to PPTX as vector shapes:
 * an ellipse outline plus (for partial values) a pie segment — see
 * tools/export.ts. Stroke width is a shared constant with the exporter.
 */
export declare const HARVEY_STROKE_PX = 1.5;
export declare const HARVEY_SIZE_PX = 20;
export declare function HarveyBall({ value, size }: {
    value: HarveyValue;
    size?: number;
}): import("react").JSX.Element;
