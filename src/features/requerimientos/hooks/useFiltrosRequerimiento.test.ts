import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFiltrosRequerimiento } from '@/features/requerimientos/hooks/useFiltrosRequerimiento'
import type {
  EstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'

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
  crearRequerimiento(4, 2, 'comprado', true),
]

function identificadores(filas: Requerimiento[]): number[] {
  return filas.map((fila) => fila.id)
}

describe('useFiltrosRequerimiento', () => {
  it('muestra inicialmente solo los requerimientos vigentes', () => {
    const { result } = renderHook(() => useFiltrosRequerimiento(requerimientos))

    expect(result.current.valores).toEqual({ vigencia: ['vigente'] })
    expect(identificadores(result.current.filasFiltradas)).toEqual([1, 2, 3])
  })

  it('aplica el filtro seleccionado sin perder la vigencia', () => {
    const { result } = renderHook(() => useFiltrosRequerimiento(requerimientos))

    act(() => {
      result.current.cambiarFiltro('estado', ['comprado'])
    })

    expect(result.current.valores).toEqual({ vigencia: ['vigente'], estado: ['comprado'] })
    expect(identificadores(result.current.filasFiltradas)).toEqual([1, 3])
  })

  it('muestra los eliminados cuando se elige esa vigencia', () => {
    const { result } = renderHook(() => useFiltrosRequerimiento(requerimientos))

    act(() => {
      result.current.cambiarFiltro('vigencia', ['eliminado'])
    })

    expect(identificadores(result.current.filasFiltradas)).toEqual([4])
  })

  it('ignora las claves que no corresponden a un filtro', () => {
    const { result } = renderHook(() => useFiltrosRequerimiento(requerimientos))

    act(() => {
      result.current.cambiarFiltro('campus', ['osorno'])
    })

    expect(result.current.valores).toEqual({ vigencia: ['vigente'] })
    expect(identificadores(result.current.filasFiltradas)).toEqual([1, 2, 3])
  })

  it('al limpiar vuelve a los valores iniciales', () => {
    const { result } = renderHook(() => useFiltrosRequerimiento(requerimientos))

    act(() => {
      result.current.cambiarFiltro('solicitante', ['2'])
      result.current.cambiarFiltro('vigencia', ['eliminado'])
    })

    act(() => {
      result.current.limpiarFiltros()
    })

    expect(result.current.valores).toEqual({ vigencia: ['vigente'] })
    expect(identificadores(result.current.filasFiltradas)).toEqual([1, 2, 3])
  })
})
