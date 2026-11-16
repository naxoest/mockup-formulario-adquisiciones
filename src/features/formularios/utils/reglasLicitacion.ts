import type {
  CriteriosEvaluacionLicitacion,
  TipoFormalizacionLicitacion,
} from '@/features/formularios/types/formularioAdquisicion.types'

export const VALOR_UTM_REFERENCIA_CLP = 67250
export const UMBRAL_SOLO_OC_UTM = 100
export const UMBRAL_CONTRATO_OBLIGATORIO_UTM = 1000
export const GARANTIA_MINIMA_LICITACION_MESES = 6
export const MULTA_DIARIA_ESTANDAR = 0.5
export const TOPE_DIAS_MULTA_ESTANDAR = 20
export const PLAZO_PAGO_ESTANDAR_DIAS = 30

export type TramoUtmLicitacion = 'menor_100' | 'entre_100_y_1000' | 'mayor_1000'

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

export function sumarPonderacionesCriterios(
  criterios: Partial<
    Record<
      keyof Pick<
        CriteriosEvaluacionLicitacion,
        | 'ponderacionAdministrativa'
        | 'ponderacionEconomica'
        | 'ponderacionPlazoEntrega'
        | 'ponderacionExperiencia'
        | 'ponderacionGarantia'
      >,
      number | null | undefined
    >
  >,
): number {
  const valores = [
    criterios.ponderacionAdministrativa,
    criterios.ponderacionEconomica,
    criterios.ponderacionPlazoEntrega,
    criterios.ponderacionExperiencia,
    criterios.ponderacionGarantia,
  ]
  return valores.reduce<number>((acumulado, actual) => acumulado + (actual ?? 0), 0)
}
