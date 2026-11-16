import { describe, expect, it } from 'vitest'
import { conCuerpo, pedirError, pedirTransaccion } from '@/mocks/pruebas'

describe('POST /transacciones/:id/ordenes-de-compra', () => {
  it('crea la orden en enviada_a_proveedor con su fecha de emision y actualiza el comprometido', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [
          { solicitudId: 115, anio: 2026, monto: 1200000 },
          { solicitudId: 116, anio: 2026, monto: 1300000 },
        ],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(cuerpo.ordenesDeCompra).toHaveLength(1)
    expect(cuerpo.ordenesDeCompra[0].id).toBe(208)
    expect(cuerpo.ordenesDeCompra[0].estado).toBe('enviada_a_proveedor')
    expect(cuerpo.ordenesDeCompra[0].fechaEmision).toBe('2026-05-20')
    expect(cuerpo.ordenesDeCompra[0].monto).toBe(2500000)
    expect(cuerpo.montoComprometido).toBe(2500000)
    expect(cuerpo.estado).toBe('cotizada')
  })

  it('responde 400 si falta la fecha de emision', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        montos: [{ solicitudId: 115, anio: 2026, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('cuerpo_invalido')
    expect(cuerpo.field).toBe('fechaEmision')
  })

  it('responde 400 si la fecha de emision es posterior a hoy', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2999-01-01',
        montos: [{ solicitudId: 115, anio: 2026, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('fecha_futura')
    expect(cuerpo.field).toBe('fechaEmision')
  })

  it('responde 409 si la solicitud es de otra transaccion', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [{ solicitudId: 101, anio: 2026, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('solicitud_ajena')
    expect(cuerpo.field).toBe('montos.0.solicitudId')
  })

  it('responde 409 si la solicitud esta rechazada', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/7/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-06-20',
        montos: [{ solicitudId: 119, anio: 2026, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('solicitud_rechazada')
  })

  it('responde 400 si el anio no existe en el catalogo de periodos', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [{ solicitudId: 115, anio: 2030, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('periodo_inexistente')
    expect(cuerpo.field).toBe('montos.0.anio')
  })

  it('acepta la misma solicitud con montos de distintos anios, aunque no tengan precompromiso', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [
          { solicitudId: 115, anio: 2026, monto: 1000 },
          { solicitudId: 115, anio: 2027, monto: 2000 },
        ],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(
      cuerpo.ordenesDeCompra[0].montos.map((monto) => [monto.solicitudId, monto.anio, monto.monto]),
    ).toEqual([
      [115, 2026, 1000],
      [115, 2027, 2000],
    ])
    expect(cuerpo.ordenesDeCompra[0].monto).toBe(3000)
  })

  it('responde 409 si la misma solicitud repite un anio', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [
          { solicitudId: 115, anio: 2026, monto: 1000 },
          { solicitudId: 115, anio: 2026, monto: 2000 },
        ],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('anio_duplicado')
    expect(cuerpo.field).toBe('montos.1.anio')
  })

  it('responde 409 si el codigo ya existe en la transaccion', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/2/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5423-31-AG26',
        fechaEmision: '2026-03-28',
        montos: [{ solicitudId: 110, anio: 2026, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('codigo_duplicado')
  })

  it('responde 400 si el monto no es positivo', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/5/ordenes-de-compra',
      conCuerpo('POST', {
        codigo: 'OC 5413-99-AG26',
        fechaEmision: '2026-05-20',
        montos: [{ solicitudId: 115, anio: 2026, monto: 0 }],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('cuerpo_invalido')
  })
})

describe('PATCH /ordenes-de-compra/:id', () => {
  it('modifica la fecha de emision sin cambiar el codigo', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/ordenes-de-compra/204',
      conCuerpo('PATCH', { codigo: 'OC 5413-88-CM26', fechaEmision: '2026-04-22' }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.ordenesDeCompra[0].codigo).toBe('OC 5413-88-CM26')
    expect(cuerpo.ordenesDeCompra[0].fechaEmision).toBe('2026-04-22')
  })
})

describe('PUT /ordenes-de-compra/:id/montos', () => {
  it('reemplaza el conjunto completo con identificadores nuevos', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/ordenes-de-compra/204/montos',
      conCuerpo('PUT', { montos: [{ solicitudId: 111, anio: 2026, monto: 900000 }] }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.ordenesDeCompra[0].montos).toHaveLength(1)
    expect(cuerpo.ordenesDeCompra[0].montos[0].id).toBe(323)
    expect(cuerpo.ordenesDeCompra[0].montos[0].anio).toBe(2026)
    expect(cuerpo.ordenesDeCompra[0].monto).toBe(900000)
  })

  it('responde 409 si la orden tiene montos facturados', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/ordenes-de-compra/202/montos',
      conCuerpo('PUT', { montos: [{ solicitudId: 109, anio: 2026, monto: 100000 }] }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('orden_con_facturas')
  })
})

describe('Transiciones de orden de compra', () => {
  it('avanza de enviada_a_proveedor a aceptada', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion('/api/ordenes-de-compra/204/aceptar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(200)
    expect(cuerpo.ordenesDeCompra[0].estado).toBe('aceptada')
  })

  it('responde 409 ante una transicion que salta un estado', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/ordenes-de-compra/204/recepcionar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transicion_ilegal')
  })

  it('cancelar excluye la orden del monto comprometido', async () => {
    const { cuerpo } = await pedirTransaccion(
      '/api/ordenes-de-compra/204/cancelar',
      conCuerpo('POST', { observacion: 'Proveedor sin stock' }),
    )

    expect(cuerpo.ordenesDeCompra[0].estado).toBe('cancelada')
    expect(cuerpo.montoComprometido).toBe(0)
  })

  it('responde 409 al cancelar una orden en recepcion conforme', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/ordenes-de-compra/205/cancelar',
      conCuerpo('POST', { observacion: 'Intento invalido' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transicion_ilegal')
  })
})

describe('DELETE /ordenes-de-compra/:id', () => {
  it('responde 409 si la transaccion ya fue confirmada', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/ordenes-de-compra/204', {
      method: 'DELETE',
    })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transaccion_confirmada')
  })

  it('responde 404 si la orden no existe', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/ordenes-de-compra/999999', {
      method: 'DELETE',
    })

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('orden_inexistente')
  })
})
