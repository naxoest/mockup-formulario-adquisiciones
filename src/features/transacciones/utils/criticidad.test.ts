import { describe, it, expect } from 'vitest'
import {
  calcularDiasCorridos,
  clasificarSeguimiento,
  construirFilaMonitoreo,
  ordenarPorCriticidad,
} from './criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import type {
  FactoresCriticidad,
  FilaMonitoreo,
  RegistroMonitoreo,
  ValorFactor,
} from '@/features/transacciones/types/monitoreo.types'

const factores = (
  impactoAcademico: ValorFactor,
  urgenciaTemporal: ValorFactor,
  exposicionInstitucional: ValorFactor,
  riesgoOperacional: ValorFactor,
): FactoresCriticidad => ({
  impactoAcademico,
  urgenciaTemporal,
  exposicionInstitucional,
  riesgoOperacional,
})

const registroBase: RegistroMonitoreo = {
  transaccionId: 42,
  nombre: 'Equipamiento laboratorio',
  analista: { run: 16234875, nombre: 'Camila Ferrada' },
  evaluacion: calcularEvaluacion(factores(5, 4, 4, 3)),
  ultimoMovimiento: new Date(2026, 7, 12, 10, 12),
  proximaAccion: 'Reiterar cotizacion',
  fechaProximaRevision: new Date(2026, 7, 21),
  bloqueadorPrincipal: { value: 'proveedores', label: 'Proveedores' },
  escalarAJefatura: true,
  cerrado: false,
  observaciones: 'El proveedor no responde',
}

describe('calcularDiasCorridos', () => {
  it('devuelve cero para el mismo dia', () => {
    expect(calcularDiasCorridos(new Date(2026, 7, 18), new Date(2026, 7, 18))).toBe(0)
  })

  it('ignora la hora de cada fecha', () => {
    const desde = new Date(2026, 7, 13, 9, 30)
    const hasta = new Date(2026, 7, 18, 23, 59)
    expect(calcularDiasCorridos(desde, hasta)).toBe(5)
  })

  it('devuelve un entero cruzando el cambio de horario', () => {
    const desde = new Date(2026, 8, 4, 9, 30)
    const hasta = new Date(2026, 8, 8, 23, 59)
    expect(calcularDiasCorridos(desde, hasta)).toBe(4)
  })

  it('cruza el cambio de anio', () => {
    expect(calcularDiasCorridos(new Date(2025, 11, 30), new Date(2026, 0, 2))).toBe(3)
  })

  it('devuelve un valor negativo cuando la fecha final es anterior', () => {
    expect(calcularDiasCorridos(new Date(2026, 7, 18), new Date(2026, 7, 15))).toBe(-3)
  })
})

describe('clasificarSeguimiento', () => {
  it('distingue la ausencia de gestion registrada', () => {
    expect(clasificarSeguimiento(null)).toBe('sinRegistro')
  })

  it('clasifica como normal una gestion del mismo dia', () => {
    expect(clasificarSeguimiento(0)).toBe('normal')
  })

  it('clasifica como normal un dia transcurrido', () => {
    expect(clasificarSeguimiento(1)).toBe('normal')
  })

  it('clasifica como atencion en el umbral exacto', () => {
    expect(clasificarSeguimiento(2)).toBe('atencion')
  })

  it('clasifica como critico en el umbral exacto', () => {
    expect(clasificarSeguimiento(3)).toBe('critico')
  })
})

describe('construirFilaMonitoreo', () => {
  const referencia = new Date(2026, 7, 18)

  it('conserva la evaluacion entregada por el servidor', () => {
    const fila = construirFilaMonitoreo(registroBase, referencia)
    expect(fila.evaluacion).toEqual(registroBase.evaluacion)
  })

  it('deja la evaluacion en nulo cuando la transaccion no ha sido evaluada', () => {
    const registro: RegistroMonitoreo = { ...registroBase, evaluacion: null }
    expect(construirFilaMonitoreo(registro, referencia).evaluacion).toBeNull()
  })

  it('expone el indice tambien como campo plano', () => {
    expect(construirFilaMonitoreo(registroBase, referencia).indice).toBe(4.3)
  })

  it('deja el campo plano en nulo cuando no hay evaluacion', () => {
    const registro: RegistroMonitoreo = { ...registroBase, evaluacion: null }
    expect(construirFilaMonitoreo(registro, referencia).indice).toBeNull()
  })

  it('aplana la etiqueta del bloqueador', () => {
    expect(construirFilaMonitoreo(registroBase, referencia).etiquetaBloqueador).toBe('Proveedores')
  })

  it('deja la etiqueta del bloqueador en nulo cuando no hay bloqueo', () => {
    const registro: RegistroMonitoreo = { ...registroBase, bloqueadorPrincipal: null }
    expect(construirFilaMonitoreo(registro, referencia).etiquetaBloqueador).toBeNull()
  })

  it('conserva el bloqueador como opcion completa', () => {
    const fila = construirFilaMonitoreo(registroBase, referencia)
    expect(fila.bloqueadorPrincipal).toEqual({ value: 'proveedores', label: 'Proveedores' })
  })

  it('calcula los dias de seguimiento aunque no haya evaluacion', () => {
    const registro: RegistroMonitoreo = { ...registroBase, evaluacion: null }
    const fila = construirFilaMonitoreo(registro, referencia)
    expect(fila.diasSinGestion).toBe(6)
    expect(fila.nivelSeguimiento).toBe('critico')
  })

  it('calcula los dias transcurridos desde el ultimo movimiento', () => {
    const fila = construirFilaMonitoreo(registroBase, referencia)
    expect(fila.diasSinGestion).toBe(6)
    expect(fila.nivelSeguimiento).toBe('critico')
  })

  it('ignora la hora del ultimo movimiento y cuenta dias de calendario', () => {
    const registro: RegistroMonitoreo = {
      ...registroBase,
      ultimoMovimiento: new Date(2026, 7, 17, 23, 59),
    }
    expect(construirFilaMonitoreo(registro, referencia).diasSinGestion).toBe(1)
  })

  it('calcula los dias restantes hasta la proxima revision', () => {
    const fila = construirFilaMonitoreo(registroBase, referencia)
    expect(fila.diasHastaRevision).toBe(3)
  })

  it('devuelve dias negativos cuando la revision esta vencida', () => {
    const registro: RegistroMonitoreo = {
      ...registroBase,
      fechaProximaRevision: new Date(2026, 7, 17),
    }
    expect(construirFilaMonitoreo(registro, referencia).diasHastaRevision).toBe(-1)
  })

  it('deja los dias en nulo cuando no hay movimiento registrado', () => {
    const registro: RegistroMonitoreo = { ...registroBase, ultimoMovimiento: null }
    const fila = construirFilaMonitoreo(registro, referencia)
    expect(fila.diasSinGestion).toBeNull()
    expect(fila.nivelSeguimiento).toBe('sinRegistro')
  })

  it('deja los dias en nulo cuando no hay proxima revision', () => {
    const registro: RegistroMonitoreo = { ...registroBase, fechaProximaRevision: null }
    expect(construirFilaMonitoreo(registro, referencia).diasHastaRevision).toBeNull()
  })

  it('conserva los campos del registro original', () => {
    const fila = construirFilaMonitoreo(registroBase, referencia)
    expect(fila.transaccionId).toBe(42)
    expect(fila.analista).toEqual({ run: 16234875, nombre: 'Camila Ferrada' })
    expect(fila.nombreAnalista).toBe('Camila Ferrada')
    expect(fila.escalarAJefatura).toBe(true)
    expect(fila.cerrado).toBe(false)
  })

  it('conserva el analista en nulo cuando no hay asignacion', () => {
    const registro: RegistroMonitoreo = { ...registroBase, analista: null }
    const fila = construirFilaMonitoreo(registro, referencia)
    expect(fila.analista).toBeNull()
    expect(fila.nombreAnalista).toBeNull()
  })
})

describe('ordenarPorCriticidad', () => {
  const referencia = new Date(2026, 7, 18)

  const filaCon = (transaccionId: number, evaluados: FactoresCriticidad | null): FilaMonitoreo =>
    construirFilaMonitoreo(
      {
        ...registroBase,
        transaccionId,
        evaluacion: evaluados === null ? null : calcularEvaluacion(evaluados),
      },
      referencia,
    )

  it('ordena de mayor a menor indice', () => {
    const filas = [
      filaCon(1, factores(2, 2, 2, 2)),
      filaCon(2, factores(5, 5, 5, 5)),
      filaCon(3, factores(3, 3, 3, 3)),
    ]
    expect(ordenarPorCriticidad(filas).map((f) => f.transaccionId)).toEqual([2, 3, 1])
  })

  it('conserva el orden de entrada entre indices iguales', () => {
    const filas = [
      filaCon(1, factores(3, 3, 3, 3)),
      filaCon(2, factores(3, 3, 3, 3)),
      filaCon(3, factores(3, 3, 3, 3)),
    ]
    expect(ordenarPorCriticidad(filas).map((f) => f.transaccionId)).toEqual([1, 2, 3])
  })

  it('ubica al inicio las transacciones sin evaluar', () => {
    const filas = [
      filaCon(1, factores(5, 5, 5, 5)),
      filaCon(2, null),
      filaCon(3, factores(3, 3, 3, 3)),
    ]
    expect(ordenarPorCriticidad(filas).map((f) => f.transaccionId)).toEqual([2, 1, 3])
  })

  it('conserva el orden de entrada entre transacciones sin evaluar', () => {
    const filas = [filaCon(1, null), filaCon(2, null), filaCon(3, factores(5, 5, 5, 5))]
    expect(ordenarPorCriticidad(filas).map((f) => f.transaccionId)).toEqual([1, 2, 3])
  })

  it('no muta el arreglo recibido', () => {
    const filas = [filaCon(1, factores(1, 1, 1, 1)), filaCon(2, factores(5, 5, 5, 5))]
    ordenarPorCriticidad(filas)
    expect(filas.map((f) => f.transaccionId)).toEqual([1, 2])
  })
})
