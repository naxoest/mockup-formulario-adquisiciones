import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ModalProvider } from './ModalProvider'
import { useConfirm } from './useConfirm'
import { useModal } from './useModal'
import { Modal } from './Modal'
import type { ModalComponentProps } from './ModalContext'

const fireModalExitTransition = () => {
  document.querySelectorAll('dialog').forEach((dialog) => {
    if (!dialog.dataset.open && dialog.open) {
      const event = new Event('transitionend', { bubbles: true }) as TransitionEvent
      Object.defineProperty(event, 'propertyName', { value: 'opacity' })
      Object.defineProperty(event, 'target', { value: dialog })
      dialog.dispatchEvent(event)
    }
  })
}

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
})

function ConfirmTrigger({ onResult }: { onResult: (result: boolean) => void }) {
  const confirm = useConfirm()
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await confirm({
          title: 'Eliminar',
          message: '¿Seguro?',
          variant: 'error',
        })
        onResult(result)
      }}
    >
      Abrir confirm
    </button>
  )
}

function AsyncConfirmTrigger({
  onResult,
  onConfirm,
}: {
  onResult: (result: boolean) => void
  onConfirm: () => Promise<void>
}) {
  const confirm = useConfirm()
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await confirm({
          title: 'Guardar',
          message: 'Procesar',
          onConfirm,
        })
        onResult(result)
      }}
    >
      Abrir confirm async
    </button>
  )
}

interface SimpleDialogProps extends ModalComponentProps<string> {
  label: string
}

function SimpleDialog({ label, resolve, reject }: SimpleDialogProps) {
  return (
    <Modal open onClose={() => reject()}>
      <Modal.Header>{label}</Modal.Header>
      <Modal.Body>
        <button type="button" onClick={() => resolve('ok')}>
          OK
        </button>
        <button type="button" onClick={() => reject(new Error('cancel'))}>
          Cancel
        </button>
      </Modal.Body>
    </Modal>
  )
}

function OpenTrigger({ onResult }: { onResult: (result: string) => void }) {
  const modal = useModal()
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          const result = await modal.open(SimpleDialog, { label: 'Dialog abierto' })
          onResult(result)
        } catch {
          onResult('rejected')
        }
      }}
    >
      Abrir modal
    </button>
  )
}

function StackTrigger({ onResults }: { onResults: (results: string[]) => void }) {
  const confirm = useConfirm()
  const [, setTick] = useState(0)
  return (
    <button
      type="button"
      onClick={async () => {
        const results: string[] = []
        const p1 = confirm({ title: 'Primero', message: 'A' })
        const p2 = confirm({ title: 'Segundo', message: 'B' })
        setTick((v) => v + 1)
        const [r1, r2] = await Promise.all([p1, p2])
        results.push(r1 ? 'si' : 'no')
        results.push(r2 ? 'si' : 'no')
        onResults(results)
      }}
    >
      Abrir dos
    </button>
  )
}

describe('ModalProvider + hooks', () => {
  it('useConfirm devuelve true al confirmar', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    render(
      <ModalProvider>
        <ConfirmTrigger onResult={onResult} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir confirm'))
    expect(await screen.findByText('Eliminar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
    act(() => fireModalExitTransition())
  })

  it('useConfirm devuelve false al cancelar', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    render(
      <ModalProvider>
        <ConfirmTrigger onResult={onResult} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir confirm'))
    expect(await screen.findByText('Eliminar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false))
    act(() => fireModalExitTransition())
  })
  it('ejecuta onConfirm async antes de resolver la promesa', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 10)))
    render(
      <ModalProvider>
        <AsyncConfirmTrigger onResult={onResult} onConfirm={onConfirm} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir confirm async'))
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('mantiene el modal abierto si onConfirm falla', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onConfirm = vi.fn(() => Promise.reject(new Error('fallo')))
    render(
      <ModalProvider>
        <AsyncConfirmTrigger onResult={onResult} onConfirm={onConfirm} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir confirm async'))
    await user.click(await screen.findByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalled())
    expect(onResult).not.toHaveBeenCalled()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('useModal.open resuelve con el valor pasado a resolve()', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    render(
      <ModalProvider>
        <OpenTrigger onResult={onResult} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir modal'))
    await user.click(await screen.findByRole('button', { name: 'OK' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith('ok'))
  })

  it('useModal.open rechaza cuando el componente llama reject()', async () => {
    const user = userEvent.setup()
    const onResult = vi.fn()
    render(
      <ModalProvider>
        <OpenTrigger onResult={onResult} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir modal'))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith('rejected'))
  })

  it('soporta múltiples modales simultáneos', async () => {
    const user = userEvent.setup()
    const onResults = vi.fn()
    render(
      <ModalProvider>
        <StackTrigger onResults={onResults} />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir dos'))
    expect(await screen.findByText('Primero')).toBeInTheDocument()
    expect(screen.getByText('Segundo')).toBeInTheDocument()
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancelar' })
    await user.click(cancelButtons[0])
    await user.click(cancelButtons[1])
    await waitFor(() => expect(onResults).toHaveBeenCalledWith(['no', 'no']))
    act(() => fireModalExitTransition())
  })

  it('useConfirm lanza error fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Bad() {
      useConfirm()
      return null
    }
    expect(() => render(<Bad />)).toThrow()
    spy.mockRestore()
  })

  it('useModal lanza error fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Bad() {
      useModal()
      return null
    }
    expect(() => render(<Bad />)).toThrow()
    spy.mockRestore()
  })

  it('closeAll cierra todos los modales abiertos', async () => {
    const user = userEvent.setup()
    function Capture() {
      const modal = useModal()
      const confirm = useConfirm()
      return (
        <>
          <button
            type="button"
            onClick={() => {
              void confirm({ title: 'Uno', message: 'A' })
              void confirm({ title: 'Dos', message: 'B' })
            }}
          >
            Abrir
          </button>
          <button type="button" onClick={() => modal.closeAll()}>
            Cerrar todo
          </button>
        </>
      )
    }
    render(
      <ModalProvider>
        <Capture />
      </ModalProvider>,
    )
    await user.click(screen.getByText('Abrir'))
    expect(await screen.findByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Dos')).toBeInTheDocument()
    await user.click(screen.getByText('Cerrar todo'))
    act(() => fireModalExitTransition())
    await waitFor(() => {
      expect(screen.queryByText('Uno')).not.toBeInTheDocument()
      expect(screen.queryByText('Dos')).not.toBeInTheDocument()
    })
  })
})
