import type { SelectOption } from '@/types/select'

export interface UnidadSolicitante {
  id: number
  cr: number
  nombre: string
  tipo: SelectOption
  sedes: SelectOption[]
  activo: boolean
  solicitudes: number
  requerimientos: number
  registradoPor: string
  fechaRegistro: string
}

export interface PaginacionUnidades {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ResumenUnidades {
  registros: number
  inactivos: number
}

export interface PaginaUnidadesSolicitantes {
  data: UnidadSolicitante[]
  meta: PaginacionUnidades
  resumen: ResumenUnidades
}
