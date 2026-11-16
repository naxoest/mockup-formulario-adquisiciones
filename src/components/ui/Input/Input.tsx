import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

const baseClasses =
  'block w-full rounded-lg border bg-white text-mercury-900 placeholder:text-mercury-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-mercury-100 disabled:text-mercury-500 disabled:cursor-not-allowed'

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}

const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus:border-primary-500 focus:ring-primary-100'

const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus:border-scarlet-500 focus:ring-scarlet-100'

export const Input = ({ size = 'md', invalid, className, ref, id, ...props }: InputProps) => {
  const ctx = useFieldContext()

  if (ctx) {
    const { id: fieldId, errorId, required, fieldState, field } = ctx
    const { name, value, onChange, onBlur, disabled: fieldDisabled } = field
    const hasError = fieldState.invalid
    const showInvalid = invalid ?? hasError

    return (
      <input
        {...props}
        // eslint-disable-next-line react-hooks/refs -- field.ref es un callback ref retornado por useController de react-hook-form, diseñado explícitamente para pasarse al elemento DOM como prop ref. La regla detecta falsos positivos en cualquier acceso a objetos cuyo nombre incluye "ref" o que contienen un callback ref.
        ref={field.ref}
        id={fieldId}
        name={name}
        value={(value as string | number | readonly string[] | undefined) ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={fieldDisabled ?? props.disabled}
        aria-invalid={showInvalid}
        aria-describedby={hasError ? errorId : undefined}
        aria-required={required || undefined}
        className={cn(
          baseClasses,
          sizeClasses[size],
          showInvalid ? invalidClasses : validClasses,
          className,
        )}
      />
    )
  }

  const showInvalid = invalid ?? false
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={showInvalid || undefined}
      className={cn(
        baseClasses,
        sizeClasses[size],
        showInvalid ? invalidClasses : validClasses,
        className,
      )}
      {...props}
    />
  )
}
