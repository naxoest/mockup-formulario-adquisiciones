import { describe, expect, it } from 'vitest'
import { conCuerpo, pedirError, pedirTransaccion } from '@/mocks/pruebas'

describe('POST /transacciones/:id/facturas', () => {
  it('crea la factura en pendiente y actualiza el facturado', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 301, monto: 2100000 }],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(cuerpo.facturas).toHaveLength(1)
    expect(cuerpo.facturas[0].id).toBe(403)
    expect(cuerpo.facturas[0].estado).toBe('pendiente')
    expect(cuerpo.facturas[0].montos[0].id).toBe(504)
    expect(cuerpo.montoFacturado).toBe(2100000)
  })

  it('admite facturacion parcial de un monto de orden', async () => {
    const { cuerpo } = await pedirTransaccion(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 301, monto: 100000 }],
      }),
    )

    expect(cuerpo.montoFacturado).toBe(100000)
  })

  it('responde 409 si el monto de orden es de otra transaccion', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 308, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('monto_orden_ajeno')
    expect(cuerpo.field).toBe('montos.0.montoOrdenCompraId')
  })

  it('admite una factura que excede el monto de la orden', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 301, monto: 2100001 }],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(cuerpo.montoFacturado).toBe(2100001)
  })

  it('admite facturar un monto de orden ya facturado', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/2/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 308, monto: 1 }],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(cuerpo.montoFacturado).toBe(150001)
  })

  it('responde 409 si el folio ya existe en la transaccion', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/2/facturas',
      conCuerpo('POST', {
        folio: 88214,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 309, monto: 1000 }],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('folio_duplicado')
  })

  it('responde 409 si el mismo monto de orden aparece dos veces', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [
          { montoOrdenCompraId: 301, monto: 1000 },
          { montoOrdenCompraId: 301, monto: 2000 },
        ],
      }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('monto_orden_duplicado')
  })
})

describe('Transiciones de factura', () => {
  it('aceptar deja la factura aceptada', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion('/api/facturas/401/aceptar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(200)
    expect(cuerpo.facturas[0].estado).toBe('aceptada')
  })

  it('rechazar excluye la factura del monto facturado', async () => {
    const { cuerpo } = await pedirTransaccion(
      '/api/facturas/401/rechazar',
      conCuerpo('POST', { observacion: 'Folio erroneo' }),
    )

    expect(cuerpo.facturas[0].estado).toBe('rechazada')
    expect(cuerpo.montoFacturado).toBe(0)
  })

  it('rechazar excluye la factura al registrar otra por el mismo monto de orden', async () => {
    await pedirTransaccion(
      '/api/facturas/401/rechazar',
      conCuerpo('POST', { observacion: 'Folio erroneo' }),
    )

    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/2/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 308, monto: 150000 }],
      }),
    )

    expect(respuesta.status).toBe(201)
    expect(cuerpo.montoFacturado).toBe(150000)
  })

  it('responde 409 al aceptar una factura ya aceptada', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/facturas/402/aceptar', { method: 'POST' })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transicion_ilegal')
  })
})

describe('PATCH /facturas/:id', () => {
  it('responde 409 si la transaccion ya fue confirmada', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/facturas/401',
      conCuerpo('PATCH', { folio: 91500, fechaEmision: '2026-09-01' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transaccion_confirmada')
  })

  it('responde 404 si la factura no existe', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/facturas/999999',
      conCuerpo('PATCH', { folio: 91500, fechaEmision: '2026-09-01' }),
    )

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('factura_inexistente')
  })
})

describe('DELETE /facturas/:id', () => {
  it('responde 409 si la transaccion ya fue confirmada', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/facturas/401', { method: 'DELETE' })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transaccion_confirmada')
  })

  it('responde 404 si la factura no existe', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/facturas/999999', { method: 'DELETE' })

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('factura_inexistente')
  })
})
