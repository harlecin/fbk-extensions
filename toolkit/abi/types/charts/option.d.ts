import type { EChartsOption } from 'echarts';
import type { ChartSpec } from '../deck/schema';
import type { ChartTheme } from './theme';
/**
 * ChartSpec → ECharts option. Leans on ECharts defaults wherever the PPTX
 * side can express the same look; everything themed comes from ChartTheme.
 *
 * Tooltips are always on: they only exist on hover, so the measure pass, the
 * screenshots and the PDF never see them — a livelier preview for free. Entrance animation is opt-in via
 * `animate`, because the PDF path reloads the page without the capture
 * flags and would print mid-flight frames.
 */
export declare function buildChartOption(spec: ChartSpec, theme: ChartTheme, opts?: {
    animate?: boolean;
}): EChartsOption;
