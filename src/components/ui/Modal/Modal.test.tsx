import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

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

function ControlledModal({
  initialOpen = true,
  closeOnBackdrop,
  closeOnEscape,
  showCloseButton,
  size,
}: {
  initialOpen?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      showCloseButton={showCloseButton}
      size={size}
    >
      <Modal.Header>Título del modal</Modal.Header>
      <Modal.Body>Contenido del modal</Modal.Body>
      <Modal.Footer>
        <button type="button">Accion</button>
      </Modal.Footer>
    </Modal>
  )
}

describe('Modal', () => {
  it('renderiza header, body y footer cuando está abierto', () => {
    render(<ControlledModal />)
    expect(screen.getByText('Título del modal')).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accion' })).toBeInTheDocument()
  })

  it('asocia aria-labelledby al título del header', () => {
    render(<ControlledModal />)
    const dialog = screen.getByRole('dialog', { hidden: true })
    const titleId = dialog.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()
    const title = screen.getByText('Título del modal')
    expect(title.id).toBe(titleId)
  })

  it('muestra el botón cerrar por defecto y llama onClose al hacer click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        <Modal.Header>Título</Modal.Header>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no muestra el botón cerrar cuando showCloseButton es false', () => {
    render(<ControlledModal showCloseButton={false} />)
    expect(screen.queryByRole('button', { name: 'Cerrar modal' })).not.toBeInTheDocument()
  })

  it('no llama onClose con Escape cuando closeOnEscape es false', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnEscape={false}>
        <Modal.Header>Título</Modal.Header>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { hidden: true })
    const event = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(event)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('llama onClose con Escape cuando closeOnEscape es true', () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        <Modal.Header>Título</Modal.Header>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { hidden: true })
    const event = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(event)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('lanza error si Modal.Header se usa fuera de Modal', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Modal.Header>Huérfano</Modal.Header>)).toThrow()
    spy.mockRestore()
  })
})
