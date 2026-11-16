import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import { toCivilDate } from '@/utils/date'
import { downloadBlob } from '@/utils/download'

const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function nombreArchivoPlanilla(cr: number, fecha: Date): string {
  return `requerimientos-${cr}-${toCivilDate(fecha)}.xlsx`
}

export async function descargarPlanilla(
  requerimientos: readonly Requerimiento[],
  nombreArchivo: string,
): Promise<void> {
  const { generarPlanilla } = await import('@/features/requerimientos/utils/planilla')
  const contenido = generarPlanilla(requerimientos)

  downloadBlob(new Blob([contenido], { type: TIPO_XLSX }), nombreArchivo)
}
