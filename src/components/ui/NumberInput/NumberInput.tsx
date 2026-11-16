import { useCallback, useId, useRef, useState } from 'react'
import type { InputHTMLAttributes, Ref } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { mergeRefs } from '@/utils/mergeRefs'
import { useFieldContext } from '@/components/ui/Form'

type NumberInputSize = 'sm' | 'md' | 'lg'

interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'onChange' | 'type'
> {
  size?: NumberInputSize
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
  value?: number | null
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  decimals?: number
  thousandSeparator?: boolean
  prefix?: string
  suffix?: string
  showStepper?: boolean
}

const wrapperBase =
  'flex w-full items-center rounded-lg border bg-white transition-colors focus-within:ring-2'
const sizeClasses: Record<NumberInputSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
}
const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus-within:border-primary-500 focus-within:ring-primary-100'
const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus-within:border-scarlet-500 focus-within:ring-scarlet-100'
const disabledClasses = 'bg-mercury-100 cursor-not-allowed'

function formatNumber(value: number | null, decimals: number, thousands: boolean): string {
  if (value === null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('es-CL', {
    useGrouping: thousands,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function parseNumber(text: string): number | null {
  if (!text.trim()) return null
  const normalized = text.replace(/\./g, '').replace(',', '.')
  const cleaned = normalized.replace(/[^0-9.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

function clamp(value: number, min?: number, max?: number): number {
  if (typeof min === 'number' && value < min) return min
  if (typeof max === 'number' && value > max) return max
  return value
}

export const NumberInput = ({
  size = 'md',
  invalid,
  className,
  ref,
  id,
  disabled,
  value: valueProp,
  onChange: onChangeProp,
  min,
  max,
  step = 1,
  decimals = 0,
  thousandSeparator = true,
  prefix,
  suffix,
  showStepper = true,
  onBlur,
  ...props
}: NumberInputProps) => {
  const ctx = useFieldContext()
  const reactId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const ctxValue = ctx?.field.value
  const numericValue: number | null = ctx
    ? typeof ctxValue === 'number'
      ? ctxValue
      : null
    : (valueProp ?? null)

  const fieldName = ctx?.field.name ?? props.name
  const isDisabled = ctx ? (ctx.field.disabled ?? disabled) : disabled
  const hasError = ctx ? ctx.fieldState.invalid : false
  const showInvalid = invalid ?? hasError
  const inputId = ctx?.id ?? id ?? reactId

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const displayValue = editing ? draft : formatNumber(numericValue, decimals, thousandSeparator)

  const commit = useCallback(
    (next: number | null) => {
      if (ctx) ctx.field.onChange(next)
      else onChangeProp?.(next)
    },
    [ctx, onChangeProp],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value)
  }

  const handleFocus = () => {
    setEditing(true)
    setDraft(numericValue !== null ? String(numericValue).replace('.', ',') : '')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setEditing(false)
    const parsed = parseNumber(draft)
    const clamped = parsed !== null ? clamp(parsed, min, max) : null
    commit(clamped)
    if (ctx) ctx.field.onBlur()
    onBlur?.(e)
  }

  const adjust = (delta: number) => {
    const base = numericValue ?? 0
    const next = clamp(base + delta, min, max)
    commit(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      adjust(step)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      adjust(-step)
    }
  }

  return (
    <div
      className={cn(
        wrapperBase,
        sizeClasses[size],
        isDisabled ? disabledClasses : showInvalid ? invalidClasses : validClasses,
        className,
      )}
    >
      {prefix && (
        <span className="px-3 text-mercury-500" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        {...props}
        type="text"
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        ref={mergeRefs(inputRef, ref)}
        id={inputId}
        name={fieldName}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-invalid={showInvalid || undefined}
        aria-describedby={hasError ? ctx?.errorId : undefined}
        aria-required={ctx?.required || undefined}
        className="min-w-0 flex-1 bg-transparent px-3 text-mercury-900 placeholder:text-mercury-400 focus:outline-none disabled:cursor-not-allowed"
      />
      {suffix && (
        <span className="px-3 text-mercury-500" aria-hidden="true">
          {suffix}
        </span>
      )}
      {showStepper && !isDisabled && (
        <div className="flex h-full border-l border-mercury-200">
          <button
            type="button"
            onClick={() => adjust(-step)}
            aria-label="Decrementar"
            className="flex h-full w-8 items-center justify-center text-mercury-500 hover:bg-mercury-100"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => adjust(step)}
            aria-label="Incrementar"
            className="flex h-full w-8 items-center justify-center border-l border-mercury-200 text-mercury-500 hover:bg-mercury-100"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
