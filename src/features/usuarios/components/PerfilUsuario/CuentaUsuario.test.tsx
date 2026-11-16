import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CuentaUsuario } from './CuentaUsuario'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const usuario: Usuario = {
  run: 12345678,
  digitoVerificador: '5',
  emailInstitucional: 'ana.rojas@ejemplo.cl',
  emailEstudiantil: null,
  nombres: 'Ana',
  apellidoPaterno: 'Rojas',
  apellidoMaterno: 'Pérez',
  esEstudiante: false,
  estaActivo: true,
  fotoUrl: null,
  portada: null,
  creadoEn: '2026-03-02T10:45:00',
  actualizadoEn: '2026-07-18T09:20:00',
  roles: [{ id: 2, nombre: 'administrador' }],
}

describe('CuentaUsuario', () => {
  it('muestra las fechas de la cuenta', () => {
    render(<CuentaUsuario usuario={usuario} onEditar={vi.fn()} onCambiarEstado={vi.fn()} />)

    expect(screen.getByText('2 de marzo de 2026')).toBeInTheDocument()
    expect(screen.getByText('18 de julio de 2026')).toBeInTheDocument()
  })

  it('ofrece desactivar una cuenta activa', async () => {
    const user = userEvent.setup()
    const onCambiarEstado = vi.fn()
    render(<CuentaUsuario usuario={usuario} onEditar={vi.fn()} onCambiarEstado={onCambiarEstado} />)

    await user.click(screen.getByRole('button', { name: 'Desactivar' }))

    expect(onCambiarEstado).toHaveBeenCalledTimes(1)
  })

  it('ofrece activar una cuenta inactiva', () => {
    render(
      <CuentaUsuario
        usuario={{ ...usuario, estaActivo: false }}
        onEditar={vi.fn()}
        onCambiarEstado={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Desactivar' })).not.toBeInTheDocument()
  })

  it('abre la edicion', async () => {
    const user = userEvent.setup()
    const onEditar = vi.fn()
    render(<CuentaUsuario usuario={usuario} onEditar={onEditar} onCambiarEstado={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(onEditar).toHaveBeenCalledTimes(1)
  })

  it('ofrece quitar la foto solo cuando recibe la accion', async () => {
    const user = userEvent.setup()
    const onQuitarFoto = vi.fn()
    const { rerender } = render(
      <CuentaUsuario usuario={usuario} onEditar={vi.fn()} onCambiarEstado={vi.fn()} />,
    )

    expect(screen.queryByRole('button', { name: 'Quitar foto' })).not.toBeInTheDocument()

    rerender(
      <CuentaUsuario
        usuario={usuario}
        onEditar={vi.fn()}
        onCambiarEstado={vi.fn()}
        onQuitarFoto={onQuitarFoto}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Quitar foto' }))

    expect(onQuitarFoto).toHaveBeenCalledTimes(1)
  })
})
