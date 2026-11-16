import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { API_BASE_URL } from '@/config/env'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'
import {
  conCuerpo,
  crearBorrador,
  datosDeBorrador,
  pedirError,
  pedirTransaccion,
} from '@/mocks/pruebas'

const registroSchema = z.object({
  clase: z.literal('registro'),
  titulo: z.string(),
  observacion: z.string(),
  autor: z.string(),
})

async function pedirHistorial(id: number) {
  const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${id}/historial`)
  const cuerpo = historialResponseSchema.parse(await respuesta.json())
  return { respuesta, cuerpo }
}

describe('Bitacora', () => {
  it('anota la transicion con su observacion y la firma del usuario en sesion', async () => {
    await pedirTransaccion(
      '/api/solicitudes/109/completar',
      conCuerpo('POST', { observacion: 'Recepcion verificada' }),
    )

    const { cuerpo } = await pedirHistorial(2)
    const registro = registroSchema.parse(cuerpo.eventos[cuerpo.eventos.length - 1])

    expect(registro.titulo).toBe('Solicitud 109: completada')
    expect(registro.observacion).toBe('Recepcion verificada')
    expect(registro.autor).toBe('Ana Rojas')
  })

  it('exige observacion al rechazar', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/facturas/401/rechazar', { method: 'POST' })

    expect(respuesta.status).toBe(400)
    expect(cuerpo.field).toBe('observacion')
  })

  it('exige observacion al cancelar una orden', async () => {
    const { respuesta } = await pedirError('/api/ordenes-de-compra/204/cancelar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(400)
  })

  it('no anota cuando la transicion es rechazada por invariante', async () => {
    const antes = await pedirHistorial(1)

    await pedirError(
      '/api/solicitudes/101/rechazar',
      conCuerpo('POST', { observacion: 'Sin efecto' }),
    )

    const despues = await pedirHistorial(1)

    expect(despues.cuerpo.eventos).toHaveLength(antes.cuerpo.eventos.length)
  })

  it('una transaccion creada obtiene historial al confirmarse', async () => {
    await crearBorrador(datosDeBorrador())

    const alCrear = await pedirHistorial(11)

    expect(alCrear.cuerpo.eventos).toHaveLength(1)

    await pedirTransaccion('/api/transacciones/11/confirmar', { method: 'POST' })

    const { respuesta, cuerpo } = await pedirHistorial(11)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.eventos).toHaveLength(2)
  })
})
