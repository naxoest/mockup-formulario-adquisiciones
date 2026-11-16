import type { ChartBaseProps, ChartPalette, ChartTone } from '@/utils/chartColors'
import type { ChartDataRow } from '@/components/ui/BarChart/BarChart.types'

export interface LineChartSeries {
  key: string
  label: string
  color?: ChartPalette
  tone?: ChartTone
  curve?: 'linear' | 'monotone'
  strokeDasharray?: string
}

export interface LineChartProps extends ChartBaseProps {
  data: ChartDataRow[]
  categoryKey: string
  series: LineChartSeries[]
  formatValue?: (value: number) => string
  formatCompactValue?: (value: number) => string
  showDots?: boolean
}
