import { describe, expect, it } from 'vitest'
import {
  calcularMontoCotizacion,
  calcularMontoOrdenDeCompra,
  precompromisosCompletos,
  sumarPrecompromisos,
} from './montos'

describe('precompromisosCompletos', () => {
  it('descarta las filas sin anio o sin monto y ordena por anio', () => {
    expect(
      precompromisosCompletos([
        { anio: '2027', monto: 200 },
        { anio: null, monto: 300 },
        { anio: '2026', monto: null },
        { anio: '', monto: 400 },
        { anio: '2025', monto: 100 },
      ]),
    ).toEqual([
      { anio: '2025', monto: 100 },
      { anio: '2027', monto: 200 },
    ])
  })
})

describe('sumarPrecompromisos', () => {
  it('devuelve null cuando no hay filas completas', () => {
    expect(sumarPrecompromisos([])).toBeNull()
    expect(sumarPrecompromisos(undefined)).toBeNull()
    expect(sumarPrecompromisos([{ anio: null, monto: 500 }])).toBeNull()
  })

  it('cuenta un monto cero como cotizado', () => {
    expect(sumarPrecompromisos([{ anio: '2026', monto: 0 }])).toBe(0)
  })

  it('suma los montos de las filas completas', () => {
    expect(
      sumarPrecompromisos([
        { anio: '2026', monto: 1000 },
        { anio: '2027', monto: 2500 },
        { anio: null, monto: 9000 },
      ]),
    ).toBe(3500)
  })
})

describe('calcularMontoCotizacion', () => {
  it('devuelve cero cuando no hay solicitantes', () => {
    expect(calcularMontoCotizacion([])).toBe(0)
  })

  it('devuelve cero cuando la lista es indefinida', () => {
    expect(calcularMontoCotizacion(undefined)).toBe(0)
  })

  it('suma los precompromisos de todos los solicitantes', () => {
    expect(
      calcularMontoCotizacion([
        { precompromisos: [{ anio: '2026', monto: 1000 }] },
        { precompromisos: [] },
        {},
        {
          precompromisos: [
            { anio: '2026', monto: 500 },
            { anio: '2027', monto: 700 },
          ],
        },
      ]),
    ).toBe(2200)
  })
})

describe('calcularMontoOrdenDeCompra', () => {
  it('devuelve cero cuando no hay solicitantes', () => {
    expect(calcularMontoOrdenDeCompra([])).toBe(0)
  })

  it('devuelve cero cuando la lista es indefinida', () => {
    expect(calcularMontoOrdenDeCompra(undefined)).toBe(0)
  })

  it('suma los montos de todos los anios de todos los solicitantes de la orden', () => {
    expect(
      calcularMontoOrdenDeCompra([
        { montos: [{ monto: 1000 }, { monto: 500 }] },
        { montos: [{ monto: 2500 }] },
      ]),
    ).toBe(4000)
  })

  it('ignora los valores nulos e indefinidos', () => {
    expect(
      calcularMontoOrdenDeCompra([
        { montos: [{ monto: 1000 }, { monto: null }] },
        { montos: [{ monto: undefined }, { monto: 500 }] },
      ]),
    ).toBe(1500)
  })

  it('trata un solicitante sin montos como cero', () => {
    expect(calcularMontoOrdenDeCompra([{}, { montos: [{ monto: 700 }] }])).toBe(700)
  })
})
