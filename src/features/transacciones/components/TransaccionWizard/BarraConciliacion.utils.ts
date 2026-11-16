import { formatCLP } from '@/utils/currency'
import type {
  ConciliacionAnual,
  ConciliacionSolicitud,
  EstadoConciliacion,
  ResultadoConciliacion,
} from '../../utils/conciliacion'

export const clasesSegmentoEstaOrden: Partial<Record<EstadoConciliacion, string>> = {
  ajustado: 'bg-primary-600',
  bajoCotizacion: 'bg-jade-500',
  sobreCotizacion: 'bg-primary-600',
}

export const clasesSegmentoOtrasOrdenes: Partial<Record<EstadoConciliacion, string>> = {
  ajustado: 'bg-primary-200',
  bajoCotizacion: 'bg-jade-200',
  sobreCotizacion: 'bg-primary-200',
}

export interface ResumenConciliacion {
  comprometido: string
  cotizado: string | null
  etiqueta: string
  valor: string
  clase: string
}

export function resumenDeConciliacion(fila: ResultadoConciliacion): ResumenConciliacion {
  const comprometido = formatCLP(fila.comprometido)
  const cotizado = fila.precomprometido !== null ? formatCLP(fila.precomprometido) : null
  const diferencia = fila.diferencia ?? 0

  if (fila.estado === 'ajustado') {
    return {
      comprometido,
      cotizado,
      etiqueta: 'Ajustado',
      valor: formatCLP(0),
      clase: 'text-primary-700',
    }
  }

  if (fila.estado === 'bajoCotizacion') {
    return {
      comprometido,
      cotizado,
      etiqueta: 'Por comprometer',
      valor: formatCLP(Math.abs(diferencia)),
      clase: 'text-jade-700',
    }
  }

  if (fila.estado === 'sobreCotizacion') {
    return {
      comprometido,
      cotizado,
      etiqueta: 'Excedido',
      valor: formatCLP(diferencia),
      clase: 'text-scarlet-700',
    }
  }

  if (fila.estado === 'sinComprometer') {
    return {
      comprometido,
      cotizado,
      etiqueta: 'Sin comprometer',
      valor: '—',
      clase: 'text-mercury-400',
    }
  }

  if (fila.estado === 'sinCotizacion') {
    return {
      comprometido,
      cotizado: null,
      etiqueta: 'Sin cotización',
      valor: '—',
      clase: 'text-saffron-700',
    }
  }

  return {
    comprometido,
    cotizado: null,
    etiqueta: 'Sin datos',
    valor: '—',
    clase: 'text-mercury-400',
  }
}

export function resumenTotal(
  precomprometido: number,
  comprometido: number,
): { etiqueta: string; valor: string; clase: string } {
  const diferencia = comprometido - precomprometido

  if (precomprometido === 0 && comprometido === 0) {
    return { etiqueta: 'Diferencia', valor: formatCLP(0), clase: 'text-mercury-400' }
  }

  if (diferencia === 0) {
    return { etiqueta: 'Ajustado', valor: formatCLP(0), clase: 'text-primary-700' }
  }

  if (diferencia < 0) {
    return {
      etiqueta: 'Por comprometer',
      valor: formatCLP(-diferencia),
      clase: 'text-jade-700',
    }
  }

  return { etiqueta: 'Excedido', valor: formatCLP(diferencia), clase: 'text-scarlet-700' }
}

export function aporteDeOrden(fila: ConciliacionAnual, indiceOrden: number): number {
  return fila.aportes.find((aporte) => aporte.indiceOrden === indiceOrden)?.monto ?? 0
}

export function textoOtrasOrdenes(fila: ConciliacionAnual, indiceOrden: number): string | null {
  const otras = fila.aportes.filter((aporte) => aporte.indiceOrden !== indiceOrden)
  const monto = otras.reduce((total, aporte) => total + aporte.monto, 0)

  if (otras.length === 0 || monto <= 0) {
    return null
  }

  return otras.length === 1
    ? `incluye ${formatCLP(monto)} de otra orden`
    : `incluye ${formatCLP(monto)} de ${otras.length} órdenes`
}

function aniosDe(fila: ConciliacionSolicitud): string[] {
  return fila.anios.flatMap((anual) => (anual.anio === null ? [] : [anual.anio]))
}

export function textoAnios(fila: ConciliacionSolicitud): string | null {
  const anios = aniosDe(fila)

  if (anios.length === 0) {
    return null
  }

  return `${anios.length === 1 ? 'Año' : 'Años'} ${anios.join(' · ')}`
}

export interface AvisoAnual {
  anio: string
  texto: string
  clase: string
}

export function avisosPorAnio(fila: ConciliacionSolicitud): AvisoAnual[] {
  const anuales = fila.anios.filter(
    (anual): anual is ConciliacionAnual & { anio: string } => anual.anio !== null,
  )

  if (anuales.length < 2 || anuales.every((anual) => anual.precomprometido === null)) {
    return []
  }

  return anuales.flatMap((anual): AvisoAnual[] => {
    const { anio } = anual

    if (anual.estado === 'sobreCotizacion') {
      return [
        {
          anio,
          texto: `${anio}: excede su cotización en ${formatCLP(anual.diferencia ?? 0)}`,
          clase: 'text-scarlet-700',
        },
      ]
    }

    if (anual.estado === 'sinCotizacion') {
      return [
        {
          anio,
          texto: `${anio}: ${formatCLP(anual.comprometido)} comprometidos sin cotización`,
          clase: 'text-saffron-700',
        },
      ]
    }

    return []
  })
}
