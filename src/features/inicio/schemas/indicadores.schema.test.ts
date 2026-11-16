import { describe, expect, it } from 'vitest'
import { elementoSerieSchema, indicadores, resumenPresupuestarioSchema } from './indicadores.schema'

const elementoBase = {
  periodo: 'Enero',
  precompromiso: 100_000,
  compromiso: 80_000,
  facturado: 40_000,
}

const respuestaBase = {
  fechaCorte: '2026-08-31',
  cantidadTransacciones: 12,
  serie: [
    elementoBase,
    {
      periodo: 'Febrero',
      precompromiso: 250_000,
      compromiso: 180_000,
      facturado: 120_000,
    },
  ],
}

describe('resumenPresupuestarioSchema', () => {
  it('acepta una respuesta valida con fechaCorte, cantidadTransacciones y serie completa', () => {
    const resultado = resumenPresupuestarioSchema.parse(respuestaBase)

    expect(resultado.fechaCorte).toBe('2026-08-31')
    expect(resultado.cantidadTransacciones).toBe(12)
    expect(resultado.serie).toHaveLength(2)
    expect(resultado.serie[0]).toEqual(elementoBase)
  })

  it('acepta una respuesta con serie vacia', () => {
    const resultado = resumenPresupuestarioSchema.parse({
      fechaCorte: '2026-08-31',
      cantidadTransacciones: 0,
      serie: [],
    })

    expect(resultado.serie).toEqual([])
    expect(resultado.cantidadTransacciones).toBe(0)
  })

  it('asigna un arreglo vacio por defecto si no se incluye serie', () => {
    const resultado = resumenPresupuestarioSchema.parse({
      fechaCorte: '2026-08-31',
      cantidadTransacciones: 5,
    })

    expect(resultado.serie).toEqual([])
    expect(resultado.cantidadTransacciones).toBe(5)
  })

  it('acepta cantidadTransacciones en cero', () => {
    const resultado = resumenPresupuestarioSchema.parse({
      ...respuestaBase,
      cantidadTransacciones: 0,
    })

    expect(resultado.cantidadTransacciones).toBe(0)
  })

  it('rechaza una respuesta sin cantidadTransacciones', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      serie: [elementoBase],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza cuando cantidadTransacciones no es entero', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      cantidadTransacciones: 10.5,
      serie: [],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza cuando cantidadTransacciones no es numerico', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      cantidadTransacciones: '10',
      serie: [],
    })

    expect(resultado.success).toBe(false)
  })

  it('el alias indicadores se comporta de manera identica', () => {
    expect(indicadores.safeParse(respuestaBase).success).toBe(true)
  })

  it('rechaza una respuesta sin fechaCorte', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      cantidadTransacciones: 1,
      serie: [elementoBase],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza cuando fechaCorte no es string', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: 20260831,
      serie: [],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza cuando la serie no es un arreglo', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      serie: 'no-es-un-arreglo',
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza elementos de serie con campos faltantes', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      serie: [
        {
          periodo: 'Enero',
          precompromiso: 100_000,
        },
      ],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza elementos de serie con tipos invalidos', () => {
    const resultado = resumenPresupuestarioSchema.safeParse({
      fechaCorte: '2026-08-31',
      serie: [
        {
          periodo: 'Enero',
          precompromiso: '100000',
          compromiso: 80_000,
          facturado: 40_000,
        },
      ],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza valores no objeto', () => {
    expect(resumenPresupuestarioSchema.safeParse(null).success).toBe(false)
    expect(resumenPresupuestarioSchema.safeParse(undefined).success).toBe(false)
    expect(resumenPresupuestarioSchema.safeParse('respuesta').success).toBe(false)
    expect(resumenPresupuestarioSchema.safeParse(12345).success).toBe(false)
  })
})

describe('elementoSerieSchema', () => {
  it('acepta un elemento valido', () => {
    expect(elementoSerieSchema.safeParse(elementoBase).success).toBe(true)
  })

  it('rechaza si falta el periodo', () => {
    const sinPeriodo = {
      precompromiso: 100_000,
      compromiso: 80_000,
      facturado: 40_000,
    }
    expect(elementoSerieSchema.safeParse(sinPeriodo).success).toBe(false)
  })

  it('rechaza si algun monto no es numerico', () => {
    expect(elementoSerieSchema.safeParse({ ...elementoBase, facturado: null }).success).toBe(false)
  })
})
