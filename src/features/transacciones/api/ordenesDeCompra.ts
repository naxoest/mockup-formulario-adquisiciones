import { apiClient, apiClientNoContent } from '@/lib/apiClient'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import type {
  MontosOrdenDeCompraRequest,
  ObservacionOpcionalRequest,
  ObservacionRequeridaRequest,
  OrdenDeCompraCreacionRequest,
  OrdenDeCompraEdicionRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import { transaccionResponseSchema } from '@/features/transacciones/schemas/transaccionResponse.schema'

type VerboOrdenDeCompra = 'aceptar' | 'recepcionar' | 'cancelar'

async function transicionar(
  id: number,
  verbo: VerboOrdenDeCompra,
  datos: ObservacionOpcionalRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/ordenes-de-compra/${id}/${verbo}`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function crearOrdenDeCompra(
  transaccionId: number,
  datos: OrdenDeCompraCreacionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/ordenes-de-compra`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function editarOrdenDeCompra(
  id: number,
  datos: OrdenDeCompraEdicionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/ordenes-de-compra/${id}`, {
    method: 'PATCH',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function reemplazarMontosOrdenDeCompra(
  id: number,
  datos: MontosOrdenDeCompraRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/ordenes-de-compra/${id}/montos`, {
    method: 'PUT',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function eliminarOrdenDeCompra(id: number): Promise<void> {
  await apiClientNoContent(`/api/ordenes-de-compra/${id}`, { method: 'DELETE' })
}

export async function aceptarOrdenDeCompra(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'aceptar', datos)
}

export async function recepcionarOrdenDeCompra(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'recepcionar', datos)
}

export async function cancelarOrdenDeCompra(
  id: number,
  datos: ObservacionRequeridaRequest,
): Promise<Transaccion> {
  return transicionar(id, 'cancelar', datos)
}
