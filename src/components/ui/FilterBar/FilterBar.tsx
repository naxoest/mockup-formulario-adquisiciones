import { useMemo } from 'react'
import { format, parse } from 'date-fns'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { cn } from '@/utils/cn'
import type { FilterBarProps, FilterDefinitionDateRange } from './FilterBar.types'

const ISO_DATE = 'yyyy-MM-dd'

const parseIsoDate = (value: string | undefined): Date | null => {
  if (!value) return null
  const parsed = parse(value, ISO_DATE, new Date())
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatIsoDate = (value: Date | null): string => (value ? format(value, ISO_DATE) : '')

interface DateRangeFilterProps {
  filter: FilterDefinitionDateRange
  value: string[]
  onChange: (values: string[]) => void
}

const DateRangeFilter = ({ filter, value, onChange }: DateRangeFilterProps) => {
  const from = parseIsoDate(value[0])
  const to = parseIsoDate(value[1])

  return (
    <div role="group" aria-label={filter.label} className="grid grid-cols-2 gap-2">
      <DatePicker
        value={from}
        onChange={(next) => onChange([formatIsoDate(next), value[1] ?? ''])}
        placeholder={filter.fromLabel ?? 'Desde'}
        disabled={filter.disabled}
        size="sm"
        minDate={filter.minDate}
        maxDate={to ?? filter.maxDate}
        dateFormat={filter.dateFormat}
      />
      <DatePicker
        value={to}
        onChange={(next) => onChange([value[0] ?? '', formatIsoDate(next)])}
        placeholder={filter.toLabel ?? 'Hasta'}
        disabled={filter.disabled}
        size="sm"
        minDate={from ?? filter.minDate}
        maxDate={filter.maxDate}
        dateFormat={filter.dateFormat}
      />
    </div>
  )
}

export const FilterBar = ({ filters, values, onChange, onClear, className }: FilterBarProps) => {
  const hasActiveFilters = useMemo(
    () => filters.some((f) => (values[f.key] ?? []).some((v) => v.length > 0)),
    [filters, values],
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => {
          const filterValue = values[filter.key] ?? []
          return (
            <div
              key={filter.key}
              className={cn(
                'flex flex-col gap-1.5',
                filter.type === 'dateRange' && 'sm:col-span-2',
              )}
            >
              <span className="text-xs font-medium text-mercury-700">{filter.label}</span>
              {filter.type === 'multi' ? (
                <Combobox
                  multiple
                  options={filter.options}
                  value={filterValue}
                  onChange={(next) => onChange(filter.key, next)}
                  placeholder={filter.placeholder ?? 'Todos'}
                  disabled={filter.disabled}
                  enableSelectAll={filter.enableSelectAll}
                  maxVisibleChips={filter.maxVisibleChips}
                  ariaLabel={filter.label}
                  size="sm"
                />
              ) : filter.type === 'single' ? (
                <Combobox
                  options={filter.options}
                  value={filterValue[0] ?? null}
                  onChange={(next) => onChange(filter.key, next ? [next] : [])}
                  placeholder={filter.placeholder ?? 'Todos'}
                  disabled={filter.disabled}
                  clearable={filter.clearable ?? true}
                  ariaLabel={filter.label}
                  size="sm"
                />
              ) : (
                <DateRangeFilter
                  filter={filter}
                  value={filterValue}
                  onChange={(next) => onChange(filter.key, next)}
                />
              )}
            </div>
          )
        })}
      </div>
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="size-4" aria-hidden="true" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
