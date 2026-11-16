import type { TextareaHTMLAttributes, Ref } from 'react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'

type TextAreaSize = 'sm' | 'md' | 'lg'
type TextAreaResize = 'none' | 'vertical' | 'both'

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: TextAreaSize
  invalid?: boolean
  resize?: TextAreaResize
  showCounter?: boolean
  rows?: number
  ref?: Ref<HTMLTextAreaElement>
}

const baseClasses =
  'block w-full rounded-lg border bg-white text-mercury-900 placeholder:text-mercury-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-mercury-100 disabled:text-mercury-500 disabled:cursor-not-allowed'

const sizeClasses: Record<TextAreaSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}

const resizeClasses: Record<TextAreaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
}

const validClasses =
  'border-mercury-300 hover:border-mercury-400 focus:border-primary-500 focus:ring-primary-100'

const invalidClasses =
  'border-scarlet-400 hover:border-scarlet-500 focus:border-scarlet-500 focus:ring-scarlet-100'

const counterClasses = (current: number, max: number) =>
  cn('text-xs', current >= max ? 'text-scarlet-600' : 'text-mercury-500')

export const TextArea = ({
  size = 'md',
  invalid,
  resize = 'vertical',
  showCounter = false,
  rows = 4,
  maxLength,
  className,
  ref,
  id,
  ...props
}: TextAreaProps) => {
  const ctx = useFieldContext()

  if (ctx) {
    const { id: fieldId, errorId, required, fieldState, field } = ctx
    const { name, value, onChange, onBlur, disabled: fieldDisabled } = field
    const stringValue = typeof value === 'string' ? value : ''
    const hasError = fieldState.invalid
    const showInvalid = invalid ?? hasError
    const counterVisible = showCounter && typeof maxLength === 'number'

    return (
      <div>
        <textarea
          {...props}
          // eslint-disable-next-line react-hooks/refs -- field.ref es callback ref retornado por useController de react-hook-form, diseñado para pasarse como prop ref. La regla detecta falsos positivos en objetos cuyo nombre incluye "ref" o contienen un callback ref.
          ref={field.ref}
          id={fieldId}
          name={name}
          value={stringValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={fieldDisabled ?? props.disabled}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={showInvalid}
          aria-describedby={hasError ? errorId : undefined}
          aria-required={required || undefined}
          className={cn(
            baseClasses,
            sizeClasses[size],
            resizeClasses[resize],
            showInvalid ? invalidClasses : validClasses,
            className,
          )}
        />
        {counterVisible && (
          <div className="mt-1 flex justify-end">
            <span className={counterClasses(stringValue.length, maxLength!)}>
              {stringValue.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    )
  }

  const showInvalid = invalid ?? false
  const standaloneValue = typeof props.value === 'string' ? props.value : ''
  const counterVisible = showCounter && typeof maxLength === 'number'

  return (
    <div>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={showInvalid || undefined}
        className={cn(
          baseClasses,
          sizeClasses[size],
          resizeClasses[resize],
          showInvalid ? invalidClasses : validClasses,
          className,
        )}
        {...props}
      />
      {counterVisible && (
        <div className="mt-1 flex justify-end">
          <span className={counterClasses(standaloneValue.length, maxLength!)}>
            {standaloneValue.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}
