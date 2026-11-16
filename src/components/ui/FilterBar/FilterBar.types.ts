import type { ComboboxOption } from '@/components/ui/Combobox'

interface FilterDefinitionBase {
  key: string
  label: string
  placeholder?: string
  disabled?: boolean
}

export interface FilterDefinitionSingle extends FilterDefinitionBase {
  type: 'single'
  options: ComboboxOption[]
  clearable?: boolean
}

export interface FilterDefinitionMulti extends FilterDefinitionBase {
  type: 'multi'
  options: ComboboxOption[]
  enableSelectAll?: boolean
  maxVisibleChips?: number
}

export interface FilterDefinitionDateRange extends FilterDefinitionBase {
  type: 'dateRange'
  minDate?: Date
  maxDate?: Date
  dateFormat?: string
  fromLabel?: string
  toLabel?: string
}

export type FilterDefinition =
  | FilterDefinitionSingle
  | FilterDefinitionMulti
  | FilterDefinitionDateRange

export interface FilterBarProps {
  filters: FilterDefinition[]
  values: Record<string, string[]>
  onChange: (key: string, values: string[]) => void
  onClear: () => void
  className?: string
}
