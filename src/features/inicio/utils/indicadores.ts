import type { ChartDataRow } from '@/components/ui/BarChart'
import type { indicadoresValues } from '@/features/inicio/schemas/indicadores.schema'

export interface IndicadoresProcesados {
  precompromisoAcumulado: number
  compromisoAcumulado: number
  facturadoAcumulado: number
  ahorroProcesosConcursales: number
  porcentajeComprometido: number
  porcentajeFacturado: number
  fechaCorte: string
  cantidadTransacciones: number
  accumulatedData: ChartDataRow[]
  monthlyVariationData: ChartDataRow[]
}

export function formatFechaActual(fecha: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
}

export function parseFechaIso(fechaIso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaIso)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
    return date
  }

  return null
}

export function procesarIndicadores(data?: indicadoresValues | null): IndicadoresProcesados {
  let fechaCorte = formatFechaActual()

  if (data?.fechaCorte) {
    const fechaParseada = parseFechaIso(data.fechaCorte)
    if (fechaParseada) {
      fechaCorte = formatFechaActual(fechaParseada)
    }
  }

  const cantidadTransacciones = data?.cantidadTransacciones ?? 0

  if (!data || !data.serie || data.serie.length === 0) {
    return {
      precompromisoAcumulado: 0,
      compromisoAcumulado: 0,
      facturadoAcumulado: 0,
      ahorroProcesosConcursales: 0,
      porcentajeComprometido: 0,
      porcentajeFacturado: 0,
      fechaCorte,
      cantidadTransacciones,
      accumulatedData: [],
      monthlyVariationData: [],
    }
  }

  const { serie } = data

  const accumulatedData: ChartDataRow[] = serie.map((item) => ({
    period: item.periodo,
    precompromiso: item.precompromiso,
    compromiso: item.compromiso,
    facturado: item.facturado,
  }))

  const monthlyVariationData: ChartDataRow[] = []
  for (let i = 1; i < serie.length; i++) {
    const prevItem = serie[i - 1]
    const item = serie[i]

    const preMensual = item.precompromiso - prevItem.precompromiso
    const comMensual = item.compromiso - prevItem.compromiso
    const factMensual = item.facturado - prevItem.facturado

    const etiqueta = `${prevItem.periodo.slice(0, 3)} a ${item.periodo.slice(0, 3).toLowerCase()}`

    monthlyVariationData.push({
      period: etiqueta,
      precompromiso: Math.max(0, preMensual),
      compromiso: Math.max(0, comMensual),
      facturado: Math.max(0, factMensual),
    })
  }

  const ultimo = serie[serie.length - 1]
  const precompromisoAcumulado = ultimo.precompromiso
  const compromisoAcumulado = ultimo.compromiso
  const facturadoAcumulado = ultimo.facturado

  const ahorroProcesosConcursales = precompromisoAcumulado - compromisoAcumulado

  const porcentajeComprometido =
    precompromisoAcumulado > 0 ? compromisoAcumulado / precompromisoAcumulado : 0
  const porcentajeFacturado = compromisoAcumulado > 0 ? facturadoAcumulado / compromisoAcumulado : 0

  return {
    precompromisoAcumulado,
    compromisoAcumulado,
    facturadoAcumulado,
    ahorroProcesosConcursales,
    porcentajeComprometido,
    porcentajeFacturado,
    fechaCorte,
    cantidadTransacciones,
    accumulatedData,
    monthlyVariationData,
  }
}
