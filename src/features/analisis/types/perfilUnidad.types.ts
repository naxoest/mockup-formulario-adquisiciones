import type { z } from 'zod'
import type { perfilUnidadResponseSchema } from '@/features/analisis/schemas/perfilUnidadResponse.schema'

export type PerfilUnidad = z.infer<typeof perfilUnidadResponseSchema>
export type UnidadPerfil = PerfilUnidad['unidad']
export type TotalesPerfilUnidad = PerfilUnidad['totales']
export type RegistroDetalleUnidad = PerfilUnidad['detalle'][number]

export interface FilaDetalleUnidad {
  id: number
  transaccionId: number
  fecha: string
  tipo: string
  tipoCodigo: string
  modalidad: string
  modalidadCodigo: string
  ordenDeCompra: string
  ordenCancelada: boolean
  monto: number
  estado: string | null
  estadoCodigo: string | null
  evaluacion: string | null
  observaciones: string | null
}
