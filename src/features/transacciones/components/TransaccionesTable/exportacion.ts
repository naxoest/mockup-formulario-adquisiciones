import type { ExportFormat } from '@/components/ui/DataTable'
import type { TransaccionListado } from '@/features/transacciones/types/transaccion.types'
import { toCsv } from '@/utils/csv'
import { toCivilDate } from '@/utils/date'
import { downloadBlob } from '@/utils/download'
import { COLUMNAS_EXPORTACION } from './columnasExportacion'

const TIPO_CSV = 'text/csv;charset=utf-8'
const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const MARCA_DE_ORDEN_DE_BYTES = '\uFEFF'

const EXTENSION_POR_FORMATO: Record<ExportFormat, string> = {
  csv: 'csv',
  excel: 'xlsx',
}

export function nombreArchivoExportacion(formato: ExportFormat, fecha: Date): string {
  return `transacciones-${toCivilDate(fecha)}.${EXTENSION_POR_FORMATO[formato]}`
}

function generarCsvTransacciones(transacciones: readonly TransaccionListado[]): string {
  return toCsv([
    COLUMNAS_EXPORTACION.map((columna) => columna.encabezado),
    ...transacciones.map((transaccion) =>
      COLUMNAS_EXPORTACION.map((columna) => columna.valor(transaccion)),
    ),
  ])
}

async function generarArchivo(
  formato: ExportFormat,
  transacciones: readonly TransaccionListado[],
): Promise<Blob> {
  switch (formato) {
    case 'csv':
      return new Blob([MARCA_DE_ORDEN_DE_BYTES, generarCsvTransacciones(transacciones)], {
        type: TIPO_CSV,
      })
    case 'excel': {
      const { generarPlanillaTransacciones } = await import('./planilla')
      return new Blob([generarPlanillaTransacciones(transacciones)], { type: TIPO_XLSX })
    }
  }
}

export async function descargarTransacciones(
  formato: ExportFormat,
  transacciones: readonly TransaccionListado[],
  nombreArchivo: string,
): Promise<void> {
  downloadBlob(await generarArchivo(formato, transacciones), nombreArchivo)
}
