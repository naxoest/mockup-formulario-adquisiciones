import type { SelectOption } from '@/types/select'

export type EstadoRequerimiento =
  | 'comprado'
  | 'en_bodega'
  | 'no_comprado'
  | 'entregado'
  | 'desestimado'

export interface OpcionEstadoRequerimiento {
  value: EstadoRequerimiento
  label: string
}

export interface SolicitanteRequerimiento {
  id: number
  cr: number
  nombre: string
  sedes: SelectOption[]
  tipo: string
}

export interface Requerimiento {
  id: number
  identificador: string
  solicitante: SolicitanteRequerimiento
  materiales: string
  descripcion: string | null
  cantidad: number
  estado: OpcionEstadoRequerimiento
  modalidad: SelectOption | null
  ordenDeCompra: string | null
  fechaMaximaLlegada: string | null
  fechaLlegada: string | null
  observaciones: string | null
  carpeta: string | null
  actualizadoEn: string
  eliminado: boolean
}
