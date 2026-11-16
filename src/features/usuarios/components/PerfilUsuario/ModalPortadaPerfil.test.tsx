import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { pedirSesion } from '@/mocks/pruebas'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { ModalPortadaPerfil } from './ModalPortadaPerfil'
import type { PortadaResuelta } from '@/features/usuarios/types/imagen.types'

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

beforeEach(() => {
  iniciarSesionSimuladaPorRun(12345678)
})

const PORTADAS: PortadaResuelta[] = [
  {
    clave: 'santiago',
    nombre: 'Santiago',
    encuadre: 'object-[50%_25%]',
    src: 'https://ejemplo.cl/santiago-1200.webp',
    srcSet: 'https://ejemplo.cl/santiago-1200.webp 1200w',
    miniatura: 'https://ejemplo.cl/santiago-600.webp',
  },
  {
    clave: 'volcan-osorno',
    nombre: 'Volcán Osorno',
    encuadre: 'object-[50%_20%]',
    src: 'https://ejemplo.cl/volcan-osorno-1200.webp',
    srcSet: 'https://ejemplo.cl/volcan-osorno-1200.webp 1200w',
    miniatura: 'https://ejemplo.cl/volcan-osorno-600.webp',
  },
]

function renderizar(actual: string | null) {
  const resolve = vi.fn()
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={cliente}>
      <ModalPortadaPerfil
        open
        onExited={vi.fn()}
        resolve={resolve}
        reject={vi.fn()}
        portadas={PORTADAS}
        actual={actual}
      />
    </QueryClientProvider>,
  )

  return { resolve }
}

describe('ModalPortadaPerfil', () => {
  it('marca la portada actual', () => {
    renderizar('volcan-osorno')

    expect(screen.getByRole('radio', { name: 'Volcán Osorno' })).toBeChecked()
  })

  it('marca "Sin portada" cuando no hay portada', () => {
    renderizar(null)

    expect(screen.getByRole('radio', { name: 'Sin portada' })).toBeChecked()
  })

  it('no permite guardar sin cambios', () => {
    renderizar('santiago')

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('guarda la portada elegida', async () => {
    const user = userEvent.setup()
    const { resolve } = renderizar(null)

    await user.click(screen.getByRole('radio', { name: 'Santiago' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(resolve).toHaveBeenCalledWith(true))

    const { cuerpo } = await pedirSesion('/auth/me')

    expect(cuerpo.usuario.portada).toBe('santiago')
  })

  it('quita la portada al elegir "Sin portada"', async () => {
    const user = userEvent.setup()
    const { resolve } = renderizar('santiago')

    await user.click(screen.getByRole('radio', { name: 'Sin portada' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(resolve).toHaveBeenCalledWith(true))
  })
})
