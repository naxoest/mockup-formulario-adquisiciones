import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ModalProvider } from '@/components/ui/Modal'
import { TransaccionEditModal } from '@/features/transacciones/components/TransaccionEditModal/TransaccionEditModal'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { conCuerpo, pedirTransaccion } from '@/mocks/pruebas'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

describe('TransaccionEditModal', () => {
  it('informa que la transaccion no esta disponible ante un 404, sin ofrecer reintentar', async () => {
    iniciarSesionSimuladaPorRun(9876543)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <TransaccionEditModal
            transaccionId={2}
            open
            resolve={vi.fn()}
            reject={vi.fn()}
            onExited={vi.fn()}
          />
        </ModalProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('La transacción no está disponible')).toBeInTheDocument()
    expect(screen.queryByText('Reintentar')).not.toBeInTheDocument()
  })
})

function renderizarEdicion(transaccionId: number) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <TransaccionEditModal
          transaccionId={transaccionId}
          open
          resolve={vi.fn()}
          reject={vi.fn()}
          onExited={vi.fn()}
        />
      </ModalProvider>
    </QueryClientProvider>,
  )
}

async function registrarPorApi(transaccionId: number, paso: string, fecha: string) {
  await pedirTransaccion(
    `/api/transacciones/${transaccionId}/registrar-paso`,
    conCuerpo('POST', { paso, fecha, observacion: null }),
  )
}

async function abrirAdquisiciones(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Paso 2: Adquisición' }))
}

describe('TransaccionEditModal en el paso Adquisición', () => {
  it('pide la fecha del hecho al pulsar Siguiente con un paso pendiente', async () => {
    const user = userEvent.setup()
    renderizarEdicion(5)
    await abrirAdquisiciones(user)

    expect(screen.getByRole('button', { name: 'Paso 1: Presupuesto solicitado' })).toHaveAttribute(
      'aria-current',
      'step',
    )

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByText('Seleccione la fecha del hecho')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paso 2: Adquisición' })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('registra el paso pendiente y se mantiene en Adquisiciones con el paso siguiente', async () => {
    const user = userEvent.setup()
    renderizarEdicion(5)
    await abrirAdquisiciones(user)

    await user.click(screen.getByRole('button', { name: /Fecha del hecho/ }))
    const selector = screen.getByRole('dialog', { name: 'Selector de fecha' })
    await user.click(within(selector).getByText(String(new Date().getDate())))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Paso 2: Presupuesto asignado' })).toHaveAttribute(
        'aria-current',
        'step',
      )
    })
    expect(screen.getByRole('button', { name: 'Paso 2: Adquisición' })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('exige la observacion cuando el resultado elegido la requiere', async () => {
    await registrarPorApi(5, 'presupuesto_solicitado', '2026-06-08')
    await registrarPorApi(5, 'presupuesto_asignado', '2026-06-09')
    await registrarPorApi(5, 'enviada_a_adquisiciones', '2026-06-10')
    await registrarPorApi(5, 'analista_asignado', '2026-06-11')
    const user = userEvent.setup()
    renderizarEdicion(5)
    await abrirAdquisiciones(user)

    expect(screen.getByRole('button', { name: 'Paso 5: Aprobada' })).toHaveAttribute(
      'aria-current',
      'step',
    )

    await user.click(screen.getByLabelText('Aprobada con observaciones'))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByText('Ingrese una observación')).toBeInTheDocument()
  })

  it('deshace el ultimo paso con un motivo y vuelve a ofrecer ese paso', async () => {
    const user = userEvent.setup()
    renderizarEdicion(3)
    await abrirAdquisiciones(user)

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    await user.click(screen.getByRole('button', { name: 'Deshacer paso' }))

    expect(await screen.findByText('Ingrese el motivo')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /Motivo/ }), 'Se registró por error.')
    await user.click(screen.getByRole('button', { name: 'Deshacer paso' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Paso 5: Aprobada' })).toHaveAttribute(
        'aria-current',
        'step',
      )
    })
    expect(screen.getByRole('radiogroup', { name: /Resultado del paso/ })).toBeInTheDocument()
  })

  it('muestra el resumen y avanza a Orden de Compra con el proceso completo', async () => {
    const user = userEvent.setup()
    renderizarEdicion(3)
    await abrirAdquisiciones(user)

    expect(screen.getByText('Resumen de lo precomprometido')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Paso 3: Orden de Compra' })).toHaveAttribute(
        'aria-current',
        'step',
      )
    })
  })
})
