import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { indicadores, type indicadoresValues } from '@/features/inicio/schemas/indicadores.schema'

const INDICADORES_STALE_TIME = 10_000

export async function getIndicadores(): Promise<indicadoresValues> {
  const data = await apiClient<unknown>('/api/resumen_presupuestario')

  return indicadores.parse(data)
}

export const indicadoresQueryOptions = () =>
  queryOptions({
    queryKey: ['indicadores'],
    queryFn: getIndicadores,
    staleTime: INDICADORES_STALE_TIME,
  })
