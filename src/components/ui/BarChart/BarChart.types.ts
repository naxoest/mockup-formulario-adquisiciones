import type { ChartBaseProps, ChartPalette, ChartTone } from '@/utils/chartColors'

export type ChartDataRow = Record<string, string | number>

export interface BarChartSeries {
  key: string
  label: string
  color?: ChartPalette
  tone?: ChartTone
}

export interface BarChartProps extends ChartBaseProps {
  data: ChartDataRow[]
  categoryKey: string
  series: BarChartSeries[]
  orientation?: 'vertical' | 'horizontal'
  layout?: 'grouped' | 'stacked'
  formatValue?: (value: number) => string
  formatCompactValue?: (value: number) => string
  showValueLabels?: boolean
}
