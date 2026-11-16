import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { UnidadSolicitanteRequest } from '@/features/mantenedor/schemas/unidadSolicitante.schema'
import {
  opcionesResponseSchema,
  paginaUnidadesSolicitantesResponseSchema,
  unidadSolicitanteResponseSchema,
} from '@/features/mantenedor/schemas/unidadSolicitanteResponse.schema'
import type {
  PaginaUnidadesSolicitantes,
  UnidadSolicitante,
} from '@/features/mantenedor/types/unidadSolicitante.types'
import type { SelectOption } from '@/types/select'

const CATALOGOS_STALE_TIME = 5 * 60_000

const CLAVES_CON_UNIDADES = [
  ['mantenedor', 'unidades-solicitantes'],
  ['campus'],
  ['unidades-solicitantes'],
  ['catalogo-solicitantes'],
  ['transacciones'],
  ['requerimientos'],
  ['reportes', 'unidades'],
]

export interface ConsultaUnidades {
  page: number
  perPage: number
  sort: string
  q: string
  tipo?: string[]
  sede?: string[]
  estado?: string[]
}

function construirQuery(consulta: ConsultaUnidades): string {
  const query = new URLSearchParams({
    page: String(consulta.page),
    perPage: String(consulta.perPage),
    sort: consulta.sort,
  })

  if (consulta.q.length > 0) query.set('q', consulta.q)

  consulta.tipo?.forEach((valor) => query.append('tipo', valor))
  consulta.sede?.forEach((valor) => query.append('sede', valor))
  consulta.estado?.forEach((valor) => query.append('estado', valor))

  return query.toString()
}

async function obtenerUnidadesSolicitantes(
  consulta: ConsultaUnidades,
): Promise<PaginaUnidadesSolicitantes> {
  const datos = await apiClient<unknown>(
    `/api/mantenedor/unidades-solicitantes?${construirQuery(consulta)}`,
  )
  return paginaUnidadesSolicitantesResponseSchema.parse(datos)
}

export async function crearUnidadSolicitante(
  peticion: UnidadSolicitanteRequest,
): Promise<UnidadSolicitante> {
  const datos = await apiClient<unknown>('/api/mantenedor/unidades-solicitantes', {
    method: 'POST',
    body: peticion,
  })
  return unidadSolicitanteResponseSchema.parse(datos)
}

export async function editarUnidadSolicitante(
  id: number,
  peticion: UnidadSolicitanteRequest,
): Promise<UnidadSolicitante> {
  const datos = await apiClient<unknown>(`/api/mantenedor/unidades-solicitantes/${id}`, {
    method: 'PATCH',
    body: peticion,
  })
  return unidadSolicitanteResponseSchema.parse(datos)
}

export async function cambiarEstadoUnidadSolicitante(
  id: number,
  activar: boolean,
): Promise<UnidadSolicitante> {
  const accion = activar ? 'activar' : 'desactivar'
  const datos = await apiClient<unknown>(`/api/mantenedor/unidades-solicitantes/${id}/${accion}`, {
    method: 'POST',
  })
  return unidadSolicitanteResponseSchema.parse(datos)
}

async function obtenerTiposSolicitante(): Promise<SelectOption[]> {
  const datos = await apiClient<unknown>('/api/tipos-solicitante')
  return opcionesResponseSchema.parse(datos)
}

async function obtenerSedes(): Promise<SelectOption[]> {
  const datos = await apiClient<unknown>('/api/campus')
  return opcionesResponseSchema.parse(datos)
}

export async function invalidarDatosDeUnidades(queryClient: QueryClient): Promise<void> {
  await Promise.all(
    CLAVES_CON_UNIDADES.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}

export const unidadesSolicitantesQueryOptions = (consulta: ConsultaUnidades) =>
  queryOptions({
    queryKey: ['mantenedor', 'unidades-solicitantes', consulta],
    queryFn: () => obtenerUnidadesSolicitantes(consulta),
    placeholderData: keepPreviousData,
  })

export const tiposSolicitanteQueryOptions = queryOptions({
  queryKey: ['mantenedor', 'tipos-solicitante'],
  queryFn: obtenerTiposSolicitante,
  staleTime: CATALOGOS_STALE_TIME,
})

export const sedesQueryOptions = queryOptions({
  queryKey: ['mantenedor', 'sedes'],
  queryFn: obtenerSedes,
  staleTime: CATALOGOS_STALE_TIME,
})
