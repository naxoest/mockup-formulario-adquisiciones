import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { SelectOption } from '@/types/select'
import {
  opcionesCatalogoResponseSchema,
  unidadesSolicitantesResponseSchema,
} from '@/features/requerimientos/schemas/catalogoSolicitante.schema'
import type { UnidadSolicitante } from '@/features/requerimientos/types/catalogoSolicitante.types'

const CATALOGO_STALE_TIME = 5 * 60_000

async function obtenerTiposSolicitante(): Promise<SelectOption[]> {
  const data = await apiClient<unknown>('/api/tipos-solicitante')
  return opcionesCatalogoResponseSchema.parse(data)
}

async function obtenerCampus(tipoSolicitante: string): Promise<SelectOption[]> {
  const query = new URLSearchParams({ tipoSolicitante })
  const data = await apiClient<unknown>(`/api/campus?${query.toString()}`)
  return opcionesCatalogoResponseSchema.parse(data)
}

async function obtenerUnidadesSolicitantes(
  tipoSolicitante: string,
  campus: string,
): Promise<UnidadSolicitante[]> {
  const query = new URLSearchParams({ tipoSolicitante, campus })
  const data = await apiClient<unknown>(`/api/unidades-solicitantes?${query.toString()}`)
  return unidadesSolicitantesResponseSchema.parse(data)
}

export const tiposSolicitanteQueryOptions = queryOptions({
  queryKey: ['catalogo-solicitantes', 'tipos'],
  queryFn: () => obtenerTiposSolicitante(),
  staleTime: CATALOGO_STALE_TIME,
})

export const campusSolicitanteQueryOptions = (tipoSolicitante: string) =>
  queryOptions({
    queryKey: ['catalogo-solicitantes', 'campus', tipoSolicitante],
    queryFn: () => obtenerCampus(tipoSolicitante),
    staleTime: CATALOGO_STALE_TIME,
  })

export const unidadesSolicitantesQueryOptions = (tipoSolicitante: string, campus: string) =>
  queryOptions({
    queryKey: ['catalogo-solicitantes', 'unidades', tipoSolicitante, campus],
    queryFn: () => obtenerUnidadesSolicitantes(tipoSolicitante, campus),
    staleTime: CATALOGO_STALE_TIME,
  })
