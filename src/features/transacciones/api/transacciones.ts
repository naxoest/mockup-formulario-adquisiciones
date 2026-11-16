import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type {
  PaginaTransacciones,
  Transaccion,
  TransaccionListado,
} from '@/features/transacciones/types/transaccion.types'
import type {
  DeshacerPasoRequest,
  RegistrarPasoRequest,
  TransaccionBorradorRequest,
  TransaccionEdicionRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import {
  paginaTransaccionesSchema,
  transaccionResponseSchema,
} from '@/features/transacciones/schemas/transaccionResponse.schema'

const TRANSACCIONES_STALE_TIME = 10_000
const TAMANO_PAGINA_RECORRIDO = 100

export interface ConsultaTransacciones {
  page?: number
  perPage?: number
  sort?: string
  q?: string
  campus?: string[]
  modalidad?: string[]
  tipo?: string[]
  criticidad?: string[]
  principal?: string[]
}

function construirQuery(consulta: ConsultaTransacciones): string {
  const query = new URLSearchParams()

  if (consulta.page !== undefined) query.set('page', String(consulta.page))
  if (consulta.perPage !== undefined) query.set('perPage', String(consulta.perPage))
  if (consulta.sort !== undefined) query.set('sort', consulta.sort)
  if (consulta.q !== undefined && consulta.q.length > 0) query.set('q', consulta.q)

  consulta.campus?.forEach((valor) => query.append('campus', valor))
  consulta.modalidad?.forEach((valor) => query.append('modalidad', valor))
  consulta.tipo?.forEach((valor) => query.append('tipo', valor))
  consulta.criticidad?.forEach((valor) => query.append('criticidad', valor))
  consulta.principal?.forEach((valor) => query.append('principal', valor))

  return query.toString()
}

async function getTransacciones(consulta: ConsultaTransacciones): Promise<PaginaTransacciones> {
  const query = construirQuery(consulta)
  const data = await apiClient<unknown>(`/api/transacciones${query.length > 0 ? `?${query}` : ''}`)
  return paginaTransaccionesSchema.parse(data)
}

export async function getTransaccionesSinPaginar(
  consulta: ConsultaTransacciones,
  porPagina = TAMANO_PAGINA_RECORRIDO,
): Promise<TransaccionListado[]> {
  const primera = await getTransacciones({ ...consulta, page: 1, perPage: porPagina })
  const restantes = await Promise.all(
    Array.from({ length: Math.max(primera.meta.totalPages - 1, 0) }, (_, indice) =>
      getTransacciones({ ...consulta, page: indice + 2, perPage: porPagina }),
    ),
  )

  return [primera, ...restantes].flatMap((pagina) => pagina.data)
}

export async function getTransaccion(id: number): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${id}`)
  return transaccionResponseSchema.parse(data)
}

export async function crearTransaccion(datos: TransaccionBorradorRequest): Promise<Transaccion> {
  const data = await apiClient<unknown>('/api/transacciones', { method: 'POST', body: datos })
  return transaccionResponseSchema.parse(data)
}

export async function editarTransaccion(
  id: number,
  datos: TransaccionEdicionRequest,
): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${id}`, {
    method: 'PATCH',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function confirmarTransaccion(id: number): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${id}/confirmar`, { method: 'POST' })
  return transaccionResponseSchema.parse(data)
}

export async function registrarPaso(id: number, datos: RegistrarPasoRequest): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${id}/registrar-paso`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export async function deshacerPaso(id: number, datos: DeshacerPasoRequest): Promise<Transaccion> {
  const data = await apiClient<unknown>(`/api/transacciones/${id}/deshacer-paso`, {
    method: 'POST',
    body: datos,
  })
  return transaccionResponseSchema.parse(data)
}

export const transaccionesQueryOptions = (consulta: ConsultaTransacciones = {}) =>
  queryOptions({
    queryKey: ['transacciones', consulta],
    queryFn: () => getTransacciones(consulta),
    staleTime: TRANSACCIONES_STALE_TIME,
    placeholderData: keepPreviousData,
  })

export const transaccionQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['transacciones', id],
    queryFn: () => getTransaccion(id),
    staleTime: TRANSACCIONES_STALE_TIME,
  })
