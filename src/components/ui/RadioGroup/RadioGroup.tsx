import { useId, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'

interface RadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

interface RadioGroupProps {
  options: RadioOption[]
  legend?: ReactNode
  description?: ReactNode
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  invalid?: boolean
  className?: string
  value?: string
  onChange?: (value: string) => void
  name?: string
}

const inputClasses =
  'mt-0.5 size-4 shrink-0 border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-mercury-100 disabled:border-mercury-200 disabled:cursor-not-allowed accent-primary-600'

const validClasses = 'border-mercury-300 hover:border-mercury-400 focus:ring-primary-200'
const invalidClasses = 'border-scarlet-400 hover:border-scarlet-500 focus:ring-scarlet-200'

export const RadioGroup = ({
  options,
  legend,
  description,
  orientation = 'vertical',
  disabled,
  invalid,
  className,
  value: valueProp,
  onChange: onChangeProp,
  name: nameProp,
}: RadioGroupProps) => {
  const ctx = useFieldContext()
  const fallbackId = useId()
  const fallbackName = useId()

  const inField = !!ctx
  const currentValue = ctx ? ((ctx.field.value as string | undefined) ?? '') : (valueProp ?? '')
  const groupName = ctx?.field.name ?? nameProp ?? fallbackName
  const groupDisabled = ctx ? (ctx.field.disabled ?? disabled) : disabled
  const hasError = ctx ? ctx.fieldState.invalid : false
  const showInvalid = invalid ?? hasError
  const errorId = ctx?.errorId
  const groupId = ctx?.id ?? fallbackId
  const legendId = `${groupId}-legend`

  const select = (next: string) => {
    if (ctx) {
      ctx.field.onChange(next)
    } else {
      onChangeProp?.(next)
    }
  }

  const handleBlur = () => {
    if (ctx) ctx.field.onBlur()
  }

  return (
    <fieldset
      id={groupId}
      disabled={groupDisabled}
      aria-invalid={showInvalid || undefined}
      aria-describedby={hasError ? errorId : undefined}
      className={cn(inField ? '' : 'space-y-1.5', className)}
    >
      {legend && !inField && (
        <legend id={legendId} className="text-sm font-medium text-mercury-700">
          {legend}
        </legend>
      )}
      {description && !inField && <p className="text-xs text-mercury-500">{description}</p>}
      <div
        className={cn(
          orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-x-4 gap-y-2',
        )}
        role="radiogroup"
        aria-labelledby={ctx ? ctx.labelId : legend ? legendId : undefined}
      >
        {options.map((option) => {
          const optionDisabled = groupDisabled || option.disabled
          const checked = currentValue === option.value
          return (
            <label
              key={option.value}
              className={cn(
                'inline-flex items-start gap-2',
                optionDisabled
                  ? 'cursor-not-allowed text-mercury-400'
                  : 'cursor-pointer text-mercury-700',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={checked}
                disabled={optionDisabled}
                onChange={() => select(option.value)}
                onBlur={handleBlur}
                className={cn(inputClasses, showInvalid ? invalidClasses : validClasses)}
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-mercury-500">{option.description}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
