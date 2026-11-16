import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Toaster } from 'sonner'
import { ModalProvider } from '@/components/ui/Modal'
import { TransaccionCreateModal } from './TransaccionCreateModal'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

function renderizarModal({
  open = true,
  resolve = vi.fn(),
  reject = vi.fn(),
  onExited = vi.fn(),
} = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    resolve,
    reject,
    onExited,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <TransaccionCreateModal
            open={open}
            resolve={resolve}
            reject={reject}
            onExited={onExited}
          />
          <Toaster />
        </ModalProvider>
      </QueryClientProvider>,
    ),
  }
}

describe('TransaccionCreateModal', () => {
  it('renderiza el encabezado del modal y el paso inicial Solicitud y Cotización', () => {
    renderizarModal()

    expect(screen.getByText('Agregar nueva transaccion')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paso 1: Solicitud y Cotización' })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByText('Datos de la solicitud')).toBeInTheDocument()
    expect(screen.getByText('Modalidad de compra')).toBeInTheDocument()
  })

  it('llama a reject al pulsar el botón de cerrar modal', async () => {
    const user = userEvent.setup()
    const { reject } = renderizarModal()

    await user.click(screen.getByRole('button', { name: 'Cerrar modal' }))

    expect(reject).toHaveBeenCalledTimes(1)
  })
})
