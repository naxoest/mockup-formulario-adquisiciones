import { useEffect, useRef, type InputHTMLAttributes, type Ref, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { mergeRefs } from '@/utils/mergeRefs'
import { useFieldContext } from '@/components/ui/Form'

type CheckboxSize = 'sm' | 'md' | 'lg'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: CheckboxSize
  invalid?: boolean
  label?: ReactNode
  description?: ReactNode
  indeterminate?: boolean
  ref?: Ref<HTMLInputElement>
}

const sizeClasses: Record<CheckboxSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const labelSizeClasses: Record<CheckboxSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const inputClasses =
  'shrink-0 rounded border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-mercury-100 disabled:border-mercury-200 disabled:cursor-not-allowed accent-primary-600'

const validClasses = 'border-mercury-300 hover:border-mercury-400 focus:ring-primary-200'

const invalidClasses = 'border-scarlet-400 hover:border-scarlet-500 focus:ring-scarlet-200'

export const Checkbox = ({
  size = 'md',
  invalid,
  label,
  description,
  indeterminate,
  className,
  ref,
  id,
  disabled,
  ...props
}: CheckboxProps) => {
  const ctx = useFieldContext()
  const localRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localRef.current && typeof indeterminate === 'boolean') {
      localRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  if (ctx) {
    const { id: fieldId, errorId, required, fieldState, field } = ctx
    const { value, onChange, onBlur, disabled: fieldDisabled } = field
    const checked = Boolean(value)
    const hasError = fieldState.invalid
    const showInvalid = invalid ?? hasError
    const isDisabled = fieldDisabled ?? disabled

    return (
      <label
        htmlFor={fieldId}
        className={cn(
          'inline-flex items-start gap-2',
          isDisabled ? 'cursor-not-allowed text-mercury-400' : 'cursor-pointer text-mercury-700',
        )}
      >
        <input
          {...props}
          type="checkbox"
          ref={mergeRefs(localRef, field.ref)}
          id={fieldId}
          name={field.name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          aria-invalid={showInvalid}
          aria-describedby={hasError ? errorId : undefined}
          aria-required={required || undefined}
          className={cn(
            inputClasses,
            sizeClasses[size],
            showInvalid ? invalidClasses : validClasses,
            'mt-0.5',
            className,
          )}
        />
        {(label || description) && (
          <span className="flex flex-col gap-0.5">
            {label && <span className={cn('font-medium', labelSizeClasses[size])}>{label}</span>}
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
        'inline-flex items-start gap-2',
        disabled ? 'cursor-not-allowed text-mercury-400' : 'cursor-pointer text-mercury-700',
      )}
    >
      <input
        {...props}
        type="checkbox"
        ref={mergeRefs(localRef, ref)}
        id={id}
        disabled={disabled}
        aria-invalid={showInvalid || undefined}
        className={cn(
          inputClasses,
          sizeClasses[size],
          showInvalid ? invalidClasses : validClasses,
          'mt-0.5',
          className,
        )}
      />
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className={cn('font-medium', labelSizeClasses[size])}>{label}</span>}
          {description && <span className="text-xs text-mercury-500">{description}</span>}
        </span>
      )}
    </label>
  )
}
