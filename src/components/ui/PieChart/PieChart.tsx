import { memo, useCallback, useMemo } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { resolveSeriesColor } from '@/utils/chartColors'

import type { PieChartProps } from './PieChart.types'

const RESIZE_DEBOUNCE = 300
const OUTER_RADIUS = '80%'
const TOOLTIP_CONTENT_STYLE = { borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }
const LEGEND_WRAPPER_STYLE = { fontSize: 12, paddingTop: 8 }

function PieChartBase({
  data,
  variant = 'donut',
  formatValue,
  showLabels = false,
  height = 300,
  ariaLabel,
  accessibleData = false,
  loading = false,
  emptyMessage = 'Sin datos para mostrar',
  showLegend = true,
  showTooltip = true,
  className,
  ...rest
}: PieChartProps) {
  const isDonut = variant === 'donut'

  const tooltipFormatter = useCallback<Formatter<ValueType, NameType>>(
    (value, name) => {
      if (formatValue && typeof value === 'number') {
        return [formatValue(value), name ?? '']
      }
      return [String(value ?? ''), name ?? '']
    },
    [formatValue],
  )

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        key: point.key,
        name: point.label,
        value: point.value,
        color: point.color,
      })),
    [data],
  )

  const cells = useMemo(
    () =>
      chartData.map((entry, index) => (
        <Cell key={entry.key} fill={resolveSeriesColor(entry.color, index)} />
      )),
    [chartData],
  )

  if (loading) {
    return (
      <div className={cn('w-full', className)} {...rest}>
        <Skeleton width="100%" height={height} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-md border border-dashed border-mercury-200 text-sm text-mercury-500',
          className,
        )}
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
        {...rest}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} role="img" aria-label={ariaLabel} {...rest}>
      <ResponsiveContainer width="100%" height={height} debounce={RESIZE_DEBOUNCE}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={isDonut ? '55%' : 0}
            outerRadius={OUTER_RADIUS}
            paddingAngle={isDonut ? 2 : 0}
            label={showLabels}
          >
            {cells}
          </Pie>
          {showTooltip && (
            <Tooltip formatter={tooltipFormatter} contentStyle={TOOLTIP_CONTENT_STYLE} />
          )}
          {showLegend && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="circle" />}
        </RechartsPieChart>
      </ResponsiveContainer>

      {accessibleData && (
        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.key}>
                <td>{point.label}</td>
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export const PieChart = memo(PieChartBase)
