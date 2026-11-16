import { describe, expect, it } from 'vitest'
import {
  construirFilasDetalleUnidad,
  filtrarDetalleUnidad,
  nombreArchivoPerfilUnidad,
  opcionesFiltroDetalle,
  partesFecha,
} from '@/features/analisis/utils/perfilUnidad'
import type { RegistroDetalleUnidad } from '@/features/analisis/types/perfilUnidad.types'

const REGISTROS: RegistroDetalleUnidad[] = [
  {
    id: 315,
    transaccionId: 8,
    fecha: '2026-07-22',
    tipo: { value: 'SABIENES', label: 'SABIENES' },
    modalidad: { value: 'privada', label: 'Licitación privada' },
    ordenDeCompra: { id: 206, codigo: 'OC 5413-44-LPR26', estado: 'cancelada' },
    monto: 3800000,
    estadoSolicitud: { value: 'en_proceso', label: 'En proceso' },
    estadoEvaluacion: { value: 'evaluado', label: 'Evaluado' },
    observaciones: null,
  },
  {
    id: 301,
    transaccionId: 1,
    fecha: '2026-03-20',
    tipo: { value: 'SASERVI', label: 'SASERVI' },
    modalidad: { value: 'agil', label: 'Compra Ágil' },
    ordenDeCompra: { id: 201, codigo: 'OC 5413-52-SE26', estado: 'aceptada' },
    monto: 2100000,
    estadoSolicitud: null,
    estadoEvaluacion: null,
    observaciones: null,
  },
]

const FILAS = construirFilasDetalleUnidad(REGISTROS)

describe('construirFilasDetalleUnidad', () => {
  it('aplana el registro y marca la orden cancelada', () => {
    expect(FILAS[0]).toEqual({
      id: 315,
      transaccionId: 8,
      fecha: '2026-07-22',
      tipo: 'SABIENES',
      tipoCodigo: 'SABIENES',
      modalidad: 'Licitación privada',
      modalidadCodigo: 'privada',
      ordenDeCompra: 'OC 5413-44-LPR26',
      ordenCancelada: true,
      monto: 3800000,
      estado: 'En proceso',
      estadoCodigo: 'en_proceso',
      evaluacion: 'Evaluado',
      observaciones: null,
    })
  })

  it('conserva como nulos los estados ausentes', () => {
    expect(FILAS[1]?.estado).toBeNull()
    expect(FILAS[1]?.evaluacion).toBeNull()
    expect(FILAS[1]?.ordenCancelada).toBe(false)
  })
})

describe('filtrarDetalleUnidad', () => {
  it('devuelve todas las filas sin filtros activos', () => {
    expect(filtrarDetalleUnidad(FILAS, { tipo: [] })).toBe(FILAS)
  })

  it('combina los filtros de tipo y modalidad', () => {
    expect(
      filtrarDetalleUnidad(FILAS, { tipo: ['SASERVI'], modalidad: ['agil'] }).map(
        (fila) => fila.id,
      ),
    ).toEqual([301])
  })

  it('ignora claves desconocidas', () => {
    expect(filtrarDetalleUnidad(FILAS, { otra: ['x'] })).toBe(FILAS)
  })
})

describe('opcionesFiltroDetalle', () => {
  it('construye opciones unicas ordenadas por etiqueta', () => {
    expect(opcionesFiltroDetalle(FILAS, 'modalidad')).toEqual([
      { value: 'agil', label: 'Compra Ágil' },
      { value: 'privada', label: 'Licitación privada' },
    ])
  })
})

describe('partesFecha', () => {
  it('entrega el dia de la semana y la fecha abreviada de una fecha civil', () => {
    expect(partesFecha('2026-07-22')).toEqual({ diaSemana: 'Miércoles', fecha: '22 jul 2026' })
  })

  it('devuelve el texto original ante una fecha invalida', () => {
    expect(partesFecha('fecha')).toEqual({ diaSemana: '', fecha: 'fecha' })
  })
})

describe('nombreArchivoPerfilUnidad', () => {
  it('compone el nombre con el identificador y la fecha local de generacion', () => {
    expect(nombreArchivoPerfilUnidad(1, new Date(2026, 9, 2))).toBe(
      'perfil-unidad-1-2026-10-02.pdf',
    )
  })
})
