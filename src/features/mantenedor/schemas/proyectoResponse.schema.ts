import { z } from 'zod'

export const proyectoResponseSchema = z.object({
  id: z.number().int().positive(),
  cr: z.number().int().positive(),
  nombre: z.string().min(1),
  activo: z.boolean(),
  solicitudes: z.number().int().nonnegative(),
  registradoPor: z.string().min(1),
  fechaRegistro: z.iso.datetime({ local: true }),
})

const paginacionSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

const resumenProyectosSchema = z.object({
  registros: z.number().int().nonnegative(),
  inactivos: z.number().int().nonnegative(),
})

export const paginaProyectosResponseSchema = z.object({
  data: z.array(proyectoResponseSchema),
  meta: paginacionSchema,
  resumen: resumenProyectosSchema,
})
