import type { SelectOption } from '@/types/select'
import type { OpcionEstadoRequerimiento } from '@/features/requerimientos/types/requerimiento.types'

export type TipoEventoRequerimiento = 'creacion' | 'actualizacion' | 'restauracion' | 'eliminacion'

export type CampoTextoRequerimiento =
  | 'materiales'
  | 'descripcion'
  | 'ordenDeCompra'
  | 'observaciones'
  | 'carpeta'

export type CampoFechaRequerimiento = 'fechaMaximaLlegada' | 'fechaLlegada'

export interface CambioTexto {
  campo: CampoTextoRequerimiento
  anterior: string | null
  nuevo: string | null
}

export interface CambioFecha {
  campo: CampoFechaRequerimiento
  anterior: string | null
  nuevo: string | null
}

export interface CambioCantidad {
  campo: 'cantidad'
  anterior: number | null
  nuevo: number | null
}

export interface CambioEstado {
  campo: 'estado'
  anterior: OpcionEstadoRequerimiento | null
  nuevo: OpcionEstadoRequerimiento | null
}

export interface CambioModalidad {
  campo: 'modalidad'
  anterior: SelectOption | null
  nuevo: SelectOption | null
}

export type CambioRequerimiento =
  | CambioTexto
  | CambioFecha
  | CambioCantidad
  | CambioEstado
  | CambioModalidad

export type CampoRequerimiento = CambioRequerimiento['campo']

export interface OrigenEvento {
  importacionId: number
  fila: number | null
  nombreArchivo: string
}

export interface EventoRequerimiento {
  id: number
  tipo: TipoEventoRequerimiento
  fecha: string
  autor: string
  origen: OrigenEvento
  cambios: CambioRequerimiento[]
}
