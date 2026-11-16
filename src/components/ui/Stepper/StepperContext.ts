import { createContext, useContext, type ReactNode } from 'react'
import type { StepperColor, StepperOrientation, StepperSize } from './Stepper.types'

export interface StepperContextValue {
  active: number
  totalSteps: number
  completedColor: StepperColor
  currentColor: StepperColor
  size: StepperSize
  orientation: StepperOrientation
  allowNextStepsSelect: boolean
  onStepClick?: (stepIndex: number) => void
  defaultCompletedIcon?: ReactNode
}

export const StepperContext = createContext<StepperContextValue | null>(null)

export function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext)
  if (!ctx) {
    throw new Error('StepperStep debe usarse dentro de Stepper')
  }
  return ctx
}
