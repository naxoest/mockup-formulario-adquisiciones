import type {
  FilaMonitoreo,
  NivelSeguimiento,
  RegistroMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

const MILISEGUNDOS_POR_DIA = 86_400_000

export const UMBRAL_SEGUIMIENTO_CRITICO_EN_DIAS = 3
export const UMBRAL_SEGUIMIENTO_ATENCION_EN_DIAS = 2

function aMedianocheUtc(fecha: Date): number {
  return Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

export function calcularDiasCorridos(desde: Date, hasta: Date): number {
  return (aMedianocheUtc(hasta) - aMedianocheUtc(desde)) / MILISEGUNDOS_POR_DIA
}

export function clasificarSeguimiento(diasSinGestion: number | null): NivelSeguimiento {
  if (diasSinGestion === null) return 'sinRegistro'
  if (diasSinGestion >= UMBRAL_SEGUIMIENTO_CRITICO_EN_DIAS) return 'critico'
  if (diasSinGestion >= UMBRAL_SEGUIMIENTO_ATENCION_EN_DIAS) return 'atencion'
  return 'normal'
}

export function construirFilaMonitoreo(
  registro: RegistroMonitoreo,
  referencia: Date,
): FilaMonitoreo {
  const diasSinGestion =
    registro.ultimoMovimiento === null
      ? null
      : calcularDiasCorridos(registro.ultimoMovimiento, referencia)

  const diasHastaRevision =
    registro.fechaProximaRevision === null
      ? null
      : calcularDiasCorridos(referencia, registro.fechaProximaRevision)

  return {
    ...registro,
    indice: registro.evaluacion === null ? null : registro.evaluacion.indice,
    nombreAnalista: registro.analista?.nombre ?? null,
    etiquetaBloqueador: registro.bloqueadorPrincipal?.label ?? null,
    diasSinGestion,
    nivelSeguimiento: clasificarSeguimiento(diasSinGestion),
    diasHastaRevision,
  }
}

export function ordenarPorCriticidad(filas: FilaMonitoreo[]): FilaMonitoreo[] {
  return [...filas].sort((a, b) => {
    if (a.evaluacion === null && b.evaluacion === null) return 0
    if (a.evaluacion === null) return -1
    if (b.evaluacion === null) return 1
    return b.evaluacion.indice - a.evaluacion.indice
  })
}
