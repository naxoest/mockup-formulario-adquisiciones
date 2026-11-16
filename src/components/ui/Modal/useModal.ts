import { useContext, useMemo } from 'react'
import type { ComponentType } from 'react'
import { ModalContext, type AnyModalComponent, type ModalComponentProps } from './ModalContext'

export interface UseModalReturn {
  open: <TResult = void, TProps extends Record<string, unknown> = Record<string, unknown>>(
    Component: ComponentType<ModalComponentProps<TResult> & TProps>,
    props: TProps,
  ) => Promise<TResult>
  closeAll: () => void
}

export const useModal = (): UseModalReturn => {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('useModal debe usarse dentro de un ModalProvider')
  }
  return useMemo<UseModalReturn>(
    () => ({
      open: (Component, props) => ctx.open(Component as AnyModalComponent, props) as Promise<never>,
      closeAll: ctx.closeAll,
    }),
    [ctx],
  )
}
