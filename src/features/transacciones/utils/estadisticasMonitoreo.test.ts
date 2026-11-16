import { describe, it, expect } from 'vitest'
import { calcularEstadisticasMonitoreo } from './estadisticasMonitoreo'
import { construirFilaMonitoreo } from './criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
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
    impactoAcademico: 1,
    urgenciaTemporal: 1,
    exposicionInstitucional: 1,
    riesgoOperacional: 1,
  }),
  ultimoMovimiento: new Date(2026, 7, 18, 9, 0),
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

describe('calcularEstadisticasMonitoreo', () => {
  it('devuelve ceros sin filas', () => {
    expect(calcularEstadisticasMonitoreo([])).toEqual({
      criticos: 0,
      sinGestionSobreUmbral: 0,
      revisionesVencidas: 0,
      escalamientosPendientes: 0,
    })
  })

  it('cuenta solo los procesos criticos', () => {
    const filas = [
      fila({}),
      fila({
        evaluacion: calcularEvaluacion({
          impactoAcademico: 5,
          urgenciaTemporal: 5,
          exposicionInstitucional: 5,
          riesgoOperacional: 5,
        }),
      }),
    ]
    expect(calcularEstadisticasMonitoreo(filas).criticos).toBe(1)
  })

  it('cuenta la ausencia de movimiento dentro del umbral', () => {
    const filas = [fila({ ultimoMovimiento: null })]
    expect(calcularEstadisticasMonitoreo(filas).sinGestionSobreUmbral).toBe(1)
  })

  it('cuenta el umbral exacto de dias sin movimiento', () => {
    const filas = [fila({ ultimoMovimiento: new Date(2026, 7, 15, 9, 0) })]
    expect(calcularEstadisticasMonitoreo(filas).sinGestionSobreUmbral).toBe(1)
  })

  it('no cuenta un proceso justo bajo el umbral', () => {
    const filas = [fila({ ultimoMovimiento: new Date(2026, 7, 16, 9, 0) })]
    expect(calcularEstadisticasMonitoreo(filas).sinGestionSobreUmbral).toBe(0)
  })

  it('cuenta las revisiones vencidas', () => {
    const filas = [
      fila({ fechaProximaRevision: new Date(2026, 7, 17) }),
      fila({ fechaProximaRevision: new Date(2026, 7, 19) }),
      fila({ fechaProximaRevision: null }),
    ]
    expect(calcularEstadisticasMonitoreo(filas).revisionesVencidas).toBe(1)
  })

  it('no cuenta como vencida una revision del mismo dia', () => {
    const filas = [fila({ fechaProximaRevision: new Date(2026, 7, 18) })]
    expect(calcularEstadisticasMonitoreo(filas).revisionesVencidas).toBe(0)
  })

  it('cuenta los escalamientos', () => {
    const filas = [fila({ escalarAJefatura: true }), fila({})]
    expect(calcularEstadisticasMonitoreo(filas).escalamientosPendientes).toBe(1)
  })
})
