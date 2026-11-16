import type { SelectOption } from '@/types/select'
import type {
  AnalistaReferencia,
  Transaccion,
} from '@/features/transacciones/types/transaccion.types'

export type NivelCriticidad = 'controlado' | 'atencion' | 'critico'

export type NivelSeguimiento = 'sinRegistro' | 'normal' | 'atencion' | 'critico'

export type ValorFactor = 1 | 2 | 3 | 4 | 5

export interface FactoresCriticidad {
  impactoAcademico: ValorFactor
  urgenciaTemporal: ValorFactor
  exposicionInstitucional: ValorFactor
  riesgoOperacional: ValorFactor
}

export type PesosCriticidad = Record<keyof FactoresCriticidad, number>

export interface EvaluacionCriticidad {
  factores: FactoresCriticidad
  pesos: PesosCriticidad
  indice: number
  nivel: NivelCriticidad
}

export type ResumenCriticidad = Pick<EvaluacionCriticidad, 'indice' | 'nivel'>

export interface RegistroMonitoreo {
  transaccionId: Transaccion['id']
  nombre: string
  analista: AnalistaReferencia | null
  evaluacion: EvaluacionCriticidad | null
  ultimoMovimiento: Date | null
  proximaAccion: string | null
  fechaProximaRevision: Date | null
  bloqueadorPrincipal: SelectOption | null
  escalarAJefatura: boolean
  cerrado: boolean
  observaciones: string | null
}

export interface ActualizacionMonitoreo {
  factores?: FactoresCriticidad
  proximaAccion?: string | null
  fechaProximaRevision?: string | null
  bloqueadorPrincipal?: string | null
  escalarAJefatura?: boolean
  cerrado?: boolean
  observaciones?: string | null
}

export interface FilaMonitoreo extends RegistroMonitoreo {
  indice: number | null
  nombreAnalista: string | null
  etiquetaBloqueador: string | null
  diasSinGestion: number | null
  nivelSeguimiento: NivelSeguimiento
  diasHastaRevision: number | null
}
