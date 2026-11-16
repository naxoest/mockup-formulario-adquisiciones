import type { PrecompromisoForm } from '@/features/transacciones/types/transaccion.types'

export interface PrecompromisoCompleto {
  anio: string
  monto: number
}

export function precompromisosCompletos(
  precompromisos: PrecompromisoForm[] | null | undefined,
): PrecompromisoCompleto[] {
  return (precompromisos ?? [])
    .filter(
      (precompromiso): precompromiso is PrecompromisoCompleto =>
        typeof precompromiso?.anio === 'string' &&
        precompromiso.anio.length > 0 &&
        typeof precompromiso.monto === 'number' &&
        Number.isFinite(precompromiso.monto),
    )
    .sort((a, b) => Number(a.anio) - Number(b.anio))
}

export function sumarPrecompromisos(
  precompromisos: PrecompromisoForm[] | null | undefined,
): number | null {
  const completos = precompromisosCompletos(precompromisos)

  if (completos.length === 0) {
    return null
  }

  return completos.reduce((total, precompromiso) => total + precompromiso.monto, 0)
}

interface ConPrecompromisos {
  precompromisos?: PrecompromisoForm[] | null
}

export function calcularMontoCotizacion(solicitantes: ConPrecompromisos[] | undefined): number {
  if (!solicitantes) {
    return 0
  }

  return solicitantes.reduce(
    (total, solicitante) => total + (sumarPrecompromisos(solicitante?.precompromisos) ?? 0),
    0,
  )
}

interface ConMontosAnuales {
  montos?: Array<{ monto?: number | null } | null> | null
}

export function calcularMontoOrdenDeCompra(solicitantes: ConMontosAnuales[] | undefined): number {
  if (!solicitantes) {
    return 0
  }

  return solicitantes.reduce(
    (total, solicitante) =>
      total +
      (solicitante?.montos ?? []).reduce((suma, fila) => {
        const valor = Number(fila?.monto)
        return suma + (Number.isFinite(valor) ? valor : 0)
      }, 0),
    0,
  )
}
