import type { ReactNode } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export type ModalHeaderTone = 'default' | 'info' | 'warning' | 'error' | 'success'

export interface ModalProps {
  open: boolean
  onClose: () => void
  onExited?: () => void
  size?: ModalSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
  children: ReactNode
}

export interface ModalHeaderProps {
  children: ReactNode
  icon?: ReactNode
  tone?: ModalHeaderTone
  className?: string
}

export interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}
