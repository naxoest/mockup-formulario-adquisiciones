import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { EventoRequerimiento } from '@/features/requerimientos/types/evento.types'
import type {
  OpcionEstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import { eventosRequerimientoResponseSchema } from '@/features/requerimientos/schemas/eventoResponse.schema'
import {
  estadosRequerimientoResponseSchema,
  requerimientosResponseSchema,
} from '@/features/requerimientos/schemas/requerimientoResponse.schema'

const RECURSO = '/api/requerimientos'
const REQUERIMIENTOS_STALE_TIME = 10_000
const ESTADOS_STALE_TIME = 5 * 60_000

async function obtenerRequerimientos(): Promise<Requerimiento[]> {
  const data = await apiClient<unknown>(RECURSO)
  return requerimientosResponseSchema.parse(data)
}

async function obtenerEstados(): Promise<OpcionEstadoRequerimiento[]> {
  const data = await apiClient<unknown>(`${RECURSO}/estados`)
  return estadosRequerimientoResponseSchema.parse(data)
}

async function obtenerEventos(requerimientoId: number): Promise<EventoRequerimiento[]> {
  const data = await apiClient<unknown>(`${RECURSO}/${requerimientoId}/eventos`)
  return eventosRequerimientoResponseSchema.parse(data)
}

export const requerimientosQueryOptions = queryOptions({
  queryKey: ['requerimientos'],
  queryFn: () => obtenerRequerimientos(),
  staleTime: REQUERIMIENTOS_STALE_TIME,
})

export const estadosRequerimientoQueryOptions = queryOptions({
  queryKey: ['requerimientos', 'estados'],
  queryFn: () => obtenerEstados(),
  staleTime: ESTADOS_STALE_TIME,
})

export const eventosRequerimientoQueryOptions = (requerimientoId: number) =>
  queryOptions({
    queryKey: ['requerimientos', requerimientoId, 'eventos'],
    queryFn: () => obtenerEventos(requerimientoId),
    staleTime: REQUERIMIENTOS_STALE_TIME,
  })
