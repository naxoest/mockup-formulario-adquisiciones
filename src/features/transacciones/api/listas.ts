import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { SelectOption } from '@/types/select'
import type { PeriodoPresupuestario } from '@/features/transacciones/types/transaccion.types'
import { periodosPresupuestariosResponseSchema } from '@/features/transacciones/schemas/periodoPresupuestarioResponse.schema'

const LISTAS_STALE_TIME = 5 * 60_000

function listaQueryOptions(recurso: string) {
  return queryOptions({
    queryKey: [recurso],
    queryFn: () => apiClient<SelectOption[]>(`/api/${recurso}`),
    staleTime: LISTAS_STALE_TIME,
  })
}

export const financiamientosQueryOptions = listaQueryOptions('financiamientos')
export const tiposSolicitudQueryOptions = listaQueryOptions('tipos-solicitud')
export const estadosTransaccionQueryOptions = listaQueryOptions('estados-transaccion')
export const estadosSolicitudQueryOptions = listaQueryOptions('estados-solicitud')
export const modalidadesQueryOptions = listaQueryOptions('modalidades')
export const estadosEvaluacionQueryOptions = listaQueryOptions('estados-evaluacion')
export const estadosFacturaQueryOptions = listaQueryOptions('estados-factura')
export const tiposSolicitanteQueryOptions = listaQueryOptions('tipos-solicitante')

async function getPeriodosPresupuestarios(): Promise<PeriodoPresupuestario[]> {
  const data = await apiClient<unknown>('/api/periodos-presupuestarios')
  return periodosPresupuestariosResponseSchema.parse(data)
}

export const periodosPresupuestariosQueryOptions = queryOptions({
  queryKey: ['periodos-presupuestarios'],
  queryFn: getPeriodosPresupuestarios,
  staleTime: LISTAS_STALE_TIME,
})
