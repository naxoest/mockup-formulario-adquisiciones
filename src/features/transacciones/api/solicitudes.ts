import { apiClient, apiClientNoContent } from '@/lib/apiClient'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import type {
  ObservacionOpcionalRequest,
  ObservacionRequeridaRequest,
  SolicitudCreacionDirectaRequest,
  SolicitudEdicionRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import { transaccionResponseSchema } from '@/features/transacciones/schemas/transaccionResponse.schema'

type VerboSolicitud = 'asignar' | 'iniciar-proceso' | 'completar' | 'rechazar'

async function transicionar(
  id: number,
  verbo: VerboSolicitud,
  datos: ObservacionOpcionalRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/solicitudes/${id}/${verbo}`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function crearSolicitud(
  transaccionId: number,
  datos: SolicitudCreacionDirectaRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/solicitudes`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function editarSolicitud(
  id: number,
  datos: SolicitudEdicionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/solicitudes/${id}`, { method: 'PATCH', body: datos })
  return transaccionResponseSchema.parse(data)
}

export async function eliminarSolicitud(id: number): Promise<void> {
  await apiClientNoContent(`/api/solicitudes/${id}`, { method: 'DELETE' })
}

export async function asignarSolicitud(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'asignar', datos)
}

export async function iniciarProcesoSolicitud(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'iniciar-proceso', datos)
}

export async function completarSolicitud(
  id: number,
  datos: ObservacionOpcionalRequest = {},
): Promise<Transaccion> {
  return transicionar(id, 'completar', datos)
}

export async function rechazarSolicitud(
  id: number,
  datos: ObservacionRequeridaRequest,
): Promise<Transaccion> {
  return transicionar(id, 'rechazar', datos)
}
