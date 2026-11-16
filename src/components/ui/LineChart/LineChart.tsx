import { memo, useCallback, useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { resolveSeriesColor } from '@/utils/chartColors'

import type { LineChartProps } from './LineChart.types'

const RESIZE_DEBOUNCE = 300
const CHART_MARGIN = { top: 8, right: 16, bottom: 8, left: 8 }
const TOOLTIP_CURSOR = { stroke: '#a3a3a3', strokeDasharray: '3 3' }
const TOOLTIP_CONTENT_STYLE = { borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }
const LEGEND_WRAPPER_STYLE = { fontSize: 12, paddingTop: 8 }
const DOT = { r: 3 }
const ACTIVE_DOT = { r: 5 }

function LineChartBase({
  data,
  categoryKey,
  series,
  formatValue,
  formatCompactValue,
  showDots = true,
  height = 300,
  ariaLabel,
  accessibleData = false,
  loading = false,
  emptyMessage = 'Sin datos para mostrar',
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  className,
  ...rest
}: LineChartProps) {
  const compactFormatter = formatCompactValue ?? formatValue

  const tooltipFormatter = useCallback<Formatter<ValueType, NameType>>(
    (value, name) => {
      if (formatValue && typeof value === 'number') {
        return [formatValue(value), name ?? '']
      }
      return [String(value ?? ''), name ?? '']
    },
    [formatValue],
  )

  const lines = useMemo(
    () =>
      series.map((s, index) => (
        <Line
          key={s.key}
          type={s.curve ?? 'monotone'}
          dataKey={s.key}
          name={s.label}
          stroke={resolveSeriesColor(s.color, index, s.tone)}
          strokeWidth={2}
          strokeDasharray={s.strokeDasharray}
          dot={showDots ? DOT : false}
          activeDot={showDots ? ACTIVE_DOT : false}
        />
      )),
    [series, showDots],
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
        <RechartsLineChart data={data} margin={CHART_MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis dataKey={categoryKey} stroke="#737373" fontSize={12} />
          <YAxis tickFormatter={compactFormatter} stroke="#737373" fontSize={12} />
          {showTooltip && (
            <Tooltip
              formatter={tooltipFormatter}
              cursor={TOOLTIP_CURSOR}
              contentStyle={TOOLTIP_CONTENT_STYLE}
            />
          )}
          {showLegend && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="circle" />}
          {lines}
        </RechartsLineChart>
      </ResponsiveContainer>

      {accessibleData && (
        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th>{categoryKey}</th>
              {series.map((s) => (
                <th key={s.key}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{String(row[categoryKey])}</td>
                {series.map((s) => (
                  <td key={s.key}>{String(row[s.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export const LineChart = memo(LineChartBase)
