import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type {
  RequerimientoPorEliminar,
  RevisionImportacion,
} from '@/features/requerimientos/types/importacion.types'
import { PasoRevision } from './PasoRevision'

function crearRevision(
  filasConErrores: number,
  eliminaciones: RequerimientoPorEliminar[] = [],
): RevisionImportacion {
  return {
    id: 4,
    fecha: '2026-10-01T10:00:00',
    autor: 'Usuario de prueba',
    solicitante: {
      id: 2,
      cr: 101,
      nombre: 'Arquitectura',
      sedes: [{ value: 'osorno', label: 'Osorno' }],
      tipo: 'carrera',
    },
    nombreArchivo: 'planilla.xlsx',
    estado: { value: 'pendiente', label: 'Pendiente' },
    filasNuevas: 1,
    filasRestauradas: 1,
    filasConCambios: 1,
    filasSinCambios: 0,
    filasConErrores,
    requerimientosEliminados: eliminaciones.length,
    eliminaciones,
    avisos: ['Aviso del servidor.'],
    filas: [
      {
        fila: 2,
        identificador: 'A-1',
        requerimientoId: null,
        materiales: 'Guantes',
        resultado: 'nueva',
        errores: [],
        cambios: [{ campo: 'materiales', anterior: null, nuevo: 'Guantes' }],
      },
      {
        fila: 3,
        identificador: '12',
        requerimientoId: 7,
        materiales: 'Mascarillas',
        resultado: 'con_cambios',
        errores: [],
        cambios: [{ campo: 'cantidad', anterior: 2, nuevo: 3 }],
      },
      {
        fila: 4,
        identificador: '14',
        requerimientoId: 8,
        materiales: 'Delantales',
        resultado: 'restaurada',
        errores: [],
        cambios: [],
      },
      ...(filasConErrores > 0
        ? [
            {
              fila: 5,
              identificador: '13',
              requerimientoId: null,
              materiales: null,
              resultado: 'error' as const,
              errores: ['«Materiales» es obligatorio.'],
              cambios: [],
            },
          ]
        : []),
    ],
  }
}

function filasDeDatos() {
  const tabla = screen.getByRole('table', { name: 'Resultado de la revisión por fila del archivo' })
  return within(tabla).getAllByRole('row').slice(1)
}

describe('PasoRevision', () => {
  it('muestra primero las filas con errores e informa que no se puede confirmar', () => {
    render(<PasoRevision revision={crearRevision(1)} avisosLectura={[]} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La importación no puede confirmarse mientras existan filas con errores.',
    )
    expect(screen.getByRole('button', { name: 'Con errores (1)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(filasDeDatos()).toHaveLength(1)
    expect(within(filasDeDatos()[0]).getByText('«Materiales» es obligatorio.')).toBeInTheDocument()
  })

  it('permite ver todas las filas con el detalle de sus cambios', async () => {
    const usuario = userEvent.setup()
    render(<PasoRevision revision={crearRevision(1)} avisosLectura={[]} />)

    await usuario.click(screen.getByRole('button', { name: 'Todas (4)' }))

    expect(filasDeDatos()).toHaveLength(4)
    expect(screen.getByRole('columnheader', { name: 'Ítem' })).toBeInTheDocument()
    expect(within(filasDeDatos()[1]).getByText('12')).toBeInTheDocument()
    expect(within(filasDeDatos()[1]).getByText('Mascarillas')).toBeInTheDocument()
    expect(within(filasDeDatos()[1]).getByText('cambia a', { exact: false })).toBeInTheDocument()
    expect(within(filasDeDatos()[2]).getByText('Restaurada')).toBeInTheDocument()
    expect(within(filasDeDatos()[2]).getByText('Se restaura sin cambios')).toBeInTheDocument()
  })

  it('muestra todas las filas y los avisos de lectura y del servidor cuando no hay errores', () => {
    render(<PasoRevision revision={crearRevision(0)} avisosLectura={['Aviso de lectura.']} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todas (3)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(filasDeDatos()).toHaveLength(3)
    expect(screen.getByText('Aviso de lectura.')).toBeInTheDocument()
    expect(screen.getByText('Aviso del servidor.')).toBeInTheDocument()
  })

  it('lista los requerimientos que se eliminarán', () => {
    const eliminaciones = [
      { requerimientoId: 9, identificador: '8', materiales: 'Cajas plásticas' },
    ]
    render(<PasoRevision revision={crearRevision(0, eliminaciones)} avisosLectura={[]} />)

    const seccion = screen.getByRole('region', { name: 'Requerimientos que se eliminarán' })
    const filas = within(seccion).getAllByRole('row').slice(1)

    expect(filas).toHaveLength(1)
    expect(within(filas[0]).getByText('8')).toBeInTheDocument()
    expect(within(filas[0]).getByText('9')).toBeInTheDocument()
    expect(within(filas[0]).getByText('Cajas plásticas')).toBeInTheDocument()
  })

  it('no muestra la lista de eliminaciones cuando no hay ninguna', () => {
    render(<PasoRevision revision={crearRevision(0)} avisosLectura={[]} />)

    expect(
      screen.queryByRole('region', { name: 'Requerimientos que se eliminarán' }),
    ).not.toBeInTheDocument()
  })
})
