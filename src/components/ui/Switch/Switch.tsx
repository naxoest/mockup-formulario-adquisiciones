import type { InputHTMLAttributes, Ref, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'

type SwitchSize = 'sm' | 'md' | 'lg'

interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'role'
> {
  size?: SwitchSize
  invalid?: boolean
  label?: ReactNode
  description?: ReactNode
  ref?: Ref<HTMLInputElement>
}

const trackSizes: Record<SwitchSize, string> = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-11 h-6',
}

const thumbSizes: Record<SwitchSize, string> = {
  sm: 'size-3 peer-checked:translate-x-3',
  md: 'size-4 peer-checked:translate-x-4',
  lg: 'size-5 peer-checked:translate-x-5',
}

const labelSizeClasses: Record<SwitchSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const trackBase =
  'block rounded-full bg-mercury-300 transition-colors peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-primary-200'

const trackInvalid =
  'bg-scarlet-200 peer-checked:bg-scarlet-600 peer-focus-visible:ring-scarlet-200'

const thumbBase = 'absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform'

export const Switch = ({
  size = 'md',
  invalid,
  label,
  description,
  className,
  ref,
  id,
  disabled,
  ...props
}: SwitchProps) => {
  const ctx = useFieldContext()

  if (ctx) {
    const { id: fieldId, errorId, required, fieldState, field } = ctx
    const { value, onChange, onBlur, disabled: fieldDisabled, name, ref: inputRef } = field

    const checked = Boolean(value)
    const hasError = fieldState.invalid
    const showInvalid = invalid ?? hasError
    const isDisabled = fieldDisabled ?? disabled

    return (
      <label
        htmlFor={fieldId}
        className={cn(
          'inline-flex items-center gap-2',
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span className="relative inline-flex">
          <input
            {...props}
            type="checkbox"
            role="switch"
            ref={inputRef}
            id={fieldId}
            name={name}
            checked={checked}
            onChange={onChange}
            onBlur={onBlur}
            disabled={isDisabled}
            aria-invalid={showInvalid}
            aria-describedby={hasError ? errorId : undefined}
            aria-required={required || undefined}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(trackBase, showInvalid && trackInvalid, trackSizes[size], className)}
          />
          <span aria-hidden="true" className={cn(thumbBase, thumbSizes[size])} />
        </span>
        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && (
              <span className={cn('font-medium text-mercury-700', labelSizeClasses[size])}>
                {label}
              </span>
            )}
            {description && <span className="text-xs text-mercury-500">{description}</span>}
          </span>
        )}
      </label>
    )
  }

  const showInvalid = invalid ?? false

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <span className="relative inline-flex">
        <input
          {...props}
          type="checkbox"
          role="switch"
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={showInvalid || undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(trackBase, showInvalid && trackInvalid, trackSizes[size], className)}
        />
        <span aria-hidden="true" className={cn(thumbBase, thumbSizes[size])} />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span className={cn('font-medium text-mercury-700', labelSizeClasses[size])}>
              {label}
            </span>
          )}
          {description && <span className="text-xs text-mercury-500">{description}</span>}
        </span>
      )}
    </label>
  )
}
