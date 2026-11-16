import { describe, it, expect } from 'vitest'
import {
  analistasDisponibles,
  esClaveFiltroMonitoreo,
  filtrarMonitoreo,
  VALOR_ESTADO_ABIERTO,
  VALOR_ESTADO_CERRADO,
} from './filtrosMonitoreo'
import { construirFilaMonitoreo } from './criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import type {
  FactoresCriticidad,
  FilaMonitoreo,
  RegistroMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

const referencia = new Date(2026, 7, 18)

const FERRADA = { run: 16234875, nombre: 'Camila Ferrada' }
const PAILLAN = { run: 17890123, nombre: 'Rodrigo Paillán' }

const base: RegistroMonitoreo = {
  transaccionId: 1,
  nombre: 'Proceso',
  analista: FERRADA,
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

const criticos: FactoresCriticidad = {
  impactoAcademico: 5,
  urgenciaTemporal: 5,
  exposicionInstitucional: 5,
  riesgoOperacional: 5,
}

describe('esClaveFiltroMonitoreo', () => {
  it('reconoce las cuatro claves declaradas', () => {
    expect(esClaveFiltroMonitoreo('estado')).toBe(true)
    expect(esClaveFiltroMonitoreo('criticidad')).toBe(true)
    expect(esClaveFiltroMonitoreo('seguimiento')).toBe(true)
    expect(esClaveFiltroMonitoreo('analista')).toBe(true)
  })

  it('rechaza una clave desconocida', () => {
    expect(esClaveFiltroMonitoreo('inexistente')).toBe(false)
  })
})

describe('filtrarMonitoreo', () => {
  const filas = [
    fila({ transaccionId: 1 }),
    fila({ transaccionId: 2, cerrado: true }),
    fila({
      transaccionId: 3,
      evaluacion: calcularEvaluacion(criticos),
      analista: PAILLAN,
    }),
  ]

  it('devuelve todas las filas sin filtros activos', () => {
    expect(filtrarMonitoreo(filas, {})).toHaveLength(3)
  })

  it('ignora un filtro con seleccion vacia', () => {
    expect(filtrarMonitoreo(filas, { estado: [] })).toHaveLength(3)
  })

  it('filtra los procesos abiertos', () => {
    const resultado = filtrarMonitoreo(filas, { estado: [VALOR_ESTADO_ABIERTO] })
    expect(resultado.map((f) => f.transaccionId)).toEqual([1, 3])
  })

  it('filtra los procesos cerrados', () => {
    const resultado = filtrarMonitoreo(filas, { estado: [VALOR_ESTADO_CERRADO] })
    expect(resultado.map((f) => f.transaccionId)).toEqual([2])
  })

  it('filtra por nivel de criticidad', () => {
    const resultado = filtrarMonitoreo(filas, { criticidad: ['critico'] })
    expect(resultado.map((f) => f.transaccionId)).toEqual([3])
  })

  it('filtra por el run del analista', () => {
    const resultado = filtrarMonitoreo(filas, { analista: [String(PAILLAN.run)] })
    expect(resultado.map((f) => f.transaccionId)).toEqual([3])
  })

  it('combina filtros con conjuncion', () => {
    const resultado = filtrarMonitoreo(filas, {
      estado: [VALOR_ESTADO_ABIERTO],
      criticidad: ['critico'],
    })
    expect(resultado.map((f) => f.transaccionId)).toEqual([3])
  })

  it('descarta claves desconocidas en lugar de fallar', () => {
    expect(() => filtrarMonitoreo(filas, { inexistente: ['x'] })).not.toThrow()
    expect(filtrarMonitoreo(filas, { inexistente: ['x'] })).toHaveLength(3)
  })
})

describe('analistasDisponibles', () => {
  it('devuelve un analista por run, ordenado por nombre', () => {
    const filas = [
      fila({ analista: PAILLAN }),
      fila({ analista: FERRADA }),
      fila({ analista: PAILLAN }),
    ]
    expect(analistasDisponibles(filas)).toEqual([
      { value: String(FERRADA.run), label: 'Camila Ferrada' },
      { value: String(PAILLAN.run), label: 'Rodrigo Paillán' },
    ])
  })

  it('omite las filas sin analista', () => {
    expect(analistasDisponibles([fila({ analista: null })])).toEqual([])
  })

  it('devuelve un arreglo vacio sin filas', () => {
    expect(analistasDisponibles([])).toEqual([])
  })
})
