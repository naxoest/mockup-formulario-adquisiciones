import type { ReactNode } from 'react'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export type ComboboxSize = 'sm' | 'md' | 'lg'

interface ComboboxBaseProps {
  options: ComboboxOption[]
  placeholder?: ReactNode
  searchPlaceholder?: string
  emptyMessage?: ReactNode
  loadingMessage?: ReactNode
  clearable?: boolean
  disabled?: boolean
  invalid?: boolean
  size?: ComboboxSize
  className?: string
  name?: string
  id?: string
  ariaLabel?: string
  onBlur?: () => void
  searchValue?: string
  onSearchChange?: (query: string) => void
  loading?: boolean
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value?: string | null
  onChange?: (value: string | null) => void
  selectedOption?: ComboboxOption | null
}

export interface ComboboxMultiProps extends ComboboxBaseProps {
  multiple: true
  value?: string[]
  onChange?: (value: string[]) => void
  selectedOptions?: ComboboxOption[]
  maxVisibleChips?: number
  enableSelectAll?: boolean
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps
