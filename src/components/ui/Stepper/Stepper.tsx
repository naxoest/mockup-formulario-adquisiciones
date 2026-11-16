import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { StepperContext, useStepperContext, type StepperContextValue } from './StepperContext'
import { StepperStep } from './StepperStep'
import { StepperCompleted } from './StepperCompleted'
import type {
  StepperColor,
  StepperProps,
  StepperSize,
  StepperStepProps,
  StepperStepState,
} from './Stepper.types'

interface ColorTokens {
  bg: string
  text: string
  border: string
  ring: string
  line: string
  textLabel: string
}

const completedTokens: Record<StepperColor, ColorTokens> = {
  primary: {
    bg: 'bg-primary-700',
    text: 'text-white',
    border: 'border-primary-700',
    ring: '',
    line: 'bg-primary-700',
    textLabel: 'text-mercury-700',
  },
  jade: {
    bg: 'bg-jade-600',
    text: 'text-white',
    border: 'border-jade-600',
    ring: '',
    line: 'bg-jade-600',
    textLabel: 'text-mercury-700',
  },
  amethyst: {
    bg: 'bg-amethyst-600',
    text: 'text-white',
    border: 'border-amethyst-600',
    ring: '',
    line: 'bg-amethyst-600',
    textLabel: 'text-mercury-700',
  },
  plum: {
    bg: 'bg-plum-700',
    text: 'text-white',
    border: 'border-plum-700',
    ring: '',
    line: 'bg-plum-700',
    textLabel: 'text-mercury-700',
  },
  abyss: {
    bg: 'bg-abyss-800',
    text: 'text-white',
    border: 'border-abyss-800',
    ring: '',
    line: 'bg-abyss-800',
    textLabel: 'text-mercury-700',
  },
  magenta: {
    bg: 'bg-magenta-500',
    text: 'text-white',
    border: 'border-magenta-500',
    ring: '',
    line: 'bg-magenta-500',
    textLabel: 'text-mercury-700',
  },
  saffron: {
    bg: 'bg-saffron-500',
    text: 'text-white',
    border: 'border-saffron-500',
    ring: '',
    line: 'bg-saffron-500',
    textLabel: 'text-mercury-700',
  },
}

const currentTokens: Record<StepperColor, ColorTokens> = {
  primary: {
    bg: 'bg-white',
    text: 'text-primary-800',
    border: 'border-primary-700',
    ring: 'ring-primary-100',
    line: '',
    textLabel: 'text-primary-900',
  },
  jade: {
    bg: 'bg-white',
    text: 'text-jade-700',
    border: 'border-jade-600',
    ring: 'ring-jade-100',
    line: '',
    textLabel: 'text-jade-900',
  },
  amethyst: {
    bg: 'bg-white',
    text: 'text-amethyst-700',
    border: 'border-amethyst-600',
    ring: 'ring-amethyst-100',
    line: '',
    textLabel: 'text-amethyst-900',
  },
  plum: {
    bg: 'bg-white',
    text: 'text-plum-700',
    border: 'border-plum-700',
    ring: 'ring-plum-100',
    line: '',
    textLabel: 'text-plum-900',
  },
  abyss: {
    bg: 'bg-white',
    text: 'text-abyss-800',
    border: 'border-abyss-800',
    ring: 'ring-abyss-100',
    line: '',
    textLabel: 'text-abyss-900',
  },
  magenta: {
    bg: 'bg-white',
    text: 'text-magenta-700',
    border: 'border-magenta-500',
    ring: 'ring-magenta-100',
    line: '',
    textLabel: 'text-magenta-900',
  },
  saffron: {
    bg: 'bg-white',
    text: 'text-saffron-700',
    border: 'border-saffron-500',
    ring: 'ring-saffron-100',
    line: '',
    textLabel: 'text-saffron-900',
  },
}

const pendingTokens = {
  bg: 'bg-mercury-50',
  text: 'text-mercury-400',
  border: 'border-mercury-300',
  line: 'bg-mercury-200',
  textLabel: 'text-mercury-400',
  textDescription: 'text-mercury-300',
}

const errorTokens = {
  bg: 'bg-scarlet-50',
  text: 'text-scarlet-600',
  border: 'border-scarlet-500',
  ring: 'ring-scarlet-100',
  line: 'bg-scarlet-500',
  textLabel: 'text-scarlet-700',
  textDescription: 'text-scarlet-500',
}

interface SizeTokens {
  circle: string
  circleText: string
  iconSize: number
  labelText: string
  descriptionText: string
  lineHeight: string
  lineOffset: string
  gap: string
}

const sizeMap: Record<StepperSize, SizeTokens> = {
  sm: {
    circle: 'h-7 w-7',
    circleText: 'text-xs',
    iconSize: 14,
    labelText: 'text-xs',
    descriptionText: 'text-[10px]',
    lineHeight: 'h-px',
    lineOffset: 'mt-[14px]',
    gap: 'mt-2',
  },
  md: {
    circle: 'h-9 w-9',
    circleText: 'text-sm',
    iconSize: 18,
    labelText: 'text-sm',
    descriptionText: 'text-xs',
    lineHeight: 'h-0.5',
    lineOffset: 'mt-[18px]',
    gap: 'mt-2',
  },
  lg: {
    circle: 'h-11 w-11',
    circleText: 'text-base',
    iconSize: 22,
    labelText: 'text-base',
    descriptionText: 'text-sm',
    lineHeight: 'h-0.5',
    lineOffset: 'mt-[22px]',
    gap: 'mt-3',
  },
}

function computeStepState(index: number, active: number, error?: boolean): StepperStepState {
  if (error) return 'error'
  if (index < active) return 'completed'
  if (index === active) return 'current'
  return 'pending'
}

interface StepIndicatorProps {
  index: number
  total: number
  stepProps: StepperStepProps
}

function StepIndicator({ index, total, stepProps }: StepIndicatorProps) {
  const ctx = useStepperContext()
  const {
    active,
    completedColor,
    currentColor,
    size,
    orientation,
    allowNextStepsSelect,
    onStepClick,
    defaultCompletedIcon,
  } = ctx

  const state = computeStepState(index, active, stepProps.error)
  const sizeTokens = sizeMap[size]

  const completedColorFinal = stepProps.color ?? completedColor
  const currentColorFinal = stepProps.color ?? currentColor

  const isLast = index === total - 1
  const allowStepSelect = stepProps.allowStepSelect ?? true
  const isFuture = index > active
  const canClick =
    onStepClick !== undefined && allowStepSelect && !(isFuture && !allowNextStepsSelect)

  let circleClasses = ''
  let labelClasses = ''
  let descriptionClasses = ''
  let circleContent: ReactNode = (
    <span className={cn('font-semibold', sizeTokens.circleText)}>{index + 1}</span>
  )

  if (stepProps.loading) {
    circleContent = <Loader2 className="animate-spin" size={sizeTokens.iconSize} aria-hidden />
  } else if (stepProps.icon && state !== 'completed' && state !== 'error') {
    circleContent = stepProps.icon
  }

  if (state === 'completed') {
    const t = completedTokens[completedColorFinal]
    circleClasses = cn(t.bg, t.text, 'border', t.border)
    labelClasses = cn(t.textLabel, 'font-medium')
    descriptionClasses = 'text-mercury-500'
    if (!stepProps.loading) {
      const icon = stepProps.completedIcon ?? defaultCompletedIcon ?? (
        <Check size={sizeTokens.iconSize} aria-hidden />
      )
      circleContent = icon
    }
  } else if (state === 'current') {
    const t = currentTokens[currentColorFinal]
    circleClasses = cn(t.bg, t.text, 'border-2', t.border, 'ring-4', t.ring)
    labelClasses = cn(t.textLabel, 'font-semibold')
    descriptionClasses = 'text-mercury-500'
  } else if (state === 'pending') {
    circleClasses = cn(pendingTokens.bg, pendingTokens.text, 'border', pendingTokens.border)
    labelClasses = pendingTokens.textLabel
    descriptionClasses = pendingTokens.textDescription
  } else {
    circleClasses = cn(
      errorTokens.bg,
      errorTokens.text,
      'border-2',
      errorTokens.border,
      'ring-4',
      errorTokens.ring,
    )
    labelClasses = cn(errorTokens.textLabel, 'font-semibold')
    descriptionClasses = errorTokens.textDescription
    if (!stepProps.loading) {
      circleContent = <AlertCircle size={sizeTokens.iconSize} aria-hidden />
    }
  }

  const circleBase = cn(
    'flex items-center justify-center rounded-full transition-all duration-200 shrink-0',
    sizeTokens.circle,
    circleClasses,
  )

  const ariaCurrent: 'step' | undefined = state === 'current' ? 'step' : undefined

  const circleNode = (
    <button
      type="button"
      onClick={canClick ? () => onStepClick?.(index) : undefined}
      disabled={!canClick}
      aria-current={ariaCurrent}
      aria-label={`Paso ${index + 1}: ${stepProps.label}`}
      className={cn(
        circleBase,
        canClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2'
          : 'cursor-default',
      )}
    >
      {circleContent}
    </button>
  )

  const labelNode = (
    <div
      className={cn(
        orientation === 'horizontal'
          ? cn('text-center', sizeTokens.gap, 'max-w-[10rem] mx-auto')
          : 'ml-3 flex-1',
      )}
    >
      <div className={cn(sizeTokens.labelText, labelClasses, 'truncate')}>{stepProps.label}</div>
      {stepProps.description && (
        <div className={cn(sizeTokens.descriptionText, descriptionClasses, 'mt-0.5')}>
          {stepProps.description}
        </div>
      )}
    </div>
  )

  const connectorActive = index < active
  const connectorClass = connectorActive
    ? completedTokens[completedColorFinal].line
    : pendingTokens.line

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start', isLast ? 'shrink-0' : 'flex-1')}>
        <div className="flex flex-col items-center shrink-0">
          {circleNode}
          {labelNode}
        </div>
        {!isLast && (
          <div
            aria-hidden
            className={cn(
              'flex-1 transition-colors duration-300 mx-2',
              sizeTokens.lineHeight,
              sizeTokens.lineOffset,
              connectorClass,
            )}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-start">
        {circleNode}
        {labelNode}
      </div>
      {!isLast && (
        <div
          aria-hidden
          className={cn(
            'my-2 w-0.5 h-8 transition-colors duration-300',
            connectorClass,
            size === 'sm' && 'ml-[14px]',
            size === 'md' && 'ml-[18px]',
            size === 'lg' && 'ml-[22px]',
          )}
        />
      )}
    </div>
  )
}

interface MobileStepperBarProps {
  active: number
  totalSteps: number
  currentLabel: string
  completedColor: StepperColor
  currentColor: StepperColor
  isCompleted: boolean
}

function MobileStepperBar({
  active,
  totalSteps,
  currentLabel,
  completedColor,
  currentColor,
  isCompleted,
}: MobileStepperBarProps) {
  const percent = isCompleted ? 100 : Math.round((active / totalSteps) * 100)
  const ct = currentTokens[currentColor]
  return (
    <div className="w-full" role="group" aria-label="Indicador de progreso">
      <div className="flex items-center justify-between gap-3">
        <div className={cn('text-sm font-semibold truncate', ct.textLabel)}>
          {isCompleted ? 'Completado' : currentLabel}
        </div>
        <div className="text-xs text-mercury-500 shrink-0">
          {isCompleted ? `${totalSteps} de ${totalSteps}` : `Paso ${active + 1} de ${totalSteps}`}
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mercury-200">
        <div
          className={cn('h-full transition-all duration-300', completedTokens[completedColor].line)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function Stepper({
  active,
  onStepClick,
  children,
  color,
  completedColor,
  currentColor,
  completedIcon,
  size = 'md',
  orientation = 'horizontal',
  allowNextStepsSelect = true,
  className,
  contentClassName,
}: StepperProps) {
  const finalCompletedColor: StepperColor = completedColor ?? color ?? 'jade'
  const finalCurrentColor: StepperColor = currentColor ?? color ?? 'primary'

  const childrenArray = Children.toArray(children).filter(isValidElement)
  const stepElements = childrenArray.filter(
    (child): child is ReactElement<StepperStepProps> => child.type === StepperStep,
  )
  const completedElement = childrenArray.find((child) => child.type === StepperCompleted) as
    | ReactElement<{ children?: ReactNode }>
    | undefined

  const totalSteps = stepElements.length
  const isCompletedView = active >= totalSteps
  const safeActive = Math.min(active, totalSteps - 1)
  const currentLabel = stepElements[safeActive]?.props.label ?? ''

  const contextValue: StepperContextValue = {
    active,
    totalSteps,
    completedColor: finalCompletedColor,
    currentColor: finalCurrentColor,
    size,
    orientation,
    allowNextStepsSelect,
    onStepClick,
    defaultCompletedIcon: completedIcon,
  }

  const activeContent = isCompletedView
    ? completedElement?.props.children
    : stepElements[active]?.props.children

  return (
    <StepperContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {orientation === 'horizontal' && (
          <div className="block sm:hidden">
            <MobileStepperBar
              active={active}
              totalSteps={totalSteps}
              currentLabel={currentLabel}
              completedColor={finalCompletedColor}
              currentColor={finalCurrentColor}
              isCompleted={isCompletedView}
            />
          </div>
        )}
        <div
          role="group"
          aria-label="Indicador de progreso"
          className={cn(
            orientation === 'horizontal'
              ? 'hidden sm:flex flex-row items-start w-full'
              : 'flex flex-col gap-1',
          )}
        >
          {stepElements.map((step, index) => (
            <StepIndicator key={index} index={index} total={totalSteps} stepProps={step.props} />
          ))}
        </div>
        {activeContent !== undefined && activeContent !== null && (
          <div
            key={isCompletedView ? 'completed' : active}
            className={cn('mt-6', contentClassName)}
          >
            {activeContent}
          </div>
        )}
      </div>
    </StepperContext.Provider>
  )
}

Stepper.Step = StepperStep
Stepper.Completed = StepperCompleted
