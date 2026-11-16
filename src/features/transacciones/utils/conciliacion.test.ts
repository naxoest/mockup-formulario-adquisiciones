import { describe, expect, it } from 'vitest'
import { conciliarMontos, proporcionesDeBarra, totalDeSolicitud } from './conciliacion'

const solicitante = (claveFormulario: string, precompromisos: Array<[string, number]> = []) => ({
  claveFormulario,
  precompromisos: precompromisos.map(([anio, monto]) => ({ anio, monto })),
})

const orden = (lineas: Array<[string, Array<[string | null, number | null]>]>) => ({
  solicitantes: lineas.map(([claveFormulario, montos]) => ({
    claveFormulario,
    montos: montos.map(([anio, monto]) => ({ anio, monto })),
  })),
})

describe('conciliarMontos', () => {
  it('devuelve totales en cero sin datos', () => {
    const resultado = conciliarMontos([], [])

    expect(resultado.porSolicitud).toEqual([])
    expect(resultado.precomprometidoTotal).toBe(0)
    expect(resultado.comprometidoTotal).toBe(0)
    expect(resultado.diferenciaTotal).toBe(0)
    expect(resultado.comprometidoSinSolicitud).toBe(0)
  })

  it('tolera undefined y null en ambos argumentos', () => {
    expect(conciliarMontos(undefined, undefined).comprometidoTotal).toBe(0)
    expect(conciliarMontos(null, null).porSolicitud).toEqual([])
  })

  it('concilia cada anio de la solicitud contra su precompromiso', () => {
    const resultado = conciliarMontos(
      [
        solicitante('a', [
          ['2026', 1000000],
          ['2027', 500000],
        ]),
      ],
      [
        orden([
          [
            'a',
            [
              ['2026', 1200000],
              ['2027', 500000],
            ],
          ],
        ]),
      ],
    )

    expect(resultado.porSolicitud[0].anios).toEqual([
      {
        anio: '2026',
        precomprometido: 1000000,
        comprometido: 1200000,
        diferencia: 200000,
        estado: 'sobreCotizacion',
        aportes: [{ indiceOrden: 0, monto: 1200000 }],
      },
      {
        anio: '2027',
        precomprometido: 500000,
        comprometido: 500000,
        diferencia: 0,
        estado: 'ajustado',
        aportes: [{ indiceOrden: 0, monto: 500000 }],
      },
    ])
    expect(resultado.precomprometidoTotal).toBe(1500000)
    expect(resultado.comprometidoTotal).toBe(1700000)
    expect(resultado.diferenciaTotal).toBe(200000)
  })

  it('informa sin cotizacion el anio comprometido que no tiene precompromiso', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 1000000]])],
      [orden([['a', [['2027', 300000]]]])],
    )

    expect(resultado.porSolicitud[0].anios.map((anual) => [anual.anio, anual.estado])).toEqual([
      ['2026', 'sinComprometer'],
      ['2027', 'sinCotizacion'],
    ])
    expect(resultado.porSolicitud[0].anios[1].precomprometido).toBeNull()
    expect(resultado.porSolicitud[0].anios[1].diferencia).toBeNull()
  })

  it('marca sinDatos la solicitud sin precompromisos ni compromisos', () => {
    const resultado = conciliarMontos([solicitante('a')], [])

    expect(resultado.porSolicitud[0].anios).toEqual([
      {
        anio: null,
        precomprometido: null,
        comprometido: 0,
        diferencia: null,
        estado: 'sinDatos',
        aportes: [],
      },
    ])
  })

  it('agrega en el anio el comprometido repartido en varias ordenes', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 4500000]])],
      [orden([['a', [['2026', 2000000]]]]), orden([['a', [['2026', 2500000]]]])],
    )

    expect(resultado.porSolicitud[0].anios[0].comprometido).toBe(4500000)
    expect(resultado.porSolicitud[0].anios[0].estado).toBe('ajustado')
    expect(resultado.porSolicitud[0].anios[0].aportes).toEqual([
      { indiceOrden: 0, monto: 2000000 },
      { indiceOrden: 1, monto: 2500000 },
    ])
    expect(resultado.precomprometidoTotal).toBe(4500000)
  })

  it('marca bajoCotizacion cuando lo comprometido del anio es menor', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 3200000]])],
      [orden([['a', [['2026', 2800000]]]])],
    )

    expect(resultado.porSolicitud[0].anios[0].estado).toBe('bajoCotizacion')
    expect(resultado.porSolicitud[0].anios[0].diferencia).toBe(-400000)
  })

  it('distingue el precompromiso cero de su ausencia', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 0]])],
      [orden([['a', [['2026', 750000]]]])],
    )

    expect(resultado.porSolicitud[0].anios[0].precomprometido).toBe(0)
    expect(resultado.porSolicitud[0].anios[0].estado).toBe('sobreCotizacion')
    expect(resultado.porSolicitud[0].anios[0].diferencia).toBe(750000)
  })

  it('separa el comprometido de lineas sin solicitud y lo suma al total', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 1000000]])],
      [
        orden([
          ['a', [['2026', 1000000]]],
          ['eliminada', [['2026', 320000]]],
        ]),
      ],
    )

    expect(resultado.comprometidoSinSolicitud).toBe(320000)
    expect(resultado.comprometidoTotal).toBe(1320000)
    expect(resultado.diferenciaTotal).toBe(320000)
    expect(resultado.porSolicitud).toHaveLength(1)
  })

  it('no concilia los montos sin anio y trata los montos ausentes como cero', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 1000000]])],
      [
        orden([
          [
            'a',
            [
              [null, 500000],
              ['2026', null],
            ],
          ],
        ]),
      ],
    )

    expect(resultado.porSolicitud[0].anios).toHaveLength(1)
    expect(resultado.porSolicitud[0].anios[0].comprometido).toBe(0)
    expect(resultado.porSolicitud[0].anios[0].estado).toBe('sinComprometer')
    expect(resultado.comprometidoTotal).toBe(0)
  })

  it('tolera una orden sin arreglo de solicitantes', () => {
    const resultado = conciliarMontos(
      [solicitante('a', [['2026', 1000000]])],
      [{ solicitantes: null }, {}],
    )

    expect(resultado.comprometidoTotal).toBe(0)
    expect(resultado.porSolicitud[0].anios[0].estado).toBe('sinComprometer')
  })

  it('conserva el orden de las solicitudes, una entrada por clave y los anios ordenados', () => {
    const resultado = conciliarMontos(
      [
        solicitante('a', [
          ['2027', 100],
          ['2026', 50],
        ]),
        solicitante('b', [['2026', 200]]),
        solicitante('a', [['2026', 999]]),
      ],
      [],
    )

    expect(resultado.porSolicitud.map((item) => item.claveFormulario)).toEqual(['a', 'b'])
    expect(resultado.porSolicitud[0].anios.map((anual) => anual.anio)).toEqual(['2026', '2027'])
    expect(resultado.precomprometidoTotal).toBe(350)
  })
})

describe('proporcionesDeBarra', () => {
  it('devuelve cero sin cotizacion de referencia', () => {
    expect(proporcionesDeBarra(null, 750000)).toEqual({
      otrasOrdenes: 0,
      estaOrden: 0,
      exceso: 0,
    })
  })

  it('devuelve cero cuando ambos valores son cero', () => {
    expect(proporcionesDeBarra(0, 0)).toEqual({ otrasOrdenes: 0, estaOrden: 0, exceso: 0 })
  })

  it('sin aporte deja todo el tramo interior en un solo segmento', () => {
    expect(proporcionesDeBarra(3200000, 2800000)).toEqual({
      otrasOrdenes: 0,
      estaOrden: 87.5,
      exceso: 0,
    })
  })

  it('llena la barra completa cuando coinciden', () => {
    expect(proporcionesDeBarra(4500000, 4500000)).toEqual({
      otrasOrdenes: 0,
      estaOrden: 100,
      exceso: 0,
    })
  })

  it('escala sobre lo comprometido cuando hay exceso y las partes suman cien', () => {
    const resultado = proporcionesDeBarra(1800000, 2100000)

    expect(resultado.estaOrden).toBeCloseTo(85.714, 3)
    expect(resultado.exceso).toBeCloseTo(14.286, 3)
    expect(resultado.otrasOrdenes + resultado.estaOrden + resultado.exceso).toBeCloseTo(100, 6)
  })

  it('deja la barra vacia cuando no hay comprometido', () => {
    expect(proporcionesDeBarra(2000000, 0)).toEqual({
      otrasOrdenes: 0,
      estaOrden: 0,
      exceso: 0,
    })
  })

  it('marca todo como exceso cuando la cotizacion es cero', () => {
    expect(proporcionesDeBarra(0, 750000)).toEqual({
      otrasOrdenes: 0,
      estaOrden: 0,
      exceso: 100,
    })
  })

  it('separa el aporte de esta orden del de las otras', () => {
    const resultado = proporcionesDeBarra(4500000, 4500000, 2500000)

    expect(resultado.otrasOrdenes).toBeCloseTo(44.444, 3)
    expect(resultado.estaOrden).toBeCloseTo(55.556, 3)
    expect(resultado.exceso).toBe(0)
  })

  it('dibuja el exceso sin atribuirlo a ningun segmento', () => {
    const resultado = proporcionesDeBarra(1800000, 2100000, 600000)

    expect(resultado.otrasOrdenes).toBeCloseTo(71.429, 3)
    expect(resultado.estaOrden).toBeCloseTo(14.286, 3)
    expect(resultado.exceso).toBeCloseTo(14.286, 3)
    expect(resultado.otrasOrdenes + resultado.estaOrden + resultado.exceso).toBeCloseTo(100, 6)
  })

  it('deja esta orden sin tramo interior cuando las otras ya agotaron la cotizacion', () => {
    const resultado = proporcionesDeBarra(1000000, 1800000, 300000)

    expect(resultado.otrasOrdenes).toBeCloseTo(55.556, 3)
    expect(resultado.estaOrden).toBe(0)
    expect(resultado.exceso).toBeCloseTo(44.444, 3)
  })

  it('con aporte cero atribuye todo el tramo interior a las otras ordenes', () => {
    const resultado = proporcionesDeBarra(2000000, 1500000, 0)

    expect(resultado.otrasOrdenes).toBe(75)
    expect(resultado.estaOrden).toBe(0)
  })

  it('acota un aporte mayor que lo comprometido', () => {
    const resultado = proporcionesDeBarra(2000000, 1000000, 5000000)

    expect(resultado.otrasOrdenes).toBe(0)
    expect(resultado.estaOrden).toBe(50)
  })
})

describe('totalDeSolicitud', () => {
  it('suma los anios de la solicitud y concilia el total', () => {
    const { porSolicitud } = conciliarMontos(
      [
        solicitante('a', [
          ['2026', 4000000],
          ['2027', 2000000],
        ]),
      ],
      [orden([['a', [['2026', 6000000]]]])],
    )

    expect(totalDeSolicitud(porSolicitud[0])).toEqual({
      precomprometido: 6000000,
      comprometido: 6000000,
      diferencia: 0,
      estado: 'ajustado',
    })
  })

  it('incluye en el comprometido los anios sin precompromiso', () => {
    const { porSolicitud } = conciliarMontos(
      [solicitante('a', [['2026', 1000000]])],
      [
        orden([
          [
            'a',
            [
              ['2026', 1000000],
              ['2027', 300000],
            ],
          ],
        ]),
      ],
    )

    expect(totalDeSolicitud(porSolicitud[0])).toEqual({
      precomprometido: 1000000,
      comprometido: 1300000,
      diferencia: 300000,
      estado: 'sobreCotizacion',
    })
  })

  it('informa sin cotizacion cuando ningun anio tiene precompromiso', () => {
    const { porSolicitud } = conciliarMontos(
      [solicitante('a')],
      [orden([['a', [['2026', 500000]]]])],
    )

    expect(totalDeSolicitud(porSolicitud[0])).toEqual({
      precomprometido: null,
      comprometido: 500000,
      diferencia: null,
      estado: 'sinCotizacion',
    })
  })

  it('informa sin datos la solicitud sin precompromisos ni montos', () => {
    const { porSolicitud } = conciliarMontos([solicitante('a')], [])

    expect(totalDeSolicitud(porSolicitud[0])).toEqual({
      precomprometido: null,
      comprometido: 0,
      diferencia: null,
      estado: 'sinDatos',
    })
  })
})
