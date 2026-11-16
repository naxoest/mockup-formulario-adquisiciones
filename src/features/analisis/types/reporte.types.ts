import type { z } from 'zod'
import type { busquedaAdquisicionesSchema } from '@/features/analisis/schemas/busquedaAdquisiciones.schema'
import type { reporteAdquisicionesResponseSchema } from '@/features/analisis/schemas/reporteResponse.schema'

export type ReporteAdquisiciones = z.infer<typeof reporteAdquisicionesResponseSchema>
export type TotalesReporte = ReporteAdquisiciones['totales']
export type PuntoEvolucion = ReporteAdquisiciones['evolucion'][number]
export type ResumenTipo = ReporteAdquisiciones['porTipo'][number]
export type ResumenModalidad = ReporteAdquisiciones['porModalidad'][number]
export type ResumenUnidad = ReporteAdquisiciones['porUnidad'][number]
export type ResumenCampus = ReporteAdquisiciones['porCampus'][number]

export type BusquedaAdquisiciones = z.infer<typeof busquedaAdquisicionesSchema>

export interface FiltrosReporte {
  desde: string | null
  hasta: string | null
  titulo: string | null
  etiquetaPeriodo: string | null
}
