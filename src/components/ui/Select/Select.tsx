import type { SelectHTMLAttributes, Ref, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'

type SelectSize = 'sm' | 'md' | 'lg'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize
  invalid?: boolean
  ref?: Ref<HTMLSelectElement>
  children: ReactNode
}

const baseClasses =
  'block w-full appearance-none rounded-lg border bg-white text-mercury-900 transition-colors focus:outline-none focus:ring-2 disabled:bg-mercury-100 disabled:text-mercury-500 disabled:cursor-not-allowed pr-9'

const sizeClasses: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}

const iconSizeClasses: Record<SelectSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus:border-primary-500 focus:ring-primary-100'

const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus:border-scarlet-500 focus:ring-scarlet-100'

export const Select = ({
  size = 'md',
  invalid,
  className,
  ref,
  id,
  disabled,
  children,
  ...props
}: SelectProps) => {
  const ctx = useFieldContext()

  if (ctx) {
    const { id: fieldId, errorId, required, fieldState, field } = ctx
    const { name, value, onChange, onBlur, disabled: fieldDisabled } = field
    const hasError = fieldState.invalid
    const showInvalid = invalid ?? hasError
    const isDisabled = fieldDisabled ?? disabled

    return (
      <div className="relative">
        <select
          {...props}
          // eslint-disable-next-line react-hooks/refs -- field.ref de useController es callback ref destinado al elemento DOM.
          ref={field.ref}
          id={fieldId}
          name={name}
          value={(value as string | number | readonly string[] | undefined) ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          aria-invalid={showInvalid}
          aria-describedby={hasError ? errorId : undefined}
          aria-required={required || undefined}
          className={cn(
            baseClasses,
            sizeClasses[size],
            showInvalid ? invalidClasses : validClasses,
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mercury-400',
            iconSizeClasses[size],
          )}
        />
      </div>
    )
  }

  const showInvalid = invalid ?? false

  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={showInvalid || undefined}
        className={cn(
          baseClasses,
          sizeClasses[size],
          showInvalid ? invalidClasses : validClasses,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mercury-400',
          iconSizeClasses[size],
        )}
      />
    </div>
  )
}
