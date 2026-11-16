import { describe, it, expect } from 'vitest'
import { registroMonitoreoResponseSchema } from './monitoreoResponse.schema'

const PESOS = {
  impactoAcademico: 0.4,
  urgenciaTemporal: 0.3,
  exposicionInstitucional: 0.2,
  riesgoOperacional: 0.1,
}

const respuestaSinEvaluar = {
  transaccionId: 1,
  nombre: 'Equipamiento laboratorio de suelos',
  analista: null,
  evaluacion: null,
  ultimoMovimiento: null,
  proximaAccion: null,
  fechaProximaRevision: null,
  bloqueadorPrincipal: null,
  escalarAJefatura: false,
  cerrado: false,
  observaciones: null,
}

describe('registroMonitoreoResponseSchema', () => {
  it('admite una transaccion sin analista y sin evaluacion', () => {
    const registro = registroMonitoreoResponseSchema.parse(respuestaSinEvaluar)
    expect(registro.analista).toBeNull()
    expect(registro.evaluacion).toBeNull()
  })

  it('lee la evaluacion y el analista entregados por el servidor', () => {
    const registro = registroMonitoreoResponseSchema.parse({
      ...respuestaSinEvaluar,
      analista: { run: 16234875, nombre: 'Camila Ferrada' },
      evaluacion: {
        factores: {
          impactoAcademico: 5,
          urgenciaTemporal: 4,
          exposicionInstitucional: 4,
          riesgoOperacional: 3,
        },
        pesos: PESOS,
        indice: 4.3,
        nivel: 'critico',
      },
    })

    expect(registro.evaluacion?.indice).toBe(4.3)
    expect(registro.evaluacion?.nivel).toBe('critico')
    expect(registro.evaluacion?.pesos).toEqual(PESOS)
    expect(registro.analista).toEqual({ run: 16234875, nombre: 'Camila Ferrada' })
  })

  it('interpreta una fecha de calendario en horario local', () => {
    const registro = registroMonitoreoResponseSchema.parse({
      ...respuestaSinEvaluar,
      fechaProximaRevision: '2026-03-05',
    })

    expect(registro.fechaProximaRevision?.getFullYear()).toBe(2026)
    expect(registro.fechaProximaRevision?.getMonth()).toBe(2)
    expect(registro.fechaProximaRevision?.getDate()).toBe(5)
  })

  it('conserva el instante de una marca de tiempo completa', () => {
    const registro = registroMonitoreoResponseSchema.parse({
      ...respuestaSinEvaluar,
      fechaProximaRevision: '2026-03-05T14:30:00.000Z',
    })

    expect(registro.fechaProximaRevision?.toISOString()).toBe('2026-03-05T14:30:00.000Z')
  })

  it('interpreta el ultimo movimiento como hora local', () => {
    const registro = registroMonitoreoResponseSchema.parse({
      ...respuestaSinEvaluar,
      ultimoMovimiento: '2026-03-24T10:12:00',
    })

    expect(registro.ultimoMovimiento?.getDate()).toBe(24)
    expect(registro.ultimoMovimiento?.getHours()).toBe(10)
    expect(registro.ultimoMovimiento?.getMinutes()).toBe(12)
  })

  it('admite un ultimo movimiento nulo', () => {
    expect(registroMonitoreoResponseSchema.parse(respuestaSinEvaluar).ultimoMovimiento).toBeNull()
  })

  it('lee el bloqueador como opcion con codigo y etiqueta', () => {
    const registro = registroMonitoreoResponseSchema.parse({
      ...respuestaSinEvaluar,
      bloqueadorPrincipal: { value: 'proveedores', label: 'Proveedores' },
    })

    expect(registro.bloqueadorPrincipal).toEqual({ value: 'proveedores', label: 'Proveedores' })
  })

  it('admite un bloqueador nulo', () => {
    expect(
      registroMonitoreoResponseSchema.parse(respuestaSinEvaluar).bloqueadorPrincipal,
    ).toBeNull()
  })

  it('rechaza un bloqueador entregado como texto plano', () => {
    const resultado = registroMonitoreoResponseSchema.safeParse({
      ...respuestaSinEvaluar,
      bloqueadorPrincipal: 'proveedores',
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza un factor fuera de la escala', () => {
    const resultado = registroMonitoreoResponseSchema.safeParse({
      ...respuestaSinEvaluar,
      evaluacion: {
        factores: {
          impactoAcademico: 6,
          urgenciaTemporal: 4,
          exposicionInstitucional: 4,
          riesgoOperacional: 3,
        },
        pesos: PESOS,
        indice: 4.7,
        nivel: 'critico',
      },
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza una evaluacion con factores incompletos', () => {
    const resultado = registroMonitoreoResponseSchema.safeParse({
      ...respuestaSinEvaluar,
      evaluacion: {
        factores: { impactoAcademico: 5, urgenciaTemporal: 4 },
        pesos: PESOS,
        indice: 4.3,
        nivel: 'critico',
      },
    })

    expect(resultado.success).toBe(false)
  })
})
