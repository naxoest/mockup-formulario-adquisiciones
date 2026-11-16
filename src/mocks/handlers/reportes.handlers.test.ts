import { describe, expect, it } from 'vitest'
import {
  conCuerpo,
  pedirError,
  pedirPerfilUnidad,
  pedirRankingUnidades,
  pedirSinCuerpo,
} from '@/mocks/pruebas'

const RUTA = '/api/reportes/unidades'

describe('GET /reportes/unidades', () => {
  it('ordena todas las unidades por comprometido con los datos base', async () => {
    const { respuesta, cuerpo } = await pedirRankingUnidades(RUTA)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.totales.comprometido).toBe(54744726)
    expect(cuerpo.data.map((fila) => fila.unidad.id)).toEqual([3, 6, 7, 8, 9, 1, 4, 2, 5])
    expect(cuerpo.data.map((fila) => fila.posicion)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('limita el ranking y calcula la participacion sobre el total filtrado', async () => {
    const { cuerpo } = await pedirRankingUnidades(`${RUTA}?limite=4`)

    expect(cuerpo.data.map((fila) => fila.unidad.id)).toEqual([3, 6, 7, 8])
    expect(cuerpo.totales.comprometido).toBe(54744726)
    expect(cuerpo.data[0]?.participacion).toBeCloseTo((10000000 / 54744726) * 100, 6)
  })

  it('etiqueta el tipo, las sedes y las modalidades de la unidad', async () => {
    const { cuerpo } = await pedirRankingUnidades(`${RUTA}?limite=1`)
    const [fila] = cuerpo.data

    expect(fila?.unidad).toEqual({
      id: 3,
      nombre: 'Arquitectura',
      cr: 109,
      tipo: { value: 'carrera', label: 'Carrera' },
      sedes: [{ value: 'pto', label: 'Puerto Montt' }],
    })
    expect(fila?.modalidades).toEqual([{ value: 'publica', label: 'Licitación publica' }])
  })

  it('incluye una unidad si cualquiera de sus sedes coincide con el campus', async () => {
    const { cuerpo } = await pedirRankingUnidades(`${RUTA}?campus=pto`)

    expect(cuerpo.data.map((fila) => fila.unidad.id)).toEqual([3, 6, 1, 4])
    expect(cuerpo.totales.comprometido).toBe(28344726)
  })

  it('entrega un ranking vacio para un campus sin unidades', async () => {
    const { cuerpo } = await pedirRankingUnidades(`${RUTA}?campus=inexistente`)

    expect(cuerpo.data).toEqual([])
    expect(cuerpo.totales.comprometido).toBe(0)
  })

  it('filtra por el periodo de la transaccion', async () => {
    const { cuerpo } = await pedirRankingUnidades(`${RUTA}?desde=2026-07-01&hasta=2026-08-31`)

    expect(cuerpo.data.map((fila) => fila.unidad.id)).toEqual([8, 7, 9, 1])
    expect(cuerpo.totales.comprometido).toBe(20200000)
  })

  it('excluye del comprometido y de las validas una orden de compra cancelada', async () => {
    const inicial = await pedirRankingUnidades(RUTA)

    expect(inicial.cuerpo.data.find((fila) => fila.unidad.id === 1)?.ordenes).toEqual({
      validas: 4,
      total: 4,
    })

    const cancelacion = await pedirSinCuerpo(
      '/api/ordenes-de-compra/206/cancelar',
      conCuerpo('POST', { observacion: 'El proveedor desistió de la orden de compra' }),
    )

    expect(cancelacion.status).toBe(200)

    const { cuerpo } = await pedirRankingUnidades(RUTA)
    const camposClinicos = cuerpo.data.find((fila) => fila.unidad.id === 1)
    const serviciosGenerales = cuerpo.data.find((fila) => fila.unidad.id === 9)

    expect(cuerpo.totales.comprometido).toBe(46944726)
    expect(camposClinicos?.comprometido).toBe(2340000)
    expect(camposClinicos?.ordenes).toEqual({ validas: 3, total: 4 })
    expect(serviciosGenerales?.comprometido).toBe(3100000)
    expect(serviciosGenerales?.ordenes).toEqual({ validas: 2, total: 3 })
  })
})

describe('GET /reportes/unidades/:id', () => {
  it('entrega la unidad y sus indicadores', async () => {
    const { respuesta, cuerpo } = await pedirPerfilUnidad(`${RUTA}/1`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.unidad).toEqual({
      id: 1,
      nombre: 'Campos Clinicos',
      cr: 105,
      tipo: { value: 'carrera', label: 'Carrera' },
      sedes: [
        { value: 'osorno', label: 'Osorno' },
        { value: 'pto', label: 'Puerto Montt' },
      ],
    })
    expect(cuerpo.totales).toMatchObject({
      registros: 4,
      ocValidas: 4,
      ordenes: 4,
      comprometido: 6140000,
      comprometidoGlobal: 54744726,
      precomprometido: 7150000,
    })
    expect(cuerpo.totales.participacionGlobal).toBeCloseTo((6140000 / 54744726) * 100, 6)
  })

  it('distribuye el comprometido por modalidad', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/1`)

    expect(
      cuerpo.porModalidad.map((fila) => [fila.modalidad.value, fila.registros, fila.comprometido]),
    ).toEqual([
      ['privada', 3, 4040000],
      ['agil', 1, 2100000],
    ])
    expect(cuerpo.porModalidad[0]?.participacion).toBeCloseTo((4040000 / 6140000) * 100, 6)
  })

  it('entrega la evolucion mensual con los meses intermedios en cero', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/1`)

    expect(cuerpo.evolucion).toEqual([
      { mes: '2026-03', comprometido: 2340000, facturado: 150000 },
      { mes: '2026-04', comprometido: 0, facturado: 0 },
      { mes: '2026-05', comprometido: 0, facturado: 0 },
      { mes: '2026-06', comprometido: 0, facturado: 0 },
      { mes: '2026-07', comprometido: 3800000, facturado: 0 },
    ])
  })

  it('entrega el detalle por monto de orden de compra ordenado por fecha', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/1`)

    expect(cuerpo.detalle.map((registro) => registro.transaccionId)).toEqual([8, 2, 2, 1])
    expect(cuerpo.detalle.map((registro) => registro.ordenDeCompra.codigo)).toEqual([
      'OC 5413-44-LPR26',
      'OC 5423-31-AG26',
      'OC 5423-31-TEST',
      'OC 5413-52-SE26',
    ])
    expect(cuerpo.detalle[0]).toEqual({
      id: 315,
      transaccionId: 8,
      fecha: '2026-07-22',
      tipo: { value: 'SABIENES', label: 'SABIENES' },
      modalidad: { value: 'privada', label: 'Licitación privada' },
      ordenDeCompra: { id: 206, codigo: 'OC 5413-44-LPR26', estado: 'aceptada' },
      monto: 3800000,
      estadoSolicitud: { value: 'en_proceso', label: 'En proceso' },
      estadoEvaluacion: { value: 'evaluado', label: 'Evaluado' },
      observaciones: null,
    })
  })

  it('mantiene en el detalle la orden cancelada y la excluye de los montos', async () => {
    await pedirSinCuerpo(
      '/api/ordenes-de-compra/206/cancelar',
      conCuerpo('POST', { observacion: 'El proveedor desistió de la orden de compra' }),
    )

    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/1`)

    expect(cuerpo.totales).toMatchObject({
      registros: 4,
      ocValidas: 3,
      ordenes: 4,
      comprometido: 2340000,
      comprometidoGlobal: 46944726,
    })
    expect(cuerpo.detalle[0]?.ordenDeCompra.estado).toBe('cancelada')
    expect(cuerpo.porModalidad.map((fila) => [fila.modalidad.value, fila.comprometido])).toEqual([
      ['agil', 2100000],
      ['privada', 240000],
    ])
    expect(cuerpo.evolucion[cuerpo.evolucion.length - 1]).toEqual({
      mes: '2026-07',
      comprometido: 0,
      facturado: 0,
    })
  })

  it('entrega una unidad sin ordenes de compra con su precomprometido', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/10`)

    expect(cuerpo.totales).toMatchObject({
      registros: 0,
      ocValidas: 0,
      ordenes: 0,
      comprometido: 0,
      participacionGlobal: 0,
      precomprometido: 2519471,
    })
    expect(cuerpo.porModalidad).toEqual([])
    expect(cuerpo.evolucion).toEqual([])
    expect(cuerpo.detalle).toEqual([])
  })

  it('omite las transacciones no confirmadas', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/5`)

    expect(cuerpo.totales).toMatchObject({
      registros: 1,
      comprometido: 800000,
      precomprometido: 800000,
    })
  })

  it('agrupa en un registro los montos por anio de una solicitud en una misma orden', async () => {
    const { cuerpo } = await pedirPerfilUnidad(`${RUTA}/4`)

    expect(cuerpo.totales).toMatchObject({ registros: 2, comprometido: 3704726 })
    expect(cuerpo.detalle.map((registro) => [registro.id, registro.monto])).toEqual([
      [310, 204726],
      [302, 3500000],
    ])
  })

  it('responde 404 para una unidad inexistente', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/999`)

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('unidad_inexistente')
  })

  it('responde 404 para un identificador no numerico', async () => {
    const { respuesta } = await pedirError(`${RUTA}/abc`)

    expect(respuesta.status).toBe(404)
  })
})
