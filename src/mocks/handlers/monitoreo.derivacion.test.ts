import { describe, expect, it } from 'vitest'
import { calcularEvaluacion } from './monitoreo.derivacion'
import type {
  FactoresCriticidad,
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

describe('calcularEvaluacion', () => {
  it('pondera cada factor con su peso', () => {
    expect(calcularEvaluacion(factores(5, 4, 4, 3)).indice).toBe(4.3)
  })

  it('entrega pesos que suman uno', () => {
    const { pesos } = calcularEvaluacion(factores(1, 1, 1, 1))
    const suma =
      pesos.impactoAcademico +
      pesos.urgenciaTemporal +
      pesos.exposicionInstitucional +
      pesos.riesgoOperacional

    expect(suma).toBeCloseTo(1)
  })

  it('clasifica como critico desde su umbral', () => {
    expect(calcularEvaluacion(factores(4, 4, 4, 4)).nivel).toBe('critico')
    expect(calcularEvaluacion(factores(4, 4, 4, 3)).nivel).toBe('atencion')
  })

  it('clasifica como atencion desde su umbral', () => {
    expect(calcularEvaluacion(factores(3, 3, 3, 3)).nivel).toBe('atencion')
    expect(calcularEvaluacion(factores(3, 3, 3, 2)).nivel).toBe('controlado')
  })
})
