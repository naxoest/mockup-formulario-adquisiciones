import { useCallback, useEffect, useId, useState } from 'react'
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from '@floating-ui/react'
import { Command } from 'cmdk'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Spinner } from '@/components/ui/Loading'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'
import type {
  ComboboxMultiProps,
  ComboboxOption,
  ComboboxProps,
  ComboboxSingleProps,
  ComboboxSize,
} from './Combobox.types'

const triggerBase =
  'flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left text-mercury-900 transition-colors focus:outline-none focus:ring-2'

const disabledClasses = 'bg-mercury-100 text-mercury-500 cursor-not-allowed'

const triggerSizeClasses: Record<ComboboxSize, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[2rem]',
  md: 'px-3 py-2 text-sm min-h-[2.5rem]',
  lg: 'px-4 py-2.5 text-base min-h-[3rem]',
}

const iconSizeClasses: Record<ComboboxSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus:border-primary-500 focus:ring-primary-100'

const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus:border-scarlet-500 focus:ring-scarlet-100'

export const Combobox = (props: ComboboxProps) => {
  const ctx = useFieldContext()
  const reactId = useId()

  const isMulti = props.multiple === true

  const {
    options,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Sin resultados',
    loadingMessage = 'Cargando...',
    clearable = true,
    disabled,
    invalid,
    size = 'md',
    className,
    name: nameProp,
    id: idProp,
    ariaLabel,
    onBlur: onBlurProp,
    searchValue,
    onSearchChange,
    loading = false,
  } = props

  const singleProps = !isMulti ? (props as ComboboxSingleProps) : null
  const multiProps = isMulti ? (props as ComboboxMultiProps) : null
  const maxVisibleChips = multiProps?.maxVisibleChips ?? 3
  const enableSelectAll = multiProps?.enableSelectAll === true

  const isAsync = onSearchChange !== undefined

  const ctxFieldValue = ctx?.field.value
  const fieldName = ctx?.field.name ?? nameProp
  const isDisabled = ctx ? (ctx.field.disabled ?? disabled) : disabled
  const hasError = ctx ? ctx.fieldState.invalid : false
  const showInvalid = invalid ?? hasError
  const triggerId = ctx?.id ?? idProp ?? `${reactId}-trigger`
  const listboxId = `${reactId}-listbox`

  const currentValues: string[] = (() => {
    if (isMulti) {
      const raw = ctx ? ctxFieldValue : multiProps?.value
      return Array.isArray(raw) ? (raw as string[]) : []
    }
    const raw = ctx ? ctxFieldValue : singleProps?.value
    return typeof raw === 'string' && raw.length > 0 ? [raw] : []
  })()

  const selectedOptions: ComboboxOption[] = (() => {
    if (isMulti && multiProps?.selectedOptions !== undefined) {
      return multiProps.selectedOptions
    }
    if (!isMulti && singleProps?.selectedOption !== undefined) {
      return singleProps.selectedOption ? [singleProps.selectedOption] : []
    }
    return currentValues
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is ComboboxOption => o !== undefined)
  })()

  const [open, setOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState('')
  const [prevOpen, setPrevOpen] = useState(false)

  const search = isAsync ? (searchValue ?? '') : internalSearch
  const setSearch = isAsync ? (onSearchChange ?? (() => {})) : setInternalSearch

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && !isAsync) setInternalSearch('')
    if (open && isAsync && onSearchChange) onSearchChange('')
  }

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: 'fixed',
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      sizeMiddleware({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.max(180, Math.min(availableHeight - 8, 320))}px`,
          })
        },
        padding: 8,
      }),
    ],
  })

  const commit = useCallback(
    (next: string[]) => {
      if (isMulti) {
        if (ctx) ctx.field.onChange(next)
        else multiProps?.onChange?.(next)
      } else {
        const value = next[0] ?? null
        if (ctx) ctx.field.onChange(value ?? '')
        else singleProps?.onChange?.(value)
      }
    },
    [isMulti, ctx, multiProps, singleProps],
  )

  const visibleOptions: ComboboxOption[] = (() => {
    if (!isMulti || !enableSelectAll) return []
    if (isAsync || !search) return options.filter((o) => !o.disabled)
    const q = search.toLowerCase()
    return options.filter(
      (o) =>
        !o.disabled && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)),
    )
  })()

  const visibleValues = visibleOptions.map((o) => o.value)
  const allVisibleSelected =
    visibleValues.length > 0 && visibleValues.every((v) => currentValues.includes(v))

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      commit(currentValues.filter((v) => !visibleValues.includes(v)))
    } else {
      const merged = Array.from(new Set([...currentValues, ...visibleValues]))
      commit(merged)
    }
  }

  const dispatchBlur = useCallback(() => {
    if (ctx) ctx.field.onBlur()
    else onBlurProp?.()
  }, [ctx, onBlurProp])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      const trigger = refs.reference.current as HTMLElement | null
      const floating = refs.floating.current
      const target = event.target as Node | null
      if (!target) return
      if (trigger?.contains(target)) return
      if (floating?.contains(target)) return
      setOpen(false)
      dispatchBlur()
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, dispatchBlur, refs])

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
      const next = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue]
      commit(next)
    } else {
      commit([optionValue])
      setOpen(false)
      const trigger = refs.reference.current as HTMLElement | null
      window.setTimeout(() => trigger?.focus(), 0)
    }
  }

  const removeValue = (optionValue: string) => {
    commit(currentValues.filter((v) => v !== optionValue))
  }

  const handleClear = (event: ReactMouseEvent) => {
    event.stopPropagation()
    commit([])
    const trigger = refs.reference.current as HTMLElement | null
    trigger?.focus()
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
      const trigger = refs.reference.current as HTMLElement | null
      window.setTimeout(() => trigger?.focus(), 0)
    }
  }

  const handleTriggerClick = () => {
    if (!isDisabled) setOpen((prev) => !prev)
  }

  const handleMultiTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (isDisabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((prev) => !prev)
    } else if (event.key === 'ArrowDown' && !open) {
      event.preventDefault()
      setOpen(true)
    }
  }

  const visibleChips = selectedOptions.slice(0, maxVisibleChips)
  const hiddenChipsCount = selectedOptions.length - visibleChips.length
  const hasSelection = selectedOptions.length > 0

  const triggerCommonAria = {
    id: triggerId,
    role: 'combobox' as const,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': open,
    'aria-controls': open ? listboxId : undefined,
    'aria-invalid': showInvalid || undefined,
    'aria-required': ctx?.required || undefined,
    'aria-describedby': hasError ? ctx?.errorId : undefined,
    'aria-label': !ctx?.labelId && ariaLabel ? ariaLabel : undefined,
  }

  const triggerClasses = cn(
    triggerBase,
    triggerSizeClasses[size],
    isDisabled ? disabledClasses : showInvalid ? invalidClasses : validClasses,
    className,
  )

  return (
    <>
      {isMulti ? (
        <div
          {...triggerCommonAria}
          ref={refs.setReference}
          aria-labelledby={ctx?.labelId}
          tabIndex={isDisabled ? -1 : 0}
          onClick={handleTriggerClick}
          onKeyDown={handleMultiTriggerKeyDown}
          onBlur={handleTriggerBlur}
          aria-disabled={isDisabled || undefined}
          className={cn(triggerClasses, 'cursor-pointer')}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {!hasSelection ? (
              <span className="text-mercury-400">{placeholder}</span>
            ) : (
              <>
                {visibleChips.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 rounded bg-mercury-100 px-1.5 py-0.5 text-xs font-medium text-mercury-700"
                  >
                    <span className="max-w-[8rem] truncate">{opt.label}</span>
                    {!isDisabled && (
                      <button
                        type="button"
                        aria-label={`Quitar ${opt.label}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeValue(opt.value)
                        }}
                        className="rounded text-mercury-500 hover:bg-mercury-200 hover:text-scarlet-600"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </span>
                ))}
                {hiddenChipsCount > 0 && (
                  <span className="text-xs text-mercury-500">+{hiddenChipsCount} más</span>
                )}
              </>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && hasSelection && !isDisabled && (
              <button
                type="button"
                aria-label="Limpiar selección"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="rounded p-0.5 text-mercury-400 hover:bg-mercury-100 hover:text-scarlet-600"
              >
                <X className={iconSizeClasses[size]} />
              </button>
            )}
            <ChevronDown
              className={cn(
                'text-mercury-400 transition-transform',
                iconSizeClasses[size],
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </span>
        </div>
      ) : (
        <button
          {...triggerCommonAria}
          type="button"
          // eslint-disable-next-line react-hooks/refs -- refs.setReference de @floating-ui/react es callback ref destinado al elemento DOM.
          ref={refs.setReference}
          disabled={isDisabled}
          onClick={handleTriggerClick}
          onBlur={handleTriggerBlur}
          className={triggerClasses}
        >
          <span className={cn('min-w-0 flex-1 truncate', !hasSelection && 'text-mercury-400')}>
            {selectedOptions[0]?.label ?? currentValues[0] ?? placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && hasSelection && !isDisabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpiar selección"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="rounded p-0.5 text-mercury-400 hover:bg-mercury-100 hover:text-scarlet-600"
              >
                <X className={iconSizeClasses[size]} />
              </span>
            )}
            <ChevronDown
              className={cn(
                'text-mercury-400 transition-transform',
                iconSizeClasses[size],
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </span>
        </button>
      )}

      {open && !isDisabled && (
        <div
          // eslint-disable-next-line react-hooks/refs -- refs.setFloating de @floating-ui/react es callback ref destinado al elemento DOM.
          ref={refs.setFloating}
          style={floatingStyles}
          onKeyDown={handleDropdownKeyDown}
          className="z-50 overflow-hidden rounded-lg border border-mercury-200 bg-white shadow-lg"
        >
          <Command label="Buscar opción" shouldFilter={!isAsync} className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-mercury-200 px-3">
              <Search className="size-4 text-mercury-400" aria-hidden="true" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={searchPlaceholder}
                autoFocus
                className="h-9 w-full bg-transparent text-sm text-mercury-900 placeholder:text-mercury-400 focus:outline-none"
              />
            </div>
            {enableSelectAll && visibleValues.length > 0 && !loading && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSelectAll}
                className="flex w-full items-center justify-between border-b border-mercury-200 px-3 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50"
              >
                <span>{allVisibleSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}</span>
                {allVisibleSelected ? (
                  <X className="size-3.5" aria-hidden="true" />
                ) : (
                  <Check className="size-3.5" aria-hidden="true" />
                )}
              </button>
            )}
            <Command.List id={listboxId} className="max-h-64 overflow-y-auto py-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-mercury-500">
                  <Spinner size="sm" />
                  <span>{loadingMessage}</span>
                </div>
              ) : (
                <>
                  <Command.Empty className="px-3 py-6 text-center text-xs text-mercury-500">
                    {emptyMessage}
                  </Command.Empty>
                  {options.map((option) => {
                    const isSelected = currentValues.includes(option.value)
                    return (
                      <Command.Item
                        key={option.value}
                        value={option.label}
                        keywords={[option.value]}
                        disabled={option.disabled}
                        onSelect={() => handleSelect(option.value)}
                        className="flex cursor-pointer items-start justify-between gap-2 px-3 py-2 text-sm text-mercury-700 aria-selected:bg-primary-50 aria-selected:text-primary-900 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{option.label}</span>
                          {option.description && (
                            <span className="truncate text-xs text-mercury-500">
                              {option.description}
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <Check className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                        )}
                      </Command.Item>
                    )
                  })}
                </>
              )}
            </Command.List>
          </Command>
        </div>
      )}

      {ctx && !isMulti && (
        <input
          type="hidden"
          name={fieldName}
          value={currentValues[0] ?? ''}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </>
  )
}
