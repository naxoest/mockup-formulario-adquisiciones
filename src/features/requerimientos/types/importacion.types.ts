import type { CambioRequerimiento } from '@/features/requerimientos/types/evento.types'
import type { SolicitanteRequerimiento } from '@/features/requerimientos/types/requerimiento.types'

export type EstadoImportacion = 'pendiente' | 'confirmada' | 'descartada'

export interface OpcionEstadoImportacion {
  value: EstadoImportacion
  label: string
}

export interface Importacion {
  id: number
  fecha: string
  autor: string
  solicitante: SolicitanteRequerimiento
  nombreArchivo: string
  estado: OpcionEstadoImportacion
  filasNuevas: number
  filasRestauradas: number
  filasConCambios: number
  filasSinCambios: number
  filasConErrores: number
  requerimientosEliminados: number
}

export type ResultadoFila = 'nueva' | 'restaurada' | 'con_cambios' | 'sin_cambios' | 'error'

export interface FilaRevision {
  fila: number
  identificador: string
  requerimientoId: number | null
  materiales: string | null
  resultado: ResultadoFila
  errores: string[]
  cambios: CambioRequerimiento[]
}

export interface RequerimientoPorEliminar {
  requerimientoId: number
  identificador: string
  materiales: string
}

export interface RevisionImportacion extends Importacion {
  eliminaciones: RequerimientoPorEliminar[]
  avisos: string[]
  filas: FilaRevision[]
}
