import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DatosPersonales } from './DatosPersonales'

const propiedades = {
  run: 12345678,
  digitoVerificador: '5',
  correoInstitucional: 'ana.rojas@ejemplo.cl',
  correoEstudiantil: null,
}

describe('DatosPersonales', () => {
  it('muestra el run con formato', () => {
    render(<DatosPersonales {...propiedades} />)

    expect(screen.getByText('12.345.678-5')).toBeInTheDocument()
  })

  it('indica la falta de correo institucional', () => {
    render(<DatosPersonales {...propiedades} correoInstitucional={null} />)

    expect(screen.getByText('Sin registro')).toBeInTheDocument()
  })

  it('muestra el correo estudiantil solo cuando existe', () => {
    const { rerender } = render(<DatosPersonales {...propiedades} />)

    expect(screen.queryByText('Correo estudiantil')).not.toBeInTheDocument()

    rerender(<DatosPersonales {...propiedades} correoEstudiantil="ana.rojas@alumnos.ejemplo.cl" />)

    expect(screen.getByText('ana.rojas@alumnos.ejemplo.cl')).toBeInTheDocument()
  })
})
