import type { FiltrosReporte } from '@/features/analisis/types/reporte.types'

export function construirParametrosReporte(filtros: FiltrosReporte): string {
  const parametros = new URLSearchParams()

  if (filtros.desde) parametros.set('desde', filtros.desde)
  if (filtros.hasta) parametros.set('hasta', filtros.hasta)
  if (filtros.titulo) parametros.set('titulo', filtros.titulo)
  if (filtros.etiquetaPeriodo) parametros.set('etiquetaPeriodo', filtros.etiquetaPeriodo)

  const consulta = parametros.toString()
  return consulta ? `?${consulta}` : ''
}
