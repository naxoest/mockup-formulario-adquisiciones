import type { TipoFormalizacionLicitacion } from '@/features/formularios/types/formularioAdquisicion.types'

export const VALOR_UTM_REFERENCIA_CLP = 67250
export const UMBRAL_SOLO_OC_UTM = 100
export const UMBRAL_CONTRATO_OBLIGATORIO_UTM = 1000
export const UMBRAL_GARANTIA_SERIEDAD_UTM = 5000
export const TOPE_CAUSAL_7B_UTM = 100
export const TOPE_PORCENTAJE_GARANTIA_SERIEDAD = 0.03
export const GARANTIA_MINIMA_LICITACION_MESES = 6
export const MULTA_DIARIA_ESTANDAR = 0.5
export const TOPE_DIAS_MULTA_ESTANDAR = 20
export const PLAZO_PAGO_ESTANDAR_DIAS = 30
export const TASA_IVA_CHILE = 0.19

export type TramoUtmLicitacion = 'menor_100' | 'entre_100_y_1000' | 'mayor_1000'

export interface ResumenPonderacionesInput {
  aplicaRequisitosFormales?: boolean
  ponderacionRequisitosFormales?: number | null
  aplicaPactoIntegridad?: boolean
  ponderacionPactoIntegridad?: number | null
  ponderacionPrecio?: number | null
  aplicaPlazoEntrega?: boolean
  ponderacionPlazoEntrega?: number | null
  aplicaExperiencia?: boolean
  ponderacionExperiencia?: number | null
  aplicaPlazoGarantia?: boolean
  ponderacionPlazoGarantia?: number | null
  otrosCriterios?: Array<{ ponderacion?: number | null }>
}

export interface LineaCotizacionCalculoInput {
  cantidad?: number | null
  precioUnitarioNeto?: number | null
}

export interface TotalesCotizacionTratoDirecto {
  neto: number
  iva: number
  total: number
}

export function calcularMontoUtm(
  montoClp: number | null,
  valorUtm = VALOR_UTM_REFERENCIA_CLP,
): number {
  if (montoClp === null || montoClp <= 0 || valorUtm <= 0) {
    return 0
  }
  return Number((montoClp / valorUtm).toFixed(2))
}

export function obtenerTramoUtm(montoUtm: number): TramoUtmLicitacion {
  if (montoUtm < UMBRAL_SOLO_OC_UTM) {
    return 'menor_100'
  }
  if (montoUtm <= UMBRAL_CONTRATO_OBLIGATORIO_UTM) {
    return 'entre_100_y_1000'
  }
  return 'mayor_1000'
}

export function obtenerFormalizacionForzada(montoUtm: number): TipoFormalizacionLicitacion | null {
  const tramo = obtenerTramoUtm(montoUtm)
  if (tramo === 'menor_100') {
    return 'solo_oc'
  }
  if (tramo === 'mayor_1000') {
    return 'contrato_y_oc'
  }
  return null
}

export function obtenerMinimoComisionEvaluadora(montoUtm: number): number {
  return montoUtm > UMBRAL_CONTRATO_OBLIGATORIO_UTM ? 3 : 1
}

export function calcularMaximoGarantiaSeriedadClp(montoClp: number | null): number {
  if (montoClp === null || montoClp <= 0) {
    return 0
  }
  return Math.floor(montoClp * TOPE_PORCENTAJE_GARANTIA_SERIEDAD)
}

export function contarCriteriosTecnicosActivos(criterios: ResumenPonderacionesInput): number {
  const activos = [
    Boolean(criterios.aplicaPlazoEntrega),
    Boolean(criterios.aplicaExperiencia),
    Boolean(criterios.aplicaPlazoGarantia),
  ].filter(Boolean).length

  return activos + (criterios.otrosCriterios?.length ?? 0)
}

export function sumarPonderacionesCriterios(criterios: ResumenPonderacionesInput): number {
  let total = criterios.ponderacionPrecio ?? 0

  if (criterios.aplicaRequisitosFormales) {
    total += criterios.ponderacionRequisitosFormales ?? 0
  }
  if (criterios.aplicaPactoIntegridad) {
    total += criterios.ponderacionPactoIntegridad ?? 0
  }
  if (criterios.aplicaPlazoEntrega) {
    total += criterios.ponderacionPlazoEntrega ?? 0
  }
  if (criterios.aplicaExperiencia) {
    total += criterios.ponderacionExperiencia ?? 0
  }
  if (criterios.aplicaPlazoGarantia) {
    total += criterios.ponderacionPlazoGarantia ?? 0
  }

  for (const adicional of criterios.otrosCriterios ?? []) {
    total += adicional.ponderacion ?? 0
  }

  return Number(total.toFixed(2))
}

export function calcularTotalesCotizacionTratoDirecto(
  lineas: readonly LineaCotizacionCalculoInput[],
  afectoIva = true,
): TotalesCotizacionTratoDirecto {
  let neto = 0
  for (const linea of lineas) {
    const cantidad = linea.cantidad ?? 0
    const unitario = linea.precioUnitarioNeto ?? 0
    if (cantidad > 0 && unitario > 0) {
      neto += Math.round(cantidad * unitario)
    }
  }
  const iva = afectoIva ? Math.round(neto * TASA_IVA_CHILE) : 0
  return {
    neto,
    iva,
    total: neto + iva,
  }
}
