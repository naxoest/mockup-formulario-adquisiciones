import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ModalProvider } from '@/components/ui/Modal'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { ModalFotoPerfil } from './ModalFotoPerfil'

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

function renderizar(foto?: string) {
  const resolve = vi.fn()
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={cliente}>
      <ModalProvider>
        <ModalFotoPerfil
          open
          onExited={vi.fn()}
          resolve={resolve}
          reject={vi.fn()}
          foto={foto}
          iniciales="AR"
          semilla={12345678}
        />
      </ModalProvider>
    </QueryClientProvider>,
  )

  return { resolve }
}

function selectorDeArchivo(): HTMLInputElement {
  const entrada = document.querySelector<HTMLInputElement>('input[type="file"]')

  if (entrada === null) {
    throw new Error('no se encontro el selector de archivos')
  }

  return entrada
}

describe('ModalFotoPerfil', () => {
  it('muestra las iniciales cuando no hay foto y no ofrece quitarla', () => {
    renderizar()

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quitar foto' })).not.toBeInTheDocument()
  })

  it('muestra la foto actual y ofrece quitarla', () => {
    renderizar('https://example.com/foto.jpg')

    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/foto.jpg')
    expect(screen.getByRole('button', { name: 'Quitar foto' })).toBeInTheDocument()
  })

  it('rechaza un archivo con un formato no admitido', async () => {
    renderizar()

    fireEvent.change(selectorDeArchivo(), {
      target: { files: [new File(['texto'], 'notas.txt', { type: 'text/plain' })] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La imagen debe estar en formato JPEG, PNG o WebP.',
    )
  })

  it('rechaza un archivo de mas de 10 MB', async () => {
    renderizar()
    const grande = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'foto.jpg', {
      type: 'image/jpeg',
    })

    fireEvent.change(selectorDeArchivo(), { target: { files: [grande] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La imagen no puede superar los 10 MB.',
    )
  })

  it('quita la foto tras la confirmacion', async () => {
    iniciarSesionSimuladaPorRun(12345678)
    const user = userEvent.setup()
    const { resolve } = renderizar('https://example.com/foto.jpg')

    await user.click(screen.getByRole('button', { name: 'Quitar foto' }))

    const confirmacion = await screen.findByRole('dialog', {
      name: 'Quitar la foto de perfil',
      hidden: true,
    })
    await user.click(within(confirmacion).getByRole('button', { name: 'Quitar foto' }))

    await waitFor(() => expect(resolve).toHaveBeenCalledWith(true))
  })
})
