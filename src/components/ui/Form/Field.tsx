import { useId, type ReactNode } from 'react'
import { useController, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/utils/cn'
import { FieldContext } from './FormContext'

interface FieldProps<TValues extends FieldValues = FieldValues> {
  name: FieldPath<TValues>
  label?: ReactNode
  description?: ReactNode
  required?: boolean
  optional?: boolean
  hideLabel?: boolean
  className?: string
  labelClassName?: string
  children: ReactNode
}

export const Field = <TValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required = false,
  optional = false,
  hideLabel = false,
  className,
  labelClassName,
  children,
}: FieldProps<TValues>) => {
  const id = useId()
  const labelId = `${id}-label`
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`
  const { field, fieldState } = useController<TValues>({ name })

  return (
    <FieldContext.Provider
      value={{
        id,
        labelId,
        errorId,
        descriptionId,
        required,
        hasDescription: !!description,
        field: field as FieldContextValueField,
        fieldState,
      }}
    >
      <div className={cn('space-y-1.5', className)}>
        {label && (
          <label
            id={labelId}
            htmlFor={id}
            className={cn(
              'block text-sm font-medium text-mercury-700',
              hideLabel && 'sr-only',
              labelClassName,
            )}
          >
            <span className="inline-flex items-center gap-1">
              {label}
              {required && (
                <span className="text-scarlet-600" aria-label="requerido">
                  *
                </span>
              )}
              {optional && !required && (
                <span className="text-xs font-normal text-mercury-400">(opcional)</span>
              )}
            </span>
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-xs text-mercury-500">
            {description}
          </p>
        )}
        {children}
        {fieldState.error && (
          <p id={errorId} role="alert" className="text-xs text-scarlet-600">
            {fieldState.error.message}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}

type FieldContextValueField = NonNullable<React.ContextType<typeof FieldContext>>['field']
