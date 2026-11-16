import { describe, expect, it } from 'vitest'
import { fromCivilDate, toCivilDate } from './date'

describe('toCivilDate', () => {
  it('formatea la fecha como AAAA-MM-DD', () => {
    expect(toCivilDate(new Date(2026, 2, 10))).toBe('2026-03-10')
  })

  it('rellena con cero el mes y el dia de un digito', () => {
    expect(toCivilDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('conserva el dia local en la medianoche', () => {
    expect(toCivilDate(new Date(2026, 5, 1, 0, 0, 0))).toBe('2026-06-01')
  })

  it('conserva el dia local al final del dia', () => {
    expect(toCivilDate(new Date(2026, 5, 1, 23, 59, 59))).toBe('2026-06-01')
  })

  it('formatea correctamente el ultimo dia del anio', () => {
    expect(toCivilDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('fromCivilDate', () => {
  it('construye la fecha en horario local', () => {
    const fecha = fromCivilDate('2026-09-24')
    expect(fecha.getFullYear()).toBe(2026)
    expect(fecha.getMonth()).toBe(8)
    expect(fecha.getDate()).toBe(24)
  })

  it('deja la hora en la medianoche local', () => {
    const fecha = fromCivilDate('2026-09-24')
    expect(fecha.getHours()).toBe(0)
    expect(fecha.getMinutes()).toBe(0)
  })

  it('no desplaza el dia al reconstruir', () => {
    expect(toCivilDate(fromCivilDate('2026-09-24'))).toBe('2026-09-24')
  })

  it('conserva el primer dia del anio', () => {
    expect(toCivilDate(fromCivilDate('2026-01-01'))).toBe('2026-01-01')
  })

  it('conserva el ultimo dia del anio', () => {
    expect(toCivilDate(fromCivilDate('2026-12-31'))).toBe('2026-12-31')
  })
})
