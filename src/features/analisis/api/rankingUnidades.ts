import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { rankingUnidadesResponseSchema } from '@/features/analisis/schemas/rankingUnidadesResponse.schema'
import type {
  FiltrosRankingUnidades,
  RankingUnidades,
} from '@/features/analisis/types/rankingUnidades.types'
import {
  construirParametrosRanking,
  LIMITE_RANKING_UNIDADES,
} from '@/features/analisis/utils/filtrosRankingUnidades'

const RANKING_STALE_TIME = 10_000

async function getRankingUnidades(filtros: FiltrosRankingUnidades): Promise<RankingUnidades> {
  const data = await apiClient<unknown>(
    `/api/reportes/unidades${construirParametrosRanking(filtros, LIMITE_RANKING_UNIDADES)}`,
  )
  return rankingUnidadesResponseSchema.parse(data)
}

export const rankingUnidadesQueryOptions = (filtros: FiltrosRankingUnidades) =>
  queryOptions({
    queryKey: ['reportes', 'unidades', filtros],
    queryFn: () => getRankingUnidades(filtros),
    staleTime: RANKING_STALE_TIME,
  })
