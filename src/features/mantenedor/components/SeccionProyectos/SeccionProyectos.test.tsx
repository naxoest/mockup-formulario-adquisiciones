import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'sonner'
import { describe, expect, it, beforeAll } from 'vitest'
import { ModalProvider } from '@/components/ui/Modal'
import { SeccionProyectos } from './SeccionProyectos'

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

function renderizarSeccion() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <SeccionProyectos />
        <Toaster />
      </ModalProvider>
    </QueryClientProvider>,
  )
}

describe('SeccionProyectos', () => {
  it('renderiza la tabla de proyectos con sus columnas y resumen', async () => {
    renderizarSeccion()

    expect(await screen.findByRole('table', { name: 'Proyectos' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre del proyecto' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'CR' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Solicitudes' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument()
    expect(screen.getByText(/Registros:/i)).toBeInTheDocument()
  })

  it('muestra los proyectos iniciales cargados', async () => {
    renderizarSeccion()

    expect(await screen.findByText('Proyecto FONDECYT Regular 12001')).toBeInTheDocument()
    expect(screen.getByText('Proyecto FIC R Innovación Regional')).toBeInTheDocument()
  })

  it('permite desactivar un proyecto activo tras confirmacion', async () => {
    const user = userEvent.setup()
    renderizarSeccion()

    const nombre = await screen.findByText('Proyecto FONDECYT Regular 12001')
    const fila = nombre.closest('tr')
    expect(fila).not.toBeNull()

    const botonDesactivar = within(fila as HTMLElement).getByRole('button', { name: 'Desactivar' })
    await user.click(botonDesactivar)

    expect(
      await screen.findByText('Desactivar Proyecto FONDECYT Regular 12001'),
    ).toBeInTheDocument()

    const botonConfirmar = screen.getByRole('button', { name: 'Desactivar proyecto' })
    await user.click(botonConfirmar)

    await screen.findByText('Proyecto desactivado')
  })

  it('permite activar un proyecto inactivo tras confirmacion', async () => {
    const user = userEvent.setup()
    renderizarSeccion()

    const nombre = await screen.findByText('Proyecto Convenio Desempeño Humanidades')
    const fila = nombre.closest('tr')
    expect(fila).not.toBeNull()

    const botonActivar = within(fila as HTMLElement).getByRole('button', { name: 'Activar' })
    await user.click(botonActivar)

    expect(
      await screen.findByText('Activar Proyecto Convenio Desempeño Humanidades'),
    ).toBeInTheDocument()

    const botonConfirmar = screen.getByRole('button', { name: 'Activar proyecto' })
    await user.click(botonConfirmar)

    await screen.findByText('Proyecto activado')
  })

  it('permite abrir el modal para registrar un nuevo proyecto', async () => {
    const user = userEvent.setup()
    renderizarSeccion()

    const botonAgregar = await screen.findByRole('button', { name: 'Agregar' })
    await user.click(botonAgregar)

    expect(await screen.findByRole('heading', { name: 'Nuevo proyecto' })).toBeInTheDocument()
  })

  it('permite abrir el modal para editar un proyecto existente', async () => {
    const user = userEvent.setup()
    renderizarSeccion()

    const nombre = await screen.findByText('Proyecto FONDECYT Regular 12001')
    const fila = nombre.closest('tr')
    expect(fila).not.toBeNull()

    const botonEditar = within(fila as HTMLElement).getByRole('button', { name: 'Editar' })
    await user.click(botonEditar)

    expect(await screen.findByRole('heading', { name: 'Editar proyecto' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Proyecto FONDECYT Regular 12001')).toBeInTheDocument()
  })
})
