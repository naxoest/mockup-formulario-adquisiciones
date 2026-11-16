import { useCallback, useEffect, useId, useState } from 'react'
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'
import 'react-day-picker/style.css'

type DatePickerSize = 'sm' | 'md' | 'lg'

interface DatePickerProps {
  value?: Date | null
  onChange?: (value: Date | null) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  size?: DatePickerSize
  className?: string
  name?: string
  id?: string
  minDate?: Date
  maxDate?: Date
  dateFormat?: string
  clearable?: boolean
}

const triggerBase =
  'flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left text-mercury-900 transition-colors focus:outline-none focus:ring-2'
const disabledClasses = 'bg-mercury-100 text-mercury-500 cursor-not-allowed'
const triggerSizeClasses: Record<DatePickerSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}
const iconSizeClasses: Record<DatePickerSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}
const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus:border-primary-500 focus:ring-primary-100'
const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus:border-scarlet-500 focus:ring-scarlet-100'

export const DatePicker = ({
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  placeholder = 'Selecciona una fecha',
  disabled,
  invalid,
  size = 'md',
  className,
  name: nameProp,
  id: idProp,
  minDate,
  maxDate,
  dateFormat = 'dd/MM/yyyy',
  clearable = true,
}: DatePickerProps) => {
  const ctx = useFieldContext()
  const reactId = useId()

  const ctxValue = ctx?.field.value
  const parseFieldDate = (raw: unknown): Date | null => {
    if (raw instanceof Date) return raw
    if (typeof raw === 'string' && raw) {
      const parsed = new Date(raw)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
    return null
  }

  const rawValue: Date | null = ctx ? parseFieldDate(ctxValue) : (valueProp ?? null)

  const fieldName = ctx?.field.name ?? nameProp
  const isDisabled = ctx ? (ctx.field.disabled ?? disabled) : disabled
  const hasError = ctx ? ctx.fieldState.invalid : false
  const showInvalid = invalid ?? hasError
  const triggerId = ctx?.id ?? idProp ?? `${reactId}-trigger`

  const [open, setOpen] = useState(false)

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: 'fixed',
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  const commit = useCallback(
    (next: Date | null) => {
      if (ctx) ctx.field.onChange(next)
      else onChangeProp?.(next)
    },
    [ctx, onChangeProp],
  )

  const dispatchBlur = useCallback(() => {
    if (ctx) ctx.field.onBlur()
    else onBlurProp?.()
  }, [ctx, onBlurProp])

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      const trigger = refs.reference.current as HTMLElement | null
      const floating = refs.floating.current
      const target = event.target as Node | null
      if (!target) return
      if (trigger?.contains(target)) return
      if (floating?.contains(target)) return
      setOpen(false)
      dispatchBlur()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, refs, dispatchBlur])

  const handleSelect = (date: Date | undefined) => {
    commit(date ?? null)
    if (date) {
      setOpen(false)
      const trigger = refs.reference.current as HTMLButtonElement | null
      window.setTimeout(() => trigger?.focus(), 0)
    }
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    commit(null)
  }

  const handleTriggerBlur = (event: ReactFocusEvent) => {
    const next = event.relatedTarget as Node | null
    const floating = refs.floating.current
    if (floating && next && floating.contains(next)) return
    if (open) return
    dispatchBlur()
  }

  const handleDropdownKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      const trigger = refs.reference.current as HTMLButtonElement | null
      window.setTimeout(() => trigger?.focus(), 0)
    }
  }

  const displayValue = rawValue ? format(rawValue, dateFormat, { locale: es }) : ''

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        id={triggerId}
        disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((prev) => !prev)}
        onBlur={handleTriggerBlur}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={showInvalid || undefined}
        aria-required={ctx?.required || undefined}
        aria-describedby={hasError ? ctx?.errorId : undefined}
        className={cn(
          triggerBase,
          triggerSizeClasses[size],
          isDisabled ? disabledClasses : showInvalid ? invalidClasses : validClasses,
          className,
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !rawValue && 'text-mercury-400')}>
          {displayValue || placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearable && rawValue && !isDisabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Limpiar fecha"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="rounded p-0.5 text-mercury-400 hover:bg-mercury-100 hover:text-scarlet-600"
            >
              <X className={iconSizeClasses[size]} />
            </span>
          )}
          <Calendar className={cn('text-mercury-400', iconSizeClasses[size])} aria-hidden="true" />
        </span>
      </button>

      {open && !isDisabled && (
        <div
          // eslint-disable-next-line react-hooks/refs -- callback ref de floating-ui destinado al elemento DOM.
          ref={refs.setFloating}
          style={floatingStyles}
          onKeyDown={handleDropdownKeyDown}
          role="dialog"
          aria-label="Selector de fecha"
          className="z-50 rounded-lg border border-mercury-200 bg-white p-3 shadow-lg"
        >
          <DayPicker
            mode="single"
            selected={rawValue ?? undefined}
            onSelect={handleSelect}
            locale={es}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            captionLayout="dropdown"
            startMonth={minDate}
            endMonth={maxDate}
          />
        </div>
      )}

      {ctx && (
        <input
          type="hidden"
          name={fieldName}
          value={rawValue ? rawValue.toISOString() : ''}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </>
  )
}
