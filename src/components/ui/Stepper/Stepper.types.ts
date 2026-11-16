import type { ReactNode } from 'react'

export type StepperColor =
  | 'primary'
  | 'jade'
  | 'primary'
  | 'amethyst'
  | 'plum'
  | 'abyss'
  | 'magenta'
  | 'saffron'
  | 'saffron'

export type StepperSize = 'sm' | 'md' | 'lg'
export type StepperOrientation = 'horizontal' | 'vertical'
export type StepperStepState = 'completed' | 'current' | 'pending' | 'error'

export interface StepperProps {
  active: number
  onStepClick?: (stepIndex: number) => void
  children: ReactNode
  color?: StepperColor
  completedColor?: StepperColor
  currentColor?: StepperColor
  completedIcon?: ReactNode
  size?: StepperSize
  orientation?: StepperOrientation
  allowNextStepsSelect?: boolean
  className?: string
  contentClassName?: string
}

export interface StepperStepProps {
  label: string
  description?: string
  icon?: ReactNode
  completedIcon?: ReactNode
  loading?: boolean
  error?: boolean
  allowStepSelect?: boolean
  color?: StepperColor
  children?: ReactNode
}

export interface StepperCompletedProps {
  children?: ReactNode
}
