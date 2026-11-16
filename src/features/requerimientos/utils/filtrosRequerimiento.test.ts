import { describe, expect, it } from 'vitest'
import type {
  EstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import {
  contarPorEstado,
  esClaveFiltro,
  filtrarRequerimientos,
  VALORES_FILTRO_INICIALES,
} from '@/features/requerimientos/utils/filtrosRequerimiento'

function crearRequerimiento(
  id: number,
  solicitanteId: number,
  estado: EstadoRequerimiento,
  eliminado = false,
): Requerimiento {
  return {
    id,
    identificador: String(id),
    solicitante: {
      id: solicitanteId,
      cr: 100 + solicitanteId,
      nombre: `Solicitante ${solicitanteId}`,
      sedes: [{ value: 'osorno', label: 'Osorno' }],
      tipo: 'carrera',
    },
    materiales: `Material ${id}`,
    descripcion: null,
    cantidad: 1,
    estado: { value: estado, label: estado },
    modalidad: null,
    ordenDeCompra: null,
    fechaMaximaLlegada: null,
    fechaLlegada: null,
    observaciones: null,
    carpeta: null,
    actualizadoEn: '2026-09-29T09:05:00',
    eliminado,
  }
}

const requerimientos = [
  crearRequerimiento(1, 1, 'comprado'),
  crearRequerimiento(2, 1, 'entregado'),
  crearRequerimiento(3, 2, 'comprado'),
  crearRequerimiento(4, 2, 'desestimado'),
  crearRequerimiento(5, 1, 'comprado', true),
]

function identificadores(filas: Requerimiento[]): number[] {
  return filas.map((fila) => fila.id)
}

describe('filtrarRequerimientos', () => {
  it('entrega todos los requerimientos cuando no hay filtros', () => {
    expect(identificadores(filtrarRequerimientos(requerimientos, {}))).toEqual([1, 2, 3, 4, 5])
  })

  it('trata una selección vacía como ausencia de filtro', () => {
    const filas = filtrarRequerimientos(requerimientos, {
      solicitante: [],
      estado: [],
      vigencia: [],
    })

    expect(identificadores(filas)).toEqual([1, 2, 3, 4, 5])
  })

  it('muestra solo los vigentes con los valores iniciales', () => {
    expect(
      identificadores(filtrarRequerimientos(requerimientos, VALORES_FILTRO_INICIALES)),
    ).toEqual([1, 2, 3, 4])
  })

  it('muestra solo los eliminados cuando se elige esa vigencia', () => {
    const filas = filtrarRequerimientos(requerimientos, { vigencia: ['eliminado'] })

    expect(identificadores(filas)).toEqual([5])
  })

  it('filtra por el identificador del solicitante', () => {
    const filas = filtrarRequerimientos(requerimientos, { solicitante: ['2'] })

    expect(identificadores(filas)).toEqual([3, 4])
  })

  it('admite varios estados a la vez', () => {
    const filas = filtrarRequerimientos(requerimientos, { estado: ['entregado', 'desestimado'] })

    expect(identificadores(filas)).toEqual([2, 4])
  })

  it('combina los filtros de solicitante, estado y vigencia', () => {
    const filas = filtrarRequerimientos(requerimientos, {
      solicitante: ['1'],
      estado: ['comprado'],
      vigencia: ['vigente'],
    })

    expect(identificadores(filas)).toEqual([1])
  })
})

describe('contarPorEstado', () => {
  it('cuenta cada estado e incluye los que no tienen requerimientos', () => {
    expect(contarPorEstado(requerimientos, {})).toEqual({
      total: 5,
      porEstado: { comprado: 3, en_bodega: 0, no_comprado: 0, entregado: 1, desestimado: 1 },
    })
  })

  it('respeta el filtro de solicitante', () => {
    expect(contarPorEstado(requerimientos, { solicitante: ['2'] })).toEqual({
      total: 2,
      porEstado: { comprado: 1, en_bodega: 0, no_comprado: 0, entregado: 0, desestimado: 1 },
    })
  })

  it('respeta el filtro de vigencia', () => {
    expect(contarPorEstado(requerimientos, { solicitante: ['1'], vigencia: ['vigente'] })).toEqual({
      total: 2,
      porEstado: { comprado: 1, en_bodega: 0, no_comprado: 0, entregado: 1, desestimado: 0 },
    })
  })

  it('ignora el filtro de estado para mostrar la distribución completa', () => {
    expect(contarPorEstado(requerimientos, { estado: ['comprado'] })).toEqual(
      contarPorEstado(requerimientos, {}),
    )
  })
})

describe('esClaveFiltro', () => {
  it('reconoce las claves de los filtros del listado', () => {
    expect(esClaveFiltro('solicitante')).toBe(true)
    expect(esClaveFiltro('estado')).toBe(true)
    expect(esClaveFiltro('vigencia')).toBe(true)
  })

  it('rechaza las claves ajenas al listado', () => {
    expect(esClaveFiltro('campus')).toBe(false)
  })
})
