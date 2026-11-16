export interface Proyecto {
  id: number
  cr: number
  nombre: string
  activo: boolean
  solicitudes: number
  registradoPor: string
  fechaRegistro: string
}

export interface PaginacionProyectos {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ResumenProyectos {
  registros: number
  inactivos: number
}

export interface PaginaProyectos {
  data: Proyecto[]
  meta: PaginacionProyectos
  resumen: ResumenProyectos
}
