import { memo, useCallback, useMemo, type ReactNode } from 'react'
import {
  Bar,
  CartesianGrid,
  LabelList,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Formatter, NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { getPaletteColor, resolveSeriesColor } from '@/utils/chartColors'

import type { BarChartProps } from './BarChart.types'

const VALUE_LABEL_COLOR = getPaletteColor('mercury', 600)
const RESIZE_DEBOUNCE = 300
const TOOLTIP_CURSOR = { fill: '#f4f4f4' }
const TOOLTIP_CONTENT_STYLE = { borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }
const LEGEND_WRAPPER_STYLE = { fontSize: 12, paddingTop: 8 }

function BarChartBase({
  data,
  categoryKey,
  series,
  orientation = 'vertical',
  layout = 'grouped',
  formatValue,
  formatCompactValue,
  showValueLabels = false,
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
}: BarChartProps) {
  const isHorizontal = orientation === 'horizontal'
  const stacked = layout === 'stacked'
  const compactFormatter = formatCompactValue ?? formatValue

  const margin = useMemo(
    () => ({ top: showValueLabels ? 24 : 8, right: 16, bottom: 8, left: 8 }),
    [showValueLabels],
  )

  const tooltipFormatter = useCallback<Formatter<ValueType, NameType>>(
    (value, name) => {
      if (formatValue && typeof value === 'number') {
        return [formatValue(value), name ?? '']
      }
      return [String(value ?? ''), name ?? '']
    },
    [formatValue],
  )

  const valueLabelFormatter = useCallback(
    (value: ReactNode): ReactNode => {
      if (typeof value === 'number' && compactFormatter) {
        return compactFormatter(value)
      }
      return value
    },
    [compactFormatter],
  )

  const axes = useMemo(
    () =>
      isHorizontal
        ? [
            <XAxis
              key="x"
              type="number"
              tickFormatter={compactFormatter}
              stroke="#737373"
              fontSize={12}
            />,
            <YAxis
              key="y"
              type="category"
              dataKey={categoryKey}
              stroke="#737373"
              fontSize={12}
              width={100}
            />,
          ]
        : [
            <XAxis key="x" dataKey={categoryKey} stroke="#737373" fontSize={12} />,
            <YAxis key="y" tickFormatter={compactFormatter} stroke="#737373" fontSize={12} />,
          ],
    [isHorizontal, categoryKey, compactFormatter],
  )

  const bars = useMemo(
    () =>
      series.map((s, index) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.label}
          fill={resolveSeriesColor(s.color, index, s.tone)}
          stackId={stacked ? 'stack' : undefined}
          radius={stacked ? 0 : [4, 4, 0, 0]}
        >
          {showValueLabels && (
            <LabelList
              dataKey={s.key}
              position={isHorizontal ? 'right' : 'top'}
              offset={8}
              fontSize={10}
              fill={VALUE_LABEL_COLOR}
              formatter={valueLabelFormatter}
            />
          )}
        </Bar>
      )),
    [series, stacked, showValueLabels, isHorizontal, valueLabelFormatter],
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
        <RechartsBarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={margin}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
          {axes}
          {showTooltip && (
            <Tooltip
              formatter={tooltipFormatter}
              cursor={TOOLTIP_CURSOR}
              contentStyle={TOOLTIP_CONTENT_STYLE}
            />
          )}
          {showLegend && <Legend wrapperStyle={LEGEND_WRAPPER_STYLE} iconType="circle" />}
          {bars}
        </RechartsBarChart>
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

export const BarChart = memo(BarChartBase)
