import { utils, write, type CellObject } from 'xlsx'
import type { TransaccionListado } from '@/features/transacciones/types/transaccion.types'
import {
  COLUMNAS_EXPORTACION,
  type ColumnaExportacion,
  type ValorExportacion,
} from './columnasExportacion'

const NOMBRE_HOJA = 'Transacciones'
const FORMATO_FECHA = 'dd-mm-yyyy'
const FORMATO_DECIMAL = '0.0'
const MS_POR_DIA = 86_400_000
const EPOCA_EXCEL = Date.UTC(1899, 11, 30)

function serialDesdeFechaCivil(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return (Date.UTC(anio, mes - 1, dia) - EPOCA_EXCEL) / MS_POR_DIA
}

function valorPlanilla(columna: ColumnaExportacion, valor: ValorExportacion): ValorExportacion {
  return columna.tipo === 'fecha' && typeof valor === 'string'
    ? serialDesdeFechaCivil(valor)
    : valor
}

function formatearCelda(columna: ColumnaExportacion, celda: CellObject): void {
  if (columna.tipo === 'fecha') {
    celda.z = FORMATO_FECHA
  } else if (columna.tipo === 'decimal') {
    celda.z = FORMATO_DECIMAL
  } else if (columna.tipo === 'enlace' && typeof celda.v === 'string') {
    celda.l = { Target: celda.v }
  }
}

export function generarPlanillaTransacciones(
  transacciones: readonly TransaccionListado[],
): ArrayBuffer {
  const hoja = utils.aoa_to_sheet([
    COLUMNAS_EXPORTACION.map((columna) => columna.encabezado),
    ...transacciones.map((transaccion) =>
      COLUMNAS_EXPORTACION.map((columna) => valorPlanilla(columna, columna.valor(transaccion))),
    ),
  ])

  COLUMNAS_EXPORTACION.forEach((columna, c) => {
    transacciones.forEach((_, indice) => {
      const celda: CellObject | undefined = hoja[utils.encode_cell({ r: indice + 1, c })]

      if (celda !== undefined) {
        formatearCelda(columna, celda)
      }
    })
  })

  hoja['!cols'] = COLUMNAS_EXPORTACION.map((columna) => ({ wch: columna.ancho }))

  const libro = utils.book_new()
  utils.book_append_sheet(libro, hoja, NOMBRE_HOJA)

  return write(libro, { bookType: 'xlsx', type: 'array', compression: true })
}
