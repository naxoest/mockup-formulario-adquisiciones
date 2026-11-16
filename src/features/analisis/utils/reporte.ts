import type { FiltrosReporte } from '@/features/analisis/types/reporte.types'

const formatoMes = new Intl.DateTimeFormat('es-CL', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
})

export function etiquetaMes(mes: string): string {
  const [anio, numeroMes] = mes.split('-')
  const anioNumerico = Number(anio)
  const mesNumerico = Number(numeroMes)

  if (!Number.isInteger(anioNumerico) || mesNumerico < 1 || mesNumerico > 12) {
    return mes
  }

  return formatoMes.format(new Date(Date.UTC(anioNumerico, mesNumerico - 1, 1)))
}

export function nombreArchivoReporte(filtros: FiltrosReporte): string {
  const partes = ['reporte-adquisiciones']

  if (filtros.desde) partes.push(filtros.desde)
  if (filtros.hasta) partes.push(filtros.hasta)

  return `${partes.join('-')}.pdf`
}
