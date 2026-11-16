import { createContext, useContext } from 'react'
import type { ControllerFieldState, ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface FieldContextValue {
  id: string
  labelId: string
  errorId: string
  descriptionId: string
  required: boolean
  hasDescription: boolean
  field: ControllerRenderProps<FieldValues>
  fieldState: ControllerFieldState
}

export const FieldContext = createContext<FieldContextValue | null>(null)

export const useFieldContext = () => useContext(FieldContext)
