import { toCivilDate } from '@/utils/date'
import type { GestionMonitoreoValues } from '@/features/transacciones/schemas/gestionMonitoreo.schema'
import type {
  ActualizacionMonitoreo,
  FactoresCriticidad,
  FilaMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

export type ValoresInicialesGestion = Omit<GestionMonitoreoValues, keyof FactoresCriticidad> &
  Partial<FactoresCriticidad>

function aTextoOpcional(valor: string): string | null {
  const recortado = valor.trim()
  return recortado.length === 0 ? null : recortado
}

export function valoresIniciales(fila: FilaMonitoreo): ValoresInicialesGestion {
  const factores = fila.evaluacion?.factores

  return {
    impactoAcademico: factores?.impactoAcademico,
    urgenciaTemporal: factores?.urgenciaTemporal,
    exposicionInstitucional: factores?.exposicionInstitucional,
    riesgoOperacional: factores?.riesgoOperacional,
    proximaAccion: fila.proximaAccion ?? '',
    fechaProximaRevision: fila.fechaProximaRevision,
    bloqueadorPrincipal: fila.bloqueadorPrincipal?.value ?? '',
    escalarAJefatura: fila.escalarAJefatura,
    cerrado: fila.cerrado,
    observaciones: fila.observaciones ?? '',
  }
}

export function aActualizacion(valores: GestionMonitoreoValues): ActualizacionMonitoreo {
  return {
    factores: {
      impactoAcademico: valores.impactoAcademico,
      urgenciaTemporal: valores.urgenciaTemporal,
      exposicionInstitucional: valores.exposicionInstitucional,
      riesgoOperacional: valores.riesgoOperacional,
    },
    proximaAccion: aTextoOpcional(valores.proximaAccion),
    fechaProximaRevision:
      valores.fechaProximaRevision === null ? null : toCivilDate(valores.fechaProximaRevision),
    bloqueadorPrincipal: aTextoOpcional(valores.bloqueadorPrincipal),
    escalarAJefatura: valores.escalarAJefatura,
    cerrado: valores.cerrado,
    observaciones: aTextoOpcional(valores.observaciones),
  }
}
