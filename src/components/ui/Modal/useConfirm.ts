import { useContext } from 'react'
import { ModalContext, type ConfirmOptions } from './ModalContext'

export const useConfirm = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('useConfirm debe usarse dentro de un ModalProvider')
  }
  return (options: ConfirmOptions) => ctx.confirm(options)
}
