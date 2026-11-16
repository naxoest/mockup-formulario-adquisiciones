import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { API_BASE_URL } from '@/config/env'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'
import { conCuerpo, pedirSinCuerpo, pedirTransaccion } from '@/mocks/pruebas'

const registroSchema = z.object({
  clase: z.literal('registro'),
  titulo: z.string(),
  observacion: z.string(),
})

async function ultimoRegistro(transaccionId: number) {
  const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${transaccionId}/historial`)
  const cuerpo = historialResponseSchema.parse(await respuesta.json())
  return registroSchema.parse(cuerpo.eventos[cuerpo.eventos.length - 1])
}

describe('Anotacion de operaciones de escritura', () => {
  it('anota la edicion de la transaccion con su observacion', async () => {
    await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { fecha: '2026-09-02', observacion: 'Correccion de fecha' }),
    )

    const registro = await ultimoRegistro(1)

    expect(registro.titulo).toBe('Datos de la transacción modificados')
    expect(registro.observacion).toBe('Correccion de fecha')
  })

  it('anota la creacion de una solicitud', async () => {
    await pedirTransaccion(
      '/api/transacciones/2/solicitudes',
      conCuerpo('POST', { unidadId: 1, tipoSolicitud: 'SABIENES' }),
    )

    const registro = await ultimoRegistro(2)

    expect(registro.titulo).toBe('Solicitud 126 agregada')
  })

  it('anota la eliminacion de una solicitud', async () => {
    const creada = await pedirTransaccion(
      '/api/transacciones/2/solicitudes',
      conCuerpo('POST', { unidadId: 1, tipoSolicitud: 'SABIENES' }),
    )

    expect(creada.respuesta.status).toBe(201)

    const eliminada = await pedirSinCuerpo('/api/solicitudes/126', { method: 'DELETE' })

    expect(eliminada.status).toBe(204)

    const registro = await ultimoRegistro(2)

    expect(registro.titulo).toBe('Solicitud 126 eliminada')
  })

  it('anota el reemplazo de montos de una orden', async () => {
    await pedirTransaccion(
      '/api/ordenes-de-compra/203/montos',
      conCuerpo('PUT', {
        montos: [{ solicitudId: 110, anio: 2026, monto: 100000 }],
        observacion: 'Ajuste de reparto',
      }),
    )

    const registro = await ultimoRegistro(2)

    expect(registro.titulo).toBe('Montos de la orden OC 5423-31-TEST reemplazados')
    expect(registro.observacion).toBe('Ajuste de reparto')
  })

  it('anota el renombre de una orden conservando el codigo anterior', async () => {
    await pedirTransaccion(
      '/api/ordenes-de-compra/203',
      conCuerpo('PATCH', { codigo: 'OC 5423-31-NUEVO' }),
    )

    const registro = await ultimoRegistro(2)

    expect(registro.titulo).toBe('Orden OC 5423-31-TEST renombrada a OC 5423-31-NUEVO')
  })

  it('anota el cambio de fecha de emision de una orden sin renombrarla', async () => {
    await pedirTransaccion(
      '/api/ordenes-de-compra/203',
      conCuerpo('PATCH', { codigo: 'OC 5423-31-TEST', fechaEmision: '2026-03-27' }),
    )

    const registro = await ultimoRegistro(2)

    expect(registro.titulo).toBe('Fecha de emisión de la orden OC 5423-31-TEST modificada')
  })

  it('anota el registro de una factura', async () => {
    await pedirTransaccion(
      '/api/transacciones/1/facturas',
      conCuerpo('POST', {
        folio: 91000,
        fechaEmision: '2026-09-01',
        montos: [{ montoOrdenCompraId: 301, monto: 100000 }],
      }),
    )

    const registro = await ultimoRegistro(1)

    expect(registro.titulo).toBe('Factura 91000 registrada')
  })
})
