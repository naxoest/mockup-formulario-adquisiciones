import { z } from 'zod'
import {
  enlaceCarpetaSchema,
  estadoEvaluacionSchema,
  fechaCivilSchema,
  nombreTransaccionSchema,
} from '@/features/transacciones/schemas/primitivos.schema'

export const observacionOpcionalSchema = z.object({
  observacion: z.string().min(1).optional(),
})

export const observacionRequeridaSchema = z.object({
  observacion: z.string().min(1),
})

export const precompromisoSchema = z.object({
  anio: z.number().int(),
  monto: z.number().int().nonnegative(),
})

const codigoSaserviSabienesSchema = z.string().regex(/^[0-9]{1,50}$/)

export const solicitudCreacionSchema = z.object({
  unidadId: z.number().int().positive(),
  tipoSolicitud: z.string().min(1),
  codigoSaserviSabienes: codigoSaserviSabienesSchema.nullable().optional(),
  financiamiento: z.string().min(1).nullable().optional(),
  precompromisos: z.array(precompromisoSchema).optional(),
})

export const solicitudCreacionDirectaSchema = solicitudCreacionSchema.extend({
  observacion: z.string().min(1).optional(),
})

export const solicitudEdicionSchema = z.object({
  unidadId: z.number().int().positive().optional(),
  tipoSolicitud: z.string().min(1).optional(),
  codigoSaserviSabienes: codigoSaserviSabienesSchema.nullable().optional(),
  financiamiento: z.string().min(1).nullable().optional(),
  precompromisos: z.array(precompromisoSchema).optional(),
  estadoEvaluacion: estadoEvaluacionSchema.nullable().optional(),
  observacion: z.string().min(1).optional(),
})

export const montoOrdenDeCompraCreacionSchema = z.object({
  solicitudId: z.number().int().positive(),
  anio: z.number().int(),
  monto: z.number().positive(),
})

export const ordenDeCompraCreacionSchema = z.object({
  codigo: z.string().min(1),
  fechaEmision: fechaCivilSchema,
  montos: z.array(montoOrdenDeCompraCreacionSchema).min(1),
  observacion: z.string().min(1).optional(),
})

export const ordenDeCompraEdicionSchema = z.object({
  codigo: z.string().min(1),
  fechaEmision: fechaCivilSchema.optional(),
  observacion: z.string().min(1).optional(),
})

export const montosOrdenDeCompraSchema = z.object({
  montos: z.array(montoOrdenDeCompraCreacionSchema).min(1),
  observacion: z.string().min(1).optional(),
})

export const montoFacturaCreacionSchema = z.object({
  montoOrdenCompraId: z.number().int().positive(),
  monto: z.number().positive(),
})

export const facturaCreacionSchema = z.object({
  folio: z.number().int().positive(),
  fechaEmision: fechaCivilSchema,
  montos: z.array(montoFacturaCreacionSchema).min(1),
  observacion: z.string().min(1).optional(),
})

export const facturaEdicionSchema = z.object({
  folio: z.number().int().positive(),
  fechaEmision: fechaCivilSchema,
  observacion: z.string().min(1).optional(),
})

export const transaccionBorradorSchema = z.object({
  nombre: nombreTransaccionSchema,
  linkCarpetaAntecedentes: enlaceCarpetaSchema.nullable().optional(),
  modalidad: z.string().min(1),
  fecha: fechaCivilSchema,
  solicitudes: z.array(solicitudCreacionSchema).default([]),
  observacion: z.string().min(1).optional(),
})

export const transaccionEdicionSchema = z.object({
  nombre: nombreTransaccionSchema.optional(),
  linkCarpetaAntecedentes: enlaceCarpetaSchema.nullable().optional(),
  modalidad: z.string().min(1).optional(),
  fecha: fechaCivilSchema.optional(),
  observacion: z.string().min(1).optional(),
})

export const asignacionAnalistasSchema = z.object({
  principal: z.number().int().positive().nullable(),
  apoyo: z.array(z.number().int().positive()),
  observacion: z.string().min(1).optional(),
})

export const registrarPasoSchema = z.object({
  paso: z.string().min(1),
  fecha: fechaCivilSchema,
  observacion: z.string().trim().min(1).nullable(),
})

export const deshacerPasoSchema = z.object({
  paso: z.string().min(1),
  observacion: z.string().trim().min(1),
})

export type ObservacionOpcionalRequest = z.infer<typeof observacionOpcionalSchema>
export type ObservacionRequeridaRequest = z.infer<typeof observacionRequeridaSchema>
export type PrecompromisoRequest = z.infer<typeof precompromisoSchema>
export type SolicitudCreacionRequest = z.infer<typeof solicitudCreacionSchema>
export type SolicitudCreacionDirectaRequest = z.infer<typeof solicitudCreacionDirectaSchema>
export type SolicitudEdicionRequest = z.infer<typeof solicitudEdicionSchema>
export type MontoOrdenDeCompraCreacionRequest = z.infer<typeof montoOrdenDeCompraCreacionSchema>
export type OrdenDeCompraCreacionRequest = z.infer<typeof ordenDeCompraCreacionSchema>
export type OrdenDeCompraEdicionRequest = z.infer<typeof ordenDeCompraEdicionSchema>
export type MontosOrdenDeCompraRequest = z.infer<typeof montosOrdenDeCompraSchema>
export type MontoFacturaCreacionRequest = z.infer<typeof montoFacturaCreacionSchema>
export type FacturaCreacionRequest = z.infer<typeof facturaCreacionSchema>
export type FacturaEdicionRequest = z.infer<typeof facturaEdicionSchema>
export type TransaccionBorradorRequest = z.infer<typeof transaccionBorradorSchema>
export type TransaccionEdicionRequest = z.infer<typeof transaccionEdicionSchema>
export type AsignacionAnalistasRequest = z.infer<typeof asignacionAnalistasSchema>
export type RegistrarPasoRequest = z.infer<typeof registrarPasoSchema>
export type DeshacerPasoRequest = z.infer<typeof deshacerPasoSchema>
