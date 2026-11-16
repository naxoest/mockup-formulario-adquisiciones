import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'sonner'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ModalProvider } from '@/components/ui/Modal'
import { ModalProyecto } from './ModalProyecto'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

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

function renderizarModal({
  proyecto,
  open = true,
  resolve = vi.fn(),
  reject = vi.fn(),
  onExited = vi.fn(),
}: {
  proyecto?: Proyecto
  open?: boolean
  resolve?: (value: boolean) => void
  reject?: (reason?: unknown) => void
  onExited?: () => void
} = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    resolve,
    reject,
    onExited,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <ModalProyecto
            proyecto={proyecto}
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

describe('ModalProyecto', () => {
  it('renderiza el modal en modo creacion con campos requeridos', () => {
    renderizarModal()

    expect(screen.getByRole('heading', { name: 'Nuevo proyecto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear proyecto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('valida campos obligatorios al intentar enviar vacio', async () => {
    const user = userEvent.setup()
    renderizarModal()

    await user.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByText('Ingrese el nombre')).toBeInTheDocument()
    expect(screen.getByText('Ingrese el CR')).toBeInTheDocument()
  })

  it('permite registrar un nuevo proyecto con datos validos', async () => {
    const user = userEvent.setup()
    const { resolve } = renderizarModal()

    const nombreInput = screen.getByRole('textbox', { name: /nombre/i })
    const crInput = screen.getByRole('textbox', { name: /cr/i })

    await user.type(nombreInput, 'Proyecto Nuevo Experimental')
    await user.type(crInput, '777')

    await user.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByText('Proyecto creado')).toBeInTheDocument()
    expect(resolve).toHaveBeenCalledWith(true)
  })

  it('muestra error de validacion si el CR ya existe', async () => {
    const user = userEvent.setup()
    renderizarModal()

    const nombreInput = screen.getByRole('textbox', { name: /nombre/i })
    const crInput = screen.getByRole('textbox', { name: /cr/i })

    await user.type(nombreInput, 'Proyecto Duplicado')
    await user.type(crInput, '201')

    await user.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByText('El CR ya está registrado')).toBeInTheDocument()
  })

  it('renderiza valores existentes en modo edicion', () => {
    const existente: Proyecto = {
      id: 1,
      cr: 201,
      nombre: 'Proyecto FONDECYT Regular 12001',
      activo: true,
      solicitudes: 0,
      registradoPor: 'Test',
      fechaRegistro: '2026-01-05T09:00:00',
    }

    renderizarModal({ proyecto: existente })

    expect(screen.getByRole('heading', { name: 'Editar proyecto' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Proyecto FONDECYT Regular 12001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('201')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('solicita confirmacion al modificar CR de un proyecto con solicitudes', async () => {
    const user = userEvent.setup()
    const conSolicitudes: Proyecto = {
      id: 1,
      cr: 201,
      nombre: 'Proyecto FONDECYT Regular 12001',
      activo: true,
      solicitudes: 4,
      registradoPor: 'Test',
      fechaRegistro: '2026-01-05T09:00:00',
    }

    const { resolve } = renderizarModal({ proyecto: conSolicitudes })

    const crInput = screen.getByRole('textbox', { name: /cr/i })
    await user.clear(crInput)
    await user.type(crInput, '350')

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Confirmar los cambios')).toBeInTheDocument()
    expect(screen.getByText(/el CR cambiará de 201 a 350/i)).toBeInTheDocument()

    const botonConfirmar = screen.getAllByRole('button', { name: 'Guardar cambios' })
    await user.click(botonConfirmar[botonConfirmar.length - 1])

    expect(await screen.findByText('Cambios guardados')).toBeInTheDocument()
    expect(resolve).toHaveBeenCalledWith(true)
  })

  it('solicita confirmacion al cancelar con cambios pendientes', async () => {
    const user = userEvent.setup()
    const { resolve } = renderizarModal()

    const nombreInput = screen.getByRole('textbox', { name: /nombre/i })
    await user.type(nombreInput, 'Modificacion sin guardar')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(await screen.findByText('Descartar los cambios')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(resolve).toHaveBeenCalledWith(false)
  })
})
