import { queryOptions } from '@tanstack/react-query'
import { unidadesSolicitantesResponseSchema } from '@/features/transacciones/schemas/transaccionResponse.schema'
import { apiClient } from '@/lib/apiClient'
import type { SelectOption } from '@/types/select'

export interface UnidadSolicitanteOption extends SelectOption {
  id: number
  nombre: string
  cr: number
  sedes: SelectOption[]
  etiquetaSedes: string
  disabled: boolean
  description?: string
}

const UNIDADES_STALE_TIME = 30_000

function getCampus(tipoSolicitante: string): Promise<SelectOption[]> {
  const query = new URLSearchParams({ tipoSolicitante })
  return apiClient<SelectOption[]>(`/api/campus?${query.toString()}`)
}

async function getUnidadesSolicitantes(
  tipoSolicitante: string,
  campus: string,
  busqueda: string,
): Promise<UnidadSolicitanteOption[]> {
  const query = new URLSearchParams({ tipoSolicitante, campus, busqueda })
  const data = await apiClient<unknown>(`/api/unidades-solicitantes?${query.toString()}`)

  return unidadesSolicitantesResponseSchema.parse(data).map(({ id, label, cr, activo, sedes }) => {
    const etiquetaSedes = sedes.map((sede) => sede.label).join(', ')

    return {
      value: String(id),
      label: `${label} (${etiquetaSedes})`,
      id,
      nombre: label,
      cr,
      sedes,
      etiquetaSedes,
      disabled: !activo,
      description: activo ? undefined : 'Inactiva',
    }
  })
}

export const campusQueryOptions = (tipoSolicitante: string) =>
  queryOptions({
    queryKey: ['campus', tipoSolicitante],
    queryFn: () => getCampus(tipoSolicitante),
    staleTime: UNIDADES_STALE_TIME,
  })

export const unidadesSolicitantesQueryOptions = (
  tipoSolicitante: string,
  campus: string,
  busqueda: string,
) =>
  queryOptions({
    queryKey: ['unidades-solicitantes', tipoSolicitante, campus, busqueda],
    queryFn: () => getUnidadesSolicitantes(tipoSolicitante, campus, busqueda),
    staleTime: UNIDADES_STALE_TIME,
  })
