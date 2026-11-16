import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EventoHistorial } from '../../types/historial.types'
import { LineaDeTiempo } from './LineaDeTiempo'

const eventos: EventoHistorial[] = [
  {
    clase: 'evento',
    id: 'ev-1',
    fecha: '2026-03-12T09:14:00-03:00',
    entidad: { tipo: 'solicitud', id: 101, codigo: 'SOL-A' },
    contexto: { unidad: { nombre: 'Dirección de Arquitectura' } },
    titulo: 'Arquitectura ingresó su solicitud',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Reposición de estaciones de trabajo.',
    autor: 'M. Fuentes',
  },
  {
    clase: 'hito',
    id: 'hito-1',
    fecha: '2026-03-12T10:00:00-03:00',
    estado: 'Ingresada',
    explicacion: 'Las solicitudes quedaron asociadas.',
  },
  {
    clase: 'evento',
    id: 'ev-2',
    fecha: '2026-03-14T11:00:00-03:00',
    entidad: { tipo: 'solicitud', id: 102, codigo: 'SOL-B' },
    contexto: { unidad: { nombre: 'Unidad de Mantención' } },
    titulo: 'Mantención ingresó su solicitud',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Reemplazo de mobiliario del taller.',
    autor: 'R. Millalonco',
  },
  {
    clase: 'evento',
    id: 'ev-3',
    fecha: '2026-03-19T09:40:00-03:00',
    entidad: { tipo: 'ordenDeCompra', id: 201, codigo: 'OC-A' },
    contexto: { proveedor: 'Comercial Andes SpA' },
    titulo: 'Adquisiciones envió la orden por',
    monto: 2080000,
    transicion: { anterior: null, posterior: 'Enviada a proveedor', tono: 'enCurso' },
    observacion: 'Se agrupan las dos solicitudes.',
    autor: 'J. Cárdenas',
  },
  {
    clase: 'hito',
    id: 'hito-2',
    fecha: '2026-03-19T09:41:00-03:00',
    estado: 'En adquisiciones',
    explicacion: 'Se envió la primera orden.',
  },
]

const chip = (texto: string) => screen.getByRole('button', { name: new RegExp(texto) })

describe('LineaDeTiempo', () => {
  it('muestra todos los eventos y los hitos sin filtro aplicado', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    expect(screen.getByText('Arquitectura ingresó su solicitud')).toBeInTheDocument()
    expect(screen.getByText('Mantención ingresó su solicitud')).toBeInTheDocument()
    expect(screen.getByText('Ingresada')).toBeInTheDocument()
    expect(screen.getByText('En adquisiciones')).toBeInTheDocument()
  })

  it('anuncia el total de eventos de entidad, sin contar los hitos', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Mostrando los 3 eventos de la transacción.',
    )
  })

  it('marca el último hito como el estado actual', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    const actual = screen.getByText('Estado actual de la transacción')
    expect(actual).toBeInTheDocument()
    expect(screen.getAllByText('La transacción avanzó')).toHaveLength(1)
  })

  it('deriva un chip por cada entidad presente en los eventos', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    expect(chip('SOL-A')).toBeInTheDocument()
    expect(chip('SOL-B')).toBeInTheDocument()
    expect(chip('OC-A')).toBeInTheDocument()
  })

  it('acompaña el código con el descriptor de la entidad', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    expect(chip('SOL-A')).toHaveTextContent('Dirección de Arquitectura')
    expect(chip('OC-A')).toHaveTextContent('Comercial Andes SpA')
  })

  it('deja solo los eventos de la entidad elegida y conserva los hitos', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    await user.click(chip('SOL-A'))

    expect(screen.getByText('Arquitectura ingresó su solicitud')).toBeInTheDocument()
    expect(screen.queryByText('Mantención ingresó su solicitud')).not.toBeInTheDocument()
    expect(screen.getByText('Ingresada')).toBeInTheDocument()
    expect(screen.getByText('En adquisiciones')).toBeInTheDocument()
  })

  it('actualiza el resumen al filtrar', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    await user.click(chip('SOL-A'))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Mostrando 1 evento de SOL-A, más los avances de la transacción como referencia.',
    )
  })

  it('acumula varias entidades en la selección', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    await user.click(chip('SOL-A'))
    await user.click(chip('OC-A'))

    expect(screen.getByText('Arquitectura ingresó su solicitud')).toBeInTheDocument()
    expect(screen.getByText(/Adquisiciones envió la orden por/)).toBeInTheDocument()
    expect(screen.queryByText('Mantención ingresó su solicitud')).not.toBeInTheDocument()
  })

  it('quita una entidad al volver a pulsar su chip', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    await user.click(chip('SOL-A'))
    await user.click(chip('SOL-A'))

    expect(screen.getByText('Mantención ingresó su solicitud')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Mostrando los 3 eventos de la transacción.',
    )
  })

  it('refleja la selección en aria-pressed', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    expect(chip('Todo')).toHaveAttribute('aria-pressed', 'true')
    expect(chip('SOL-A')).toHaveAttribute('aria-pressed', 'false')

    await user.click(chip('SOL-A'))

    expect(chip('SOL-A')).toHaveAttribute('aria-pressed', 'true')
    expect(chip('Todo')).toHaveAttribute('aria-pressed', 'false')
  })

  it('limpia la selección al pulsar Todo', async () => {
    const user = userEvent.setup()
    render(<LineaDeTiempo eventos={eventos} />)

    await user.click(chip('SOL-A'))
    await user.click(chip('Todo'))

    expect(screen.getByText('Mantención ingresó su solicitud')).toBeInTheDocument()
    expect(chip('SOL-A')).toHaveAttribute('aria-pressed', 'false')
  })

  it('agrupa los chips por tipo de entidad', () => {
    render(<LineaDeTiempo eventos={eventos} />)

    expect(screen.getByRole('group', { name: 'Solicitudes' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Órdenes' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Facturas' })).not.toBeInTheDocument()
  })

  it('muestra los pasos del proceso con su fecha del hecho y su observacion', () => {
    render(
      <LineaDeTiempo
        eventos={[
          {
            clase: 'paso',
            id: 'paso-1',
            fecha: '2026-03-16T15:00:00-03:00',
            accion: 'registrado',
            paso: 'aprobada_con_observaciones',
            titulo: 'Paso registrado: Aprobada con observaciones',
            fechaHecho: '2026-03-16',
            observacion: 'Se deben precisar las especificaciones técnicas.',
            autor: 'Analista de prueba',
          },
        ]}
      />,
    )

    expect(screen.getByText('Paso registrado: Aprobada con observaciones')).toBeInTheDocument()
    expect(screen.getByText(/Fecha del hecho/)).toBeInTheDocument()
    expect(screen.getByText('Se deben precisar las especificaciones técnicas.')).toBeInTheDocument()
  })
})
