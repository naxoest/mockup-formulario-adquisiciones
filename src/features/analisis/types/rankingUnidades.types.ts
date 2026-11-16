import type { z } from 'zod'
import type { busquedaRankingUnidadesSchema } from '@/features/analisis/schemas/busquedaRankingUnidades.schema'
import type { rankingUnidadesResponseSchema } from '@/features/analisis/schemas/rankingUnidadesResponse.schema'
import type { SelectOption } from '@/types/select'

export type RankingUnidades = z.infer<typeof rankingUnidadesResponseSchema>
export type ResumenRankingUnidad = RankingUnidades['data'][number]

export type BusquedaRankingUnidades = z.infer<typeof busquedaRankingUnidadesSchema>

export interface FiltrosRankingUnidades {
  campus: string[]
  desde: string | null
  hasta: string | null
}

export interface FilaRankingUnidad {
  id: number
  posicion: number
  nombre: string
  cr: number
  campus: string
  sedes: SelectOption[]
  comprometido: number
  participacion: number
  ocValidas: number
  ocTotal: number
  completitud: number
  modalidades: SelectOption[]
}
