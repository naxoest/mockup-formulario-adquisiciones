import type { ChartBaseProps, ChartPalette } from '@/utils/chartColors'
import type { ChartDataRow } from '@/components/ui/BarChart/BarChart.types'

export interface ComboBarSeries {
  type: 'bar'
  key: string
  label: string
  color?: ChartPalette
  yAxisId?: 'left' | 'right'
}

export interface ComboLineSeries {
  type: 'line'
  key: string
  label: string
  color?: ChartPalette
  yAxisId?: 'left' | 'right'
  curve?: 'linear' | 'monotone'
  strokeDasharray?: string
}

export type ComboSeries = ComboBarSeries | ComboLineSeries

export interface ComboChartProps extends ChartBaseProps {
  data: ChartDataRow[]
  categoryKey: string
  series: ComboSeries[]
  formatLeftAxis?: (value: number) => string
  formatRightAxis?: (value: number) => string
  showRightAxis?: boolean
}
