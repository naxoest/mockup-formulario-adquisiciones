import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { resolveSeriesColor } from '@/utils/chartColors'

import type { ComboChartProps } from './ComboChart.types'

export function ComboChart({
  data,
  categoryKey,
  series,
  formatLeftAxis,
  formatRightAxis,
  showRightAxis = false,
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
}: ComboChartProps) {
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

  const tooltipFormatter: Formatter<ValueType, NameType> = (value, name) => {
    if (typeof value === 'number') {
      if (formatLeftAxis) return [formatLeftAxis(value), name ?? '']
      return [String(value), name ?? '']
    }
    return [String(value ?? ''), name ?? '']
  }

  return (
    <div className={cn('w-full', className)} role="img" aria-label={ariaLabel} {...rest}>
      <ResponsiveContainer width="100%" height={height} debounce={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          <XAxis dataKey={categoryKey} stroke="#737373" fontSize={12} />
          <YAxis yAxisId="left" tickFormatter={formatLeftAxis} stroke="#737373" fontSize={12} />
          {showRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatRightAxis}
              stroke="#737373"
              fontSize={12}
            />
          )}
          {showTooltip && (
            <Tooltip
              formatter={tooltipFormatter}
              cursor={{ fill: '#f4f4f4' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                fontSize: 12,
              }}
            />
          )}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
          )}
          {series.map((s, index) => {
            const color = resolveSeriesColor(s.color, index)
            const axisId = s.yAxisId ?? 'left'

            if (s.type === 'bar') {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={color}
                  yAxisId={axisId}
                  radius={[4, 4, 0, 0]}
                />
              )
            }

            return (
              <Line
                key={s.key}
                type={s.curve ?? 'monotone'}
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={s.strokeDasharray}
                yAxisId={axisId}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )
          })}
        </ComposedChart>
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
