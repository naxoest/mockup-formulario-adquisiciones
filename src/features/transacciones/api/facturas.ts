import { apiClient, apiClientNoContent } from '@/lib/apiClient'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import type {
  FacturaCreacionRequest,
  FacturaEdicionRequest,
  ObservacionOpcionalRequest,
  ObservacionRequeridaRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import { transaccionResponseSchema } from '@/features/transacciones/schemas/transaccionResponse.schema'

type VerboFactura = 'aceptar' | 'rechazar'

async function transicionar(
  id: number,
  verbo: VerboFactura,
  datos: ObservacionOpcionalRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/facturas/${id}/${verbo}`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function crearFactura(
  transaccionId: number,
  datos: FacturaCreacionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/facturas`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function editarFactura(
  id: number,
  datos: FacturaEdicionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/facturas/${id}`, { method: 'PATCH', body: datos })
  return transaccionResponseSchema.parse(data)
}

export async function eliminarFactura(id: number): Promise<void> {
  await apiClientNoContent(`/api/facturas/${id}`, { method: 'DELETE' })
}

export async function aceptarFactura(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'aceptar', datos)
}

export async function rechazarFactura(
  id: number,
  datos: ObservacionRequeridaRequest,
): Promise<Transaccion> {
  return transicionar(id, 'rechazar', datos)
}
