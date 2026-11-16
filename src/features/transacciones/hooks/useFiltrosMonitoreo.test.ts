import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useFiltrosMonitoreo } from './useFiltrosMonitoreo'
import { construirFilaMonitoreo } from '@/features/transacciones/utils/criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import { VALOR_ESTADO_CERRADO } from '@/features/transacciones/utils/filtrosMonitoreo'
import type {
  FilaMonitoreo,
  RegistroMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

const referencia = new Date(2026, 7, 18)

const base: RegistroMonitoreo = {
  transaccionId: 1,
  nombre: 'Proceso',
  analista: { run: 16234875, nombre: 'Camila Ferrada' },
  evaluacion: calcularEvaluacion({
    impactoAcademico: 3,
    urgenciaTemporal: 3,
    exposicionInstitucional: 3,
    riesgoOperacional: 3,
  }),
  ultimoMovimiento: new Date(2026, 7, 17, 9, 0),
  proximaAccion: null,
  fechaProximaRevision: null,
  bloqueadorPrincipal: null,
  escalarAJefatura: false,
  cerrado: false,
  observaciones: null,
}

function fila(cambios: Partial<RegistroMonitoreo>): FilaMonitoreo {
  return construirFilaMonitoreo({ ...base, ...cambios }, referencia)
}

const filas = [fila({ transaccionId: 1 }), fila({ transaccionId: 2, cerrado: true })]

describe('useFiltrosMonitoreo', () => {
  it('inicia mostrando solo los procesos abiertos', () => {
    const { result } = renderHook(() => useFiltrosMonitoreo(filas))
    expect(result.current.filasFiltradas.map((f) => f.transaccionId)).toEqual([1])
  })

  it('cambia la seleccion de un filtro', () => {
    const { result } = renderHook(() => useFiltrosMonitoreo(filas))
    act(() => {
      result.current.cambiarFiltro('estado', [VALOR_ESTADO_CERRADO])
    })
    expect(result.current.filasFiltradas.map((f) => f.transaccionId)).toEqual([2])
  })

  it('conserva los demas filtros al cambiar uno', () => {
    const { result } = renderHook(() => useFiltrosMonitoreo(filas))
    act(() => {
      result.current.cambiarFiltro('criticidad', ['atencion'])
    })
    expect(result.current.valores.estado).toEqual(['abierto'])
    expect(result.current.valores.criticidad).toEqual(['atencion'])
  })

  it('muestra todos los procesos al limpiar', () => {
    const { result } = renderHook(() => useFiltrosMonitoreo(filas))
    act(() => {
      result.current.limpiarFiltros()
    })
    expect(result.current.filasFiltradas).toHaveLength(2)
    expect(result.current.valores).toEqual({})
  })
})
