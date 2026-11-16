import type { ChartBaseProps, ChartPalette } from '@/utils/chartColors'

export interface PieChartDataPoint {
  key: string
  label: string
  value: number
  color?: ChartPalette
}

export interface PieChartProps extends Omit<ChartBaseProps, 'showGrid'> {
  data: PieChartDataPoint[]
  variant?: 'pie' | 'donut'
  formatValue?: (value: number) => string
  showLabels?: boolean
}
