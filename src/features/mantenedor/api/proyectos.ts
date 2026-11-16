import { keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type {
  ProyectoEdicionRequest,
  ProyectoRequest,
} from '@/features/mantenedor/schemas/proyecto.schema'
import {
  paginaProyectosResponseSchema,
  proyectoResponseSchema,
} from '@/features/mantenedor/schemas/proyectoResponse.schema'
import type { PaginaProyectos, Proyecto } from '@/features/mantenedor/types/proyecto.types'

const CLAVES_CON_PROYECTOS = [
  ['mantenedor', 'proyectos'],
  ['catalogos', 'proyectos'],
  ['proyectos'],
  ['transacciones'],
]

export interface ConsultaProyectos {
  page: number
  perPage: number
  sort: string
  q: string
  estado?: string[]
}

function construirQuery(consulta: ConsultaProyectos): string {
  const query = new URLSearchParams({
    page: String(consulta.page),
    perPage: String(consulta.perPage),
    sort: consulta.sort,
  })

  if (consulta.q.length > 0) query.set('q', consulta.q)

  consulta.estado?.forEach((valor) => query.append('estado', valor))

  return query.toString()
}

export async function obtenerProyectos(consulta: ConsultaProyectos): Promise<PaginaProyectos> {
  const datos = await apiClient<unknown>(`/api/mantenedor/proyectos?${construirQuery(consulta)}`)
  return paginaProyectosResponseSchema.parse(datos)
}

export async function crearProyecto(peticion: ProyectoRequest): Promise<Proyecto> {
  const datos = await apiClient<unknown>('/api/mantenedor/proyectos', {
    method: 'POST',
    body: peticion,
  })
  return proyectoResponseSchema.parse(datos)
}

export async function editarProyecto(
  id: number,
  peticion: ProyectoEdicionRequest,
): Promise<Proyecto> {
  const datos = await apiClient<unknown>(`/api/mantenedor/proyectos/${id}`, {
    method: 'PATCH',
    body: peticion,
  })
  return proyectoResponseSchema.parse(datos)
}

export async function cambiarEstadoProyecto(id: number, activar: boolean): Promise<Proyecto> {
  const accion = activar ? 'activar' : 'desactivar'
  const datos = await apiClient<unknown>(`/api/mantenedor/proyectos/${id}/${accion}`, {
    method: 'POST',
  })
  return proyectoResponseSchema.parse(datos)
}

export async function invalidarDatosDeProyectos(queryClient: QueryClient): Promise<void> {
  await Promise.all(
    CLAVES_CON_PROYECTOS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}

export const proyectosQueryOptions = (consulta: ConsultaProyectos) =>
  queryOptions({
    queryKey: ['mantenedor', 'proyectos', consulta],
    queryFn: () => obtenerProyectos(consulta),
    placeholderData: keepPreviousData,
  })
