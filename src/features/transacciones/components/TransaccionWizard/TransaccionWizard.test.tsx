import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Toaster } from 'sonner'
import { Modal, ModalProvider } from '@/components/ui/Modal'
import { TransaccionWizard } from './TransaccionWizard'
import type { TransaccionFormState } from '../../types/transaccion.types'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

function getBorradorInicial(): TransaccionFormState {
  return {
    id: null,
    nombre: 'Transacción nueva de prueba',
    linkCarpetaAntecedentes: '',
    fecha: new Date(),
    modalidad: '',
    solicitantes: [
      {
        claveFormulario: '1',
        id: null,
        unidadId: 1,
        tipo: 'carrera',
        campus: 'osorno',
        nombre: '1',
        cr: 105,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: '',
        financiamiento: 'institucional',
        precompromisos: [{ anio: '2026', monto: 500000 }],
      },
    ],
    ordenesDeCompra: [],
    facturas: [],
  }
}

function renderizarWizard(
  defaultValues = getBorradorInicial(),
  modo: 'crear' | 'editar' = 'crear',
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <Modal open onClose={() => {}}>
          <TransaccionWizard modo={modo} defaultValues={defaultValues} onComplete={vi.fn()} />
        </Modal>
        <Toaster />
      </ModalProvider>
    </QueryClientProvider>,
  )
}

describe('TransaccionWizard en modo crear', () => {
  it('deshabilita Guardar avance en el paso Solicitud y Cotización hasta seleccionar modalidad', async () => {
    const user = userEvent.setup()
    renderizarWizard()

    expect(screen.getByRole('button', { name: 'Paso 1: Solicitud y Cotización' })).toHaveAttribute(
      'aria-current',
      'step',
    )

    const botonGuardar = screen.getByRole('button', { name: 'Guardar avance' })
    expect(botonGuardar).toBeDisabled()
    expect(botonGuardar).toHaveAttribute(
      'title',
      'Para guardar el avance primero debe indicar la modalidad',
    )

    await user.click(screen.getByText('Seleccione una modalidad'))
    await user.click(await screen.findByText('Compra Ágil'))

    expect(botonGuardar).toBeEnabled()
  })

  it('persiste el borrador en el servidor al pulsar Guardar avance con modalidad seleccionada', async () => {
    const user = userEvent.setup()
    renderizarWizard()

    await user.click(await screen.findByText('Seleccione una modalidad'))
    await user.click(await screen.findByText('Compra Ágil'))

    await user.click(screen.getByRole('button', { name: 'Guardar avance' }))

    expect(await screen.findByText('Avance guardado')).toBeInTheDocument()
  })

  it('al pulsar Siguiente con modalidad seleccionada persiste el borrador y avanza al paso Adquisición', async () => {
    const user = userEvent.setup()
    renderizarWizard()

    await user.click(await screen.findByText('Seleccione una modalidad'))
    await user.click(await screen.findByText('Compra Ágil'))

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByRole('button', { name: 'Paso 2: Adquisición' })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(
      await screen.findByRole('heading', { name: 'Proceso de adquisición' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Paso 1: Presupuesto solicitado' }),
    ).toBeInTheDocument()
  })

  it('en el paso Adquisición con un paso pendiente, pulsar Siguiente exige la fecha y no avanza a Orden de Compra', async () => {
    const user = userEvent.setup()
    renderizarWizard()

    await user.click(await screen.findByText('Seleccione una modalidad'))
    await user.click(await screen.findByText('Compra Ágil'))

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByRole('button', { name: 'Paso 2: Adquisición' })).toHaveAttribute(
      'aria-current',
      'step',
    )

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByText('Seleccione la fecha del hecho')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paso 2: Adquisición' })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.queryByRole('button', { name: 'Paso 3: Orden de Compra' })).not.toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('renderiza el campo de cotización por año presupuestario con el componente Field', () => {
    renderizarWizard()

    expect(screen.getByText('Cotización por año presupuestario')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Ingrese el valor de cotización de esta solicitud separado por año presupuestario. Cada año puede registrarse una sola vez.',
      ),
    ).toBeInTheDocument()
  })

  it('muestra conteo de solicitantes sin cotización y monto total cero cuando no hay precompromisos', () => {
    const borradorSinCotizacion: TransaccionFormState = {
      ...getBorradorInicial(),
      solicitantes: [
        {
          claveFormulario: '1',
          id: null,
          unidadId: 1,
          tipo: 'carrera',
          campus: 'osorno',
          nombre: '1',
          cr: 105,
          tipoSolicitud: 'SABIENES',
          codigoSaserviSabienes: '',
          financiamiento: 'institucional',
          precompromisos: [],
        },
      ],
    }

    renderizarWizard(borradorSinCotizacion)

    expect(screen.getByText('1 solicitante · 1 sin cotización')).toBeInTheDocument()
    expect(screen.getByText(/\$\s*0/)).toBeInTheDocument()
  })

  it('calcula y muestra el monto cotizado global sumando las cotizaciones de múltiples solicitantes', () => {
    const borradorConDos: TransaccionFormState = {
      ...getBorradorInicial(),
      solicitantes: [
        {
          claveFormulario: '1',
          id: null,
          unidadId: 1,
          tipo: 'carrera',
          campus: 'osorno',
          nombre: '1',
          cr: 105,
          tipoSolicitud: 'SABIENES',
          codigoSaserviSabienes: '',
          financiamiento: 'institucional',
          precompromisos: [{ anio: '2026', monto: 500000 }],
        },
        {
          claveFormulario: '2',
          id: null,
          unidadId: 2,
          tipo: 'carrera',
          campus: 'osorno',
          nombre: '2',
          cr: 101,
          tipoSolicitud: 'SASERVI',
          codigoSaserviSabienes: '',
          financiamiento: 'institucional',
          precompromisos: [{ anio: '2026', monto: 300000 }],
        },
      ],
    }

    renderizarWizard(borradorConDos)

    expect(screen.getByText('2 solicitantes')).toBeInTheDocument()
    expect(screen.getByText(/\$\s*800\.000/)).toBeInTheDocument()
  })
})

describe('TransaccionWizard en modo editar', () => {
  it('permite navegar libremente entre los 4 pasos del Stepper', async () => {
    const user = userEvent.setup()
    renderizarWizard(getBorradorInicial(), 'editar')

    await user.click(screen.getByRole('button', { name: 'Paso 3: Orden de Compra' }))
    expect(screen.getByRole('button', { name: 'Paso 3: Orden de Compra' })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByRole('heading', { name: 'Órdenes de compra' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Paso 4: Factura y Cierre' }))
    expect(screen.getByRole('button', { name: 'Paso 4: Factura y Cierre' })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })
})
