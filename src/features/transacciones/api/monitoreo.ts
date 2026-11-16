import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { SelectOption } from '@/types/select'
import type {
  ActualizacionMonitoreo,
  RegistroMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'
import {
  bloqueadoresResponseSchema,
  monitoreoResponseSchema,
  registroMonitoreoResponseSchema,
} from '@/features/transacciones/schemas/monitoreoResponse.schema'

const MONITOREO_STALE_TIME = 10_000
const BLOQUEADORES_STALE_TIME = 5 * 60_000

async function getMonitoreo(): Promise<RegistroMonitoreo[]> {
  const data = await apiClient<unknown>('/api/monitoreo')
  return monitoreoResponseSchema.parse(data)
}

export const monitoreoQueryOptions = queryOptions({
  queryKey: ['monitoreo'],
  queryFn: getMonitoreo,
  staleTime: MONITOREO_STALE_TIME,
})

async function getBloqueadores(): Promise<SelectOption[]> {
  const data = await apiClient<unknown>('/api/monitoreo/bloqueadores')
  return bloqueadoresResponseSchema.parse(data)
}

export const bloqueadoresQueryOptions = queryOptions({
  queryKey: ['monitoreo-bloqueadores'],
  queryFn: getBloqueadores,
  staleTime: BLOQUEADORES_STALE_TIME,
})

interface VariablesActualizacion {
  transaccionId: number
  cambios: ActualizacionMonitoreo
}

async function patchMonitoreo({
  transaccionId,
  cambios,
}: VariablesActualizacion): Promise<RegistroMonitoreo> {
  const data = await apiClient<unknown>(`/api/monitoreo/${transaccionId}`, {
    method: 'PATCH',
    body: cambios,
  })
  return registroMonitoreoResponseSchema.parse(data)
}

export function useActualizarMonitoreo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: patchMonitoreo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitoreo'] }),
  })
}
