import { describe, expect, it } from 'vitest'
import { formatFechaActual, parseFechaIso, procesarIndicadores } from './indicadores'

describe('procesarIndicadores', () => {
  it('procesa correctamente una serie de varios puntos', () => {
    const data = {
      fechaCorte: '2026-03-31',
      cantidadTransacciones: 8,
      serie: [
        { periodo: 'Enero', precompromiso: 100_000, compromiso: 80_000, facturado: 40_000 },
        { periodo: 'Febrero', precompromiso: 250_000, compromiso: 180_000, facturado: 120_000 },
        { periodo: 'Marzo', precompromiso: 300_000, compromiso: 240_000, facturado: 180_000 },
      ],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.precompromisoAcumulado).toBe(300_000)
    expect(resultado.compromisoAcumulado).toBe(240_000)
    expect(resultado.facturadoAcumulado).toBe(180_000)
    expect(resultado.ahorroProcesosConcursales).toBe(60_000)
    expect(resultado.cantidadTransacciones).toBe(8)

    expect(resultado.porcentajeComprometido).toBeCloseTo(0.8)
    expect(resultado.porcentajeFacturado).toBeCloseTo(0.75)

    expect(resultado.accumulatedData).toHaveLength(3)
    expect(resultado.accumulatedData[0]).toEqual({
      period: 'Enero',
      precompromiso: 100_000,
      compromiso: 80_000,
      facturado: 40_000,
    })

    expect(resultado.monthlyVariationData).toHaveLength(2)
    expect(resultado.monthlyVariationData[0]).toEqual({
      period: 'Ene a feb',
      precompromiso: 150_000, // 250_000 - 100_000
      compromiso: 100_000, // 180_000 - 80_000
      facturado: 80_000, // 120_000 - 40_000
    })
    expect(resultado.monthlyVariationData[1]).toEqual({
      period: 'Feb a mar',
      precompromiso: 50_000, // 300_000 - 250_000
      compromiso: 60_000, // 240_000 - 180_000
      facturado: 60_000, // 180_000 - 120_000
    })
  })

  it('aplica Math.max(0, ...) en la variacion mensual si hay ajustes negativos', () => {
    const dataConAjuste = {
      fechaCorte: '2026-02-28',
      cantidadTransacciones: 3,
      serie: [
        { periodo: 'Enero', precompromiso: 200_000, compromiso: 150_000, facturado: 70_000 },
        { periodo: 'Febrero', precompromiso: 180_000, compromiso: 140_000, facturado: 60_000 },
      ],
    }

    const resultado = procesarIndicadores(dataConAjuste)

    expect(resultado.monthlyVariationData).toEqual([
      {
        period: 'Ene a feb',
        precompromiso: 0,
        compromiso: 0,
        facturado: 0,
      },
    ])
  })

  it('procesa correctamente una serie de un solo punto', () => {
    const data = {
      fechaCorte: '2026-01-31',
      cantidadTransacciones: 1,
      serie: [{ periodo: 'Enero', precompromiso: 100_000, compromiso: 70_000, facturado: 35_000 }],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.precompromisoAcumulado).toBe(100_000)
    expect(resultado.compromisoAcumulado).toBe(70_000)
    expect(resultado.facturadoAcumulado).toBe(35_000)
    expect(resultado.ahorroProcesosConcursales).toBe(30_000)
    expect(resultado.cantidadTransacciones).toBe(1)
    expect(resultado.porcentajeComprometido).toBeCloseTo(0.7)
    expect(resultado.porcentajeFacturado).toBeCloseTo(0.5)

    expect(resultado.monthlyVariationData).toEqual([])
    expect(resultado.accumulatedData).toHaveLength(1)
  })

  it('retorna valores en cero y arreglos vacios ante una serie vacia', () => {
    const data = {
      fechaCorte: '2026-08-31',
      cantidadTransacciones: 0,
      serie: [],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.precompromisoAcumulado).toBe(0)
    expect(resultado.compromisoAcumulado).toBe(0)
    expect(resultado.facturadoAcumulado).toBe(0)
    expect(resultado.ahorroProcesosConcursales).toBe(0)
    expect(resultado.cantidadTransacciones).toBe(0)
    expect(resultado.porcentajeComprometido).toBe(0)
    expect(resultado.porcentajeFacturado).toBe(0)
    expect(resultado.accumulatedData).toEqual([])
    expect(resultado.monthlyVariationData).toEqual([])
  })

  it('conserva cantidadTransacciones aun cuando la serie este vacia', () => {
    const data = {
      fechaCorte: '2026-08-31',
      cantidadTransacciones: 4,
      serie: [],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.cantidadTransacciones).toBe(4)
  })

  it('retorna valores por defecto seguros cuando recibe null o undefined', () => {
    const resultadoNull = procesarIndicadores(null)
    expect(resultadoNull.precompromisoAcumulado).toBe(0)
    expect(resultadoNull.cantidadTransacciones).toBe(0)
    expect(resultadoNull.accumulatedData).toEqual([])
    expect(resultadoNull.monthlyVariationData).toEqual([])

    const resultadoUndefined = procesarIndicadores(undefined)
    expect(resultadoUndefined.precompromisoAcumulado).toBe(0)
    expect(resultadoUndefined.cantidadTransacciones).toBe(0)
    expect(resultadoUndefined.accumulatedData).toEqual([])
    expect(resultadoUndefined.monthlyVariationData).toEqual([])
  })

  it('evita division por cero cuando precompromiso acumulado es cero', () => {
    const data = {
      fechaCorte: '2026-01-31',
      cantidadTransacciones: 0,
      serie: [{ periodo: 'Enero', precompromiso: 0, compromiso: 0, facturado: 0 }],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.porcentajeComprometido).toBe(0)
    expect(resultado.porcentajeFacturado).toBe(0)
    expect(Number.isNaN(resultado.porcentajeComprometido)).toBe(false)
    expect(Number.isFinite(resultado.porcentajeComprometido)).toBe(true)
    expect(Number.isNaN(resultado.porcentajeFacturado)).toBe(false)
    expect(Number.isFinite(resultado.porcentajeFacturado)).toBe(true)
  })

  it('evita division por cero en porcentajeFacturado cuando compromiso acumulado es cero', () => {
    const data = {
      fechaCorte: '2026-01-31',
      cantidadTransacciones: 0,
      serie: [{ periodo: 'Enero', precompromiso: 50_000, compromiso: 0, facturado: 0 }],
    }

    const resultado = procesarIndicadores(data)

    expect(resultado.porcentajeComprometido).toBe(0)
    expect(resultado.porcentajeFacturado).toBe(0)
    expect(Number.isNaN(resultado.porcentajeFacturado)).toBe(false)
    expect(Number.isFinite(resultado.porcentajeFacturado)).toBe(true)
  })
})

describe('parseFechaIso', () => {
  it('parsea correctamente una fecha en formato YYYY-MM-DD', () => {
    const fecha = parseFechaIso('2026-08-19')

    expect(fecha).not.toBeNull()
    expect(fecha?.getFullYear()).toBe(2026)
    expect(fecha?.getMonth()).toBe(7) // Agosto es mes 7
    expect(fecha?.getDate()).toBe(19)
  })

  it('retorna null ante formatos invalidos', () => {
    expect(parseFechaIso('invalido')).toBeNull()
    expect(parseFechaIso('2026/08/19')).toBeNull()
    expect(parseFechaIso('19-08-2026')).toBeNull()
  })
})

describe('formatFechaActual', () => {
  it('formatea la fecha en formato chileno (dia de mes de anio)', () => {
    const fechaPrueba = new Date(2026, 4, 15) // 15 de mayo de 2026
    const texto = formatFechaActual(fechaPrueba)

    expect(texto).toContain('15')
    expect(texto.toLowerCase()).toContain('mayo')
    expect(texto).toContain('2026')
  })
})
