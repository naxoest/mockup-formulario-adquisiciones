import { createContext, type ComponentType, type ReactNode } from 'react'
import type { ConfirmVariant } from './ConfirmDialog'
import type { ModalSize } from './Modal.types'

export interface ConfirmOptions {
  title: string
  message: ReactNode
  variant?: ConfirmVariant
  confirmText?: string
  cancelText?: string
  size?: ModalSize
  onConfirm?: () => void | Promise<void>
}

export interface ModalComponentProps<TResult = void> {
  open: boolean
  onExited: () => void
  resolve: (value: TResult) => void
  reject: (reason?: unknown) => void
}

export type AnyModalComponent = ComponentType<
  ModalComponentProps<unknown> & Record<string, unknown>
>

export interface ModalContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  open: (Component: AnyModalComponent, props: Record<string, unknown>) => Promise<unknown>
  closeAll: () => void
}

export const ModalContext = createContext<ModalContextValue | null>(null)
