import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { HistorialTransaccion } from '@/features/transacciones/types/historial.types'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'

const HISTORIAL_STALE_TIME = 10_000

async function getHistorial(transaccionId: number): Promise<HistorialTransaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/historial`)
  return historialResponseSchema.parse(data)
}

export const historialQueryOptions = (transaccionId: number) =>
  queryOptions({
    queryKey: ['transacciones', transaccionId, 'historial'],
    queryFn: () => getHistorial(transaccionId),
    staleTime: HISTORIAL_STALE_TIME,
  })
