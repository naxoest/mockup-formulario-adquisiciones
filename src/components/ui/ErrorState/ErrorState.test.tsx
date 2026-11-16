import { render, screen } from '@testing-library/react'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('muestra el titulo como encabezado principal y la descripcion', () => {
    render(<ErrorState title="Página no encontrada" description="La dirección no existe." />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByText('La dirección no existe.')).toBeInTheDocument()
  })

  it('muestra el codigo y las acciones cuando se entregan', () => {
    render(
      <ErrorState
        code="404"
        title="Página no encontrada"
        actions={<button type="button">Ir al inicio</button>}
      />,
    )

    expect(screen.getByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument()
  })

  it('asocia la seccion a su titulo', () => {
    render(<ErrorState title="Acceso denegado" />)

    expect(screen.getByRole('region', { name: 'Acceso denegado' })).toBeInTheDocument()
  })
})
