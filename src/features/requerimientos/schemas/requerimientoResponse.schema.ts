import { z } from 'zod'
import {
  fechaCivilSchema,
  identificadorSchema,
  instanteLocalSchema,
  opcionSchema,
  textoOpcionalSchema,
} from '@/features/requerimientos/schemas/primitivos.schema'

const estadoRequerimientoSchema = z.enum([
  'comprado',
  'en_bodega',
  'no_comprado',
  'entregado',
  'desestimado',
])

export const opcionEstadoRequerimientoSchema = z.object({
  value: estadoRequerimientoSchema,
  label: z.string(),
})

export const solicitanteSchema = z.object({
  id: z.number().int().positive(),
  cr: z.number().int().positive(),
  nombre: z.string().min(1),
  sedes: z.array(opcionSchema).min(1),
  tipo: z.string().min(1),
})

const requerimientoSchema = z.object({
  id: z.number().int().positive(),
  identificador: identificadorSchema,
  solicitante: solicitanteSchema,
  materiales: z.string().min(1),
  descripcion: textoOpcionalSchema,
  cantidad: z.number().positive(),
  estado: opcionEstadoRequerimientoSchema,
  modalidad: opcionSchema.nullable(),
  ordenDeCompra: textoOpcionalSchema,
  fechaMaximaLlegada: fechaCivilSchema.nullable(),
  fechaLlegada: fechaCivilSchema.nullable(),
  observaciones: textoOpcionalSchema,
  carpeta: z.httpUrl().nullable(),
  actualizadoEn: instanteLocalSchema,
  eliminado: z.boolean(),
})

export const requerimientosResponseSchema = z.array(requerimientoSchema)

export const estadosRequerimientoResponseSchema = z.array(opcionEstadoRequerimientoSchema)
