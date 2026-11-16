import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type {
  Importacion,
  RevisionImportacion,
} from '@/features/requerimientos/types/importacion.types'
import type { NuevaImportacionRequest } from '@/features/requerimientos/schemas/importacionRequest.schema'
import {
  importacionResponseSchema,
  importacionesResponseSchema,
  revisionImportacionResponseSchema,
} from '@/features/requerimientos/schemas/importacionResponse.schema'

const RECURSO = '/api/requerimientos/importaciones'
const IMPORTACIONES_STALE_TIME = 10_000

async function obtenerImportaciones(): Promise<Importacion[]> {
  const data = await apiClient<unknown>(RECURSO)
  return importacionesResponseSchema.parse(data)
}

export async function crearImportacion(
  datos: NuevaImportacionRequest,
): Promise<RevisionImportacion> {
  const data = await apiClient<unknown>(RECURSO, { method: 'POST', body: datos })
  return revisionImportacionResponseSchema.parse(data)
}

export async function confirmarImportacion(importacionId: number): Promise<Importacion> {
  const data = await apiClient<unknown>(`${RECURSO}/${importacionId}/confirmar`, {
    method: 'POST',
  })
  return importacionResponseSchema.parse(data)
}

export async function descartarImportacion(importacionId: number): Promise<Importacion> {
  const data = await apiClient<unknown>(`${RECURSO}/${importacionId}/descartar`, {
    method: 'POST',
  })
  return importacionResponseSchema.parse(data)
}

export const importacionesRequerimientosQueryOptions = queryOptions({
  queryKey: ['requerimientos', 'importaciones'],
  queryFn: () => obtenerImportaciones(),
  staleTime: IMPORTACIONES_STALE_TIME,
})
