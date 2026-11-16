import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import {
  ModalContext,
  type AnyModalComponent,
  type ConfirmOptions,
  type ModalContextValue,
} from './ModalContext'

interface OpenEntry {
  id: number
  kind: 'custom'
  open: boolean
  Component: AnyModalComponent
  props: Record<string, unknown>
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

interface ConfirmEntry {
  id: number
  kind: 'confirm'
  open: boolean
  options: Required<Omit<ConfirmOptions, 'onConfirm'>> & {
    onConfirm?: () => void | Promise<void>
  }
  resolve: (value: boolean) => void
}

type StackEntry = OpenEntry | ConfirmEntry

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [stack, setStack] = useState<StackEntry[]>([])
  const idRef = useRef(0)

  const removeById = useCallback((id: number) => {
    setStack((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const beginCloseById = useCallback((id: number) => {
    setStack((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, open: false } : entry)),
    )
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const id = ++idRef.current
      const entry: ConfirmEntry = {
        id,
        kind: 'confirm',
        open: true,
        options: {
          title: options.title,
          message: options.message,
          variant: options.variant ?? 'warning',
          confirmText: options.confirmText ?? 'Confirmar',
          cancelText: options.cancelText ?? 'Cancelar',
          size: options.size ?? 'sm',
          onConfirm: options.onConfirm,
        },
        resolve,
      }
      setStack((current) => [...current, entry])
    })
  }, [])

  const open = useCallback((Component: AnyModalComponent, props: Record<string, unknown>) => {
    return new Promise<unknown>((resolve, reject) => {
      const id = ++idRef.current
      const entry: OpenEntry = {
        id,
        kind: 'custom',
        open: true,
        Component,
        props,
        resolve,
        reject,
      }
      setStack((current) => [...current, entry])
    })
  }, [])

  const closeAll = useCallback(() => {
    setStack((current) => {
      current.forEach((entry) => {
        if (entry.kind === 'confirm') {
          entry.resolve(false)
        } else {
          entry.reject(new Error('Modal cerrado por closeAll'))
        }
      })
      return current.map((entry) => ({ ...entry, open: false }))
    })
  }, [])

  const contextValue = useMemo<ModalContextValue>(
    () => ({ confirm, open, closeAll }),
    [confirm, open, closeAll],
  )

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {stack.map((entry) => {
        if (entry.kind === 'confirm') {
          const { options } = entry
          return (
            <ConfirmDialog
              key={entry.id}
              open={entry.open}
              title={options.title}
              message={options.message}
              variant={options.variant}
              confirmText={options.confirmText}
              cancelText={options.cancelText}
              size={options.size}
              onExited={() => removeById(entry.id)}
              onConfirm={async () => {
                if (options.onConfirm) {
                  await options.onConfirm()
                }
                entry.resolve(true)
                beginCloseById(entry.id)
              }}
              onCancel={() => {
                entry.resolve(false)
                beginCloseById(entry.id)
              }}
            />
          )
        }
        const { Component, props } = entry
        return (
          <Component
            key={entry.id}
            {...props}
            open={entry.open}
            onExited={() => removeById(entry.id)}
            resolve={(value: unknown) => {
              entry.resolve(value)
              beginCloseById(entry.id)
            }}
            reject={(reason?: unknown) => {
              entry.reject(reason)
              beginCloseById(entry.id)
            }}
          />
        )
      })}
    </ModalContext.Provider>
  )
}
