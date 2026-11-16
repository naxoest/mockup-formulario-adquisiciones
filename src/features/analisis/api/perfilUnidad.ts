import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { perfilUnidadResponseSchema } from '@/features/analisis/schemas/perfilUnidadResponse.schema'
import type { PerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'

const PERFIL_STALE_TIME = 10_000

async function getPerfilUnidad(unidadId: string): Promise<PerfilUnidad> {
  const data = await apiClient<unknown>(`/api/reportes/unidades/${encodeURIComponent(unidadId)}`)
  return perfilUnidadResponseSchema.parse(data)
}

export const perfilUnidadQueryOptions = (unidadId: string) =>
  queryOptions({
    queryKey: ['reportes', 'unidades', 'detalle', unidadId],
    queryFn: () => getPerfilUnidad(unidadId),
    staleTime: PERFIL_STALE_TIME,
  })
