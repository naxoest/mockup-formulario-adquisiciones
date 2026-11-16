import { queryOptions } from '@tanstack/react-query'
import { apiClient, apiClientFile, type ApiFile } from '@/lib/apiClient'
import { reporteAdquisicionesResponseSchema } from '@/features/analisis/schemas/reporteResponse.schema'
import type { FiltrosReporte, ReporteAdquisiciones } from '@/features/analisis/types/reporte.types'
import { construirParametrosReporte } from '@/features/analisis/utils/parametrosReporte'

const REPORTE_STALE_TIME = 10_000

async function getReporteAdquisiciones(filtros: FiltrosReporte): Promise<ReporteAdquisiciones> {
  const data = await apiClient<unknown>(
    `/api/reportes/adquisiciones${construirParametrosReporte(filtros)}`,
  )
  return reporteAdquisicionesResponseSchema.parse(data)
}

export const reporteAdquisicionesQueryOptions = (filtros: FiltrosReporte) =>
  queryOptions({
    queryKey: ['reportes', 'adquisiciones', filtros],
    queryFn: () => getReporteAdquisiciones(filtros),
    staleTime: REPORTE_STALE_TIME,
  })

export function descargarReporteAdquisiciones(filtros: FiltrosReporte): Promise<ApiFile> {
  return apiClientFile(`/api/reportes/adquisiciones.pdf${construirParametrosReporte(filtros)}`)
}
