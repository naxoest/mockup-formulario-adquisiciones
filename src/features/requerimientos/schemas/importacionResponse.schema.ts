import { z } from 'zod'
import { cambioSchema } from '@/features/requerimientos/schemas/eventoResponse.schema'
import {
  identificadorSchema,
  instanteLocalSchema,
} from '@/features/requerimientos/schemas/primitivos.schema'
import { solicitanteSchema } from '@/features/requerimientos/schemas/requerimientoResponse.schema'

const conteoSchema = z.number().int().nonnegative()

export const importacionResponseSchema = z.object({
  id: z.number().int().positive(),
  fecha: instanteLocalSchema,
  autor: z.string().min(1),
  solicitante: solicitanteSchema,
  nombreArchivo: z.string().min(1),
  estado: z.object({
    value: z.enum(['pendiente', 'confirmada', 'descartada']),
    label: z.string(),
  }),
  filasNuevas: conteoSchema,
  filasRestauradas: conteoSchema,
  filasConCambios: conteoSchema,
  filasSinCambios: conteoSchema,
  filasConErrores: conteoSchema,
  requerimientosEliminados: conteoSchema,
})

export const importacionesResponseSchema = z.array(importacionResponseSchema)

const filaRevisionSchema = z.object({
  fila: z.number().int().min(2),
  identificador: identificadorSchema,
  requerimientoId: z.number().int().positive().nullable(),
  materiales: z.string().min(1).nullable(),
  resultado: z.enum(['nueva', 'restaurada', 'con_cambios', 'sin_cambios', 'error']),
  errores: z.array(z.string().min(1)),
  cambios: z.array(cambioSchema),
})

const requerimientoPorEliminarSchema = z.object({
  requerimientoId: z.number().int().positive(),
  identificador: identificadorSchema,
  materiales: z.string().min(1),
})

export const revisionImportacionResponseSchema = importacionResponseSchema
  .extend({
    eliminaciones: z.array(requerimientoPorEliminarSchema),
    avisos: z.array(z.string().min(1)),
    filas: z.array(filaRevisionSchema),
  })
  .refine((revision) => revision.eliminaciones.length === revision.requerimientosEliminados, {
    message: 'La cantidad de requerimientos por eliminar no coincide con su detalle',
    path: ['eliminaciones'],
  })
