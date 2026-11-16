import { z } from 'zod'
import {
  fechaCivilSchema,
  instanteLocalSchema,
  opcionSchema,
  textoOpcionalSchema,
} from '@/features/requerimientos/schemas/primitivos.schema'
import { opcionEstadoRequerimientoSchema } from '@/features/requerimientos/schemas/requerimientoResponse.schema'

export const cambioSchema = z.discriminatedUnion('campo', [
  z.object({
    campo: z.enum(['materiales', 'descripcion', 'ordenDeCompra', 'observaciones', 'carpeta']),
    anterior: textoOpcionalSchema,
    nuevo: textoOpcionalSchema,
  }),
  z.object({
    campo: z.enum(['fechaMaximaLlegada', 'fechaLlegada']),
    anterior: fechaCivilSchema.nullable(),
    nuevo: fechaCivilSchema.nullable(),
  }),
  z.object({
    campo: z.literal('cantidad'),
    anterior: z.number().positive().nullable(),
    nuevo: z.number().positive().nullable(),
  }),
  z.object({
    campo: z.literal('estado'),
    anterior: opcionEstadoRequerimientoSchema.nullable(),
    nuevo: opcionEstadoRequerimientoSchema.nullable(),
  }),
  z.object({
    campo: z.literal('modalidad'),
    anterior: opcionSchema.nullable(),
    nuevo: opcionSchema.nullable(),
  }),
])

const eventoRequerimientoSchema = z
  .object({
    id: z.number().int().positive(),
    tipo: z.enum(['creacion', 'actualizacion', 'restauracion', 'eliminacion']),
    fecha: instanteLocalSchema,
    autor: z.string().min(1),
    origen: z.object({
      importacionId: z.number().int().positive(),
      fila: z.number().int().positive().nullable(),
      nombreArchivo: z.string().min(1),
    }),
    cambios: z.array(cambioSchema),
  })
  .refine((evento) => (evento.tipo === 'eliminacion') === (evento.origen.fila === null), {
    message: 'Solo los eventos de eliminación carecen de fila de origen',
    path: ['origen', 'fila'],
  })
  .refine((evento) => evento.tipo !== 'eliminacion' || evento.cambios.length === 0, {
    message: 'Un evento de eliminación no registra cambios',
    path: ['cambios'],
  })
  .refine(
    (evento) =>
      (evento.tipo !== 'creacion' && evento.tipo !== 'actualizacion') || evento.cambios.length > 0,
    {
      message: 'Los eventos de creación y actualización registran al menos un cambio',
      path: ['cambios'],
    },
  )

export const eventosRequerimientoResponseSchema = z.array(eventoRequerimientoSchema)
