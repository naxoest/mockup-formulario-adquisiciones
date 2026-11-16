import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type {
  AnalistaReferencia,
  AsignacionAnalistas,
} from '@/features/transacciones/types/transaccion.types'
import type { AsignacionAnalistasRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'
import {
  analistasResponseSchema,
  asignacionAnalistasResponseSchema,
} from '@/features/transacciones/schemas/analistaResponse.schema'

const ASIGNACION_STALE_TIME = 10_000

async function getAnalistas(): Promise<AnalistaReferencia[]> {
  const data = await apiClient<unknown>('/api/analistas')
  return analistasResponseSchema.parse(data)
}

export const analistasQueryOptions = queryOptions({
  queryKey: ['analistas'],
  queryFn: getAnalistas,
})

async function getAsignacion(transaccionId: number): Promise<AsignacionAnalistas> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/analistas`)
  return asignacionAnalistasResponseSchema.parse(data)
}

export const asignacionAnalistasQueryOptions = (transaccionId: number) =>
  queryOptions({
    queryKey: ['transacciones', transaccionId, 'analistas'],
    queryFn: () => getAsignacion(transaccionId),
    staleTime: ASIGNACION_STALE_TIME,
  })

interface VariablesAsignacion {
  transaccionId: number
  datos: AsignacionAnalistasRequest
}

async function putAsignacion({
  transaccionId,
  datos,
}: VariablesAsignacion): Promise<AsignacionAnalistas> {
  const data = await apiClient<unknown>(`/api/transacciones/${transaccionId}/analistas`, {
    method: 'PUT',
    body: datos,
  })
  return asignacionAnalistasResponseSchema.parse(data)
}

export function useActualizarAsignacionAnalistas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: putAsignacion,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
        queryClient.invalidateQueries({ queryKey: ['monitoreo'] }),
      ])
    },
  })
}
