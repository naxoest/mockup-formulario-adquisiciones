import { z } from 'zod'

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const unidadPerfilSchema = z.object({
  id: z.number().int(),
  nombre: z.string(),
  cr: z.number().int(),
  tipo: selectOptionSchema,
  sedes: z.array(selectOptionSchema).min(1),
})

const totalesPerfilSchema = z.object({
  registros: z.number().int(),
  ocValidas: z.number().int(),
  ordenes: z.number().int(),
  comprometido: z.number(),
  comprometidoGlobal: z.number(),
  participacionGlobal: z.number(),
  precomprometido: z.number(),
})

const resumenModalidadSchema = z.object({
  modalidad: selectOptionSchema,
  registros: z.number(),
  comprometido: z.number(),
  participacion: z.number(),
})

const puntoEvolucionSchema = z.object({
  mes: z.string(),
  comprometido: z.number(),
  facturado: z.number(),
})

const registroDetalleSchema = z.object({
  id: z.number().int(),
  transaccionId: z.number().int(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tipo: selectOptionSchema,
  modalidad: selectOptionSchema,
  ordenDeCompra: z.object({
    id: z.number().int(),
    codigo: z.string(),
    estado: z.string(),
  }),
  monto: z.number(),
  estadoSolicitud: selectOptionSchema.nullable(),
  estadoEvaluacion: selectOptionSchema.nullable(),
  observaciones: z.string().nullable(),
})

export const perfilUnidadResponseSchema = z.object({
  unidad: unidadPerfilSchema,
  totales: totalesPerfilSchema,
  porModalidad: z.array(resumenModalidadSchema),
  evolucion: z.array(puntoEvolucionSchema),
  detalle: z.array(registroDetalleSchema),
})
