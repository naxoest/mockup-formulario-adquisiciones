import { z } from 'zod'

export const opcionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
})

export const opcionesResponseSchema = z.array(opcionSchema)

export const unidadSolicitanteResponseSchema = z.object({
  id: z.number().int().positive(),
  cr: z.number().int().positive(),
  nombre: z.string().min(1),
  tipo: opcionSchema,
  sedes: z.array(opcionSchema).min(1),
  activo: z.boolean(),
  solicitudes: z.number().int().nonnegative(),
  requerimientos: z.number().int().nonnegative(),
  registradoPor: z.string().min(1),
  fechaRegistro: z.iso.datetime({ local: true }),
})

const paginacionSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

const resumenUnidadesSchema = z.object({
  registros: z.number().int().nonnegative(),
  inactivos: z.number().int().nonnegative(),
})

export const paginaUnidadesSolicitantesResponseSchema = z.object({
  data: z.array(unidadSolicitanteResponseSchema),
  meta: paginacionSchema,
  resumen: resumenUnidadesSchema,
})
