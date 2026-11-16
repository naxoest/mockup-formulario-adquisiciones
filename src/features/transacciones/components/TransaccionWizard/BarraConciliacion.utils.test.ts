import { describe, expect, it } from 'vitest'
import type { ConciliacionAnual, ConciliacionSolicitud } from '../../utils/conciliacion'
import {
  aporteDeOrden,
  avisosPorAnio,
  resumenDeConciliacion,
  resumenTotal,
  textoAnios,
  textoOtrasOrdenes,
} from './BarraConciliacion.utils'

const fila = (parcial: Partial<ConciliacionAnual>): ConciliacionAnual => ({
  anio: '2026',
  precomprometido: 1000000,
  comprometido: 1000000,
  diferencia: 0,
  estado: 'ajustado',
  aportes: [],
  ...parcial,
})

describe('resumenDeConciliacion', () => {
  it('rotula el caso ajustado sin signo', () => {
    const resumen = resumenDeConciliacion(fila({}))

    expect(resumen.etiqueta).toBe('Ajustado')
    expect(resumen.valor).toContain('0')
    expect(resumen.valor).not.toContain('-')
    expect(resumen.comprometido).toContain('1.000.000')
    expect(resumen.cotizado).toContain('1.000.000')
  })

  it('expresa el faltante en valor absoluto', () => {
    const resumen = resumenDeConciliacion(
      fila({
        estado: 'bajoCotizacion',
        precomprometido: 3200000,
        comprometido: 2800000,
        diferencia: -400000,
      }),
    )

    expect(resumen.etiqueta).toBe('Por comprometer')
    expect(resumen.valor).toContain('400.000')
    expect(resumen.valor).not.toContain('-')
  })

  it('expresa el exceso sin signo', () => {
    const resumen = resumenDeConciliacion(
      fila({
        estado: 'sobreCotizacion',
        precomprometido: 2000000,
        comprometido: 2100000,
        diferencia: 100000,
      }),
    )

    expect(resumen.etiqueta).toBe('Excedido')
    expect(resumen.valor).toContain('100.000')
  })

  it('mantiene el cotizado visible cuando no hay comprometido', () => {
    const resumen = resumenDeConciliacion(
      fila({
        estado: 'sinComprometer',
        precomprometido: 1500000,
        comprometido: 0,
        diferencia: -1500000,
      }),
    )

    expect(resumen.etiqueta).toBe('Sin comprometer')
    expect(resumen.valor).toBe('—')
    expect(resumen.cotizado).toContain('1.500.000')
    expect(resumen.comprometido).toContain('0')
  })

  it('oculta el cotizado cuando la cotizacion no existe', () => {
    const resumen = resumenDeConciliacion(
      fila({
        estado: 'sinCotizacion',
        precomprometido: null,
        comprometido: 750000,
        diferencia: null,
      }),
    )

    expect(resumen.etiqueta).toBe('Sin cotización')
    expect(resumen.cotizado).toBeNull()
    expect(resumen.comprometido).toContain('750.000')
    expect(resumen.valor).toBe('—')
  })

  it('rotula la ausencia total de datos', () => {
    const resumen = resumenDeConciliacion(
      fila({ estado: 'sinDatos', precomprometido: null, comprometido: 0, diferencia: null }),
    )

    expect(resumen.etiqueta).toBe('Sin datos')
    expect(resumen.cotizado).toBeNull()
  })
})

describe('resumenTotal', () => {
  it('usa etiqueta neutra cuando no hay nada registrado', () => {
    expect(resumenTotal(0, 0).etiqueta).toBe('Diferencia')
  })

  it('rotula el faltante global sin signo', () => {
    const resumen = resumenTotal(13000000, 9400000)

    expect(resumen.etiqueta).toBe('Por comprometer')
    expect(resumen.valor).toContain('3.600.000')
    expect(resumen.valor).not.toContain('-')
  })

  it('rotula el exceso global', () => {
    const resumen = resumenTotal(1000000, 1300000)

    expect(resumen.etiqueta).toBe('Excedido')
    expect(resumen.valor).toContain('300.000')
  })

  it('rotula la coincidencia exacta', () => {
    expect(resumenTotal(5000000, 5000000).etiqueta).toBe('Ajustado')
  })
})

describe('aporteDeOrden', () => {
  it('devuelve el monto de la orden indicada', () => {
    const dato = fila({
      aportes: [
        { indiceOrden: 0, monto: 2000000 },
        { indiceOrden: 1, monto: 2500000 },
      ],
    })

    expect(aporteDeOrden(dato, 1)).toBe(2500000)
  })

  it('devuelve cero cuando la orden no aporta', () => {
    expect(aporteDeOrden(fila({ aportes: [] }), 0)).toBe(0)
  })
})

describe('textoOtrasOrdenes', () => {
  it('devuelve null cuando la solicitud solo participa en esta orden', () => {
    expect(textoOtrasOrdenes(fila({ aportes: [{ indiceOrden: 0, monto: 1000000 }] }), 0)).toBeNull()
  })

  it('usa singular con una sola orden adicional', () => {
    const texto = textoOtrasOrdenes(
      fila({
        aportes: [
          { indiceOrden: 0, monto: 2000000 },
          { indiceOrden: 1, monto: 2500000 },
        ],
      }),
      1,
    )

    expect(texto).toContain('2.000.000')
    expect(texto).toContain('otra orden')
  })

  it('usa plural con varias ordenes adicionales', () => {
    const texto = textoOtrasOrdenes(
      fila({
        aportes: [
          { indiceOrden: 0, monto: 1000000 },
          { indiceOrden: 1, monto: 500000 },
          { indiceOrden: 2, monto: 700000 },
        ],
      }),
      2,
    )

    expect(texto).toContain('1.500.000')
    expect(texto).toContain('2 órdenes')
  })

  it('devuelve null cuando las otras ordenes no tienen monto', () => {
    expect(
      textoOtrasOrdenes(
        fila({
          aportes: [
            { indiceOrden: 0, monto: 0 },
            { indiceOrden: 1, monto: 1000000 },
          ],
        }),
        1,
      ),
    ).toBeNull()
  })
})

const solicitudCon = (...anios: ConciliacionAnual[]): ConciliacionSolicitud => ({
  claveFormulario: 'a',
  anios,
})

describe('textoAnios', () => {
  it('usa singular con un solo anio', () => {
    expect(textoAnios(solicitudCon(fila({})))).toBe('Año 2026')
  })

  it('lista los anios de la solicitud en plural', () => {
    expect(textoAnios(solicitudCon(fila({}), fila({ anio: '2027' })))).toBe('Años 2026 · 2027')
  })

  it('devuelve null cuando la solicitud no tiene anios', () => {
    const sinDatos = fila({
      anio: null,
      estado: 'sinDatos',
      precomprometido: null,
      comprometido: 0,
      diferencia: null,
    })

    expect(textoAnios(solicitudCon(sinDatos))).toBeNull()
  })
})

describe('avisosPorAnio', () => {
  it('no informa avisos cuando la solicitud tiene un solo anio', () => {
    const excedido = fila({
      estado: 'sobreCotizacion',
      precomprometido: 1000000,
      comprometido: 1200000,
      diferencia: 200000,
    })

    expect(avisosPorAnio(solicitudCon(excedido))).toEqual([])
  })

  it('informa el anio que excede su cotizacion aunque el total quede ajustado', () => {
    const avisos = avisosPorAnio(
      solicitudCon(
        fila({
          estado: 'sobreCotizacion',
          precomprometido: 4000000,
          comprometido: 6000000,
          diferencia: 2000000,
        }),
        fila({
          anio: '2027',
          estado: 'sinComprometer',
          precomprometido: 2000000,
          comprometido: 0,
          diferencia: -2000000,
        }),
      ),
    )

    expect(avisos).toHaveLength(1)
    expect(avisos[0].anio).toBe('2026')
    expect(avisos[0].texto).toContain('excede su cotización')
    expect(avisos[0].texto).toContain('2.000.000')
    expect(avisos[0].clase).toBe('text-scarlet-700')
  })

  it('informa el anio comprometido sin cotizacion', () => {
    const avisos = avisosPorAnio(
      solicitudCon(
        fila({}),
        fila({
          anio: '2027',
          estado: 'sinCotizacion',
          precomprometido: null,
          comprometido: 300000,
          diferencia: null,
        }),
      ),
    )

    expect(avisos).toHaveLength(1)
    expect(avisos[0].anio).toBe('2027')
    expect(avisos[0].texto).toContain('300.000')
    expect(avisos[0].texto).toContain('sin cotización')
    expect(avisos[0].clase).toBe('text-saffron-700')
  })

  it('no informa avisos cuando ningun anio tiene cotizacion', () => {
    const sinCotizacion = (anio: string) =>
      fila({ anio, estado: 'sinCotizacion', precomprometido: null, diferencia: null })

    expect(avisosPorAnio(solicitudCon(sinCotizacion('2026'), sinCotizacion('2027')))).toEqual([])
  })
})
