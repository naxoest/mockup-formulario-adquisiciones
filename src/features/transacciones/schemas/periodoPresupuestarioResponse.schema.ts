import { z } from 'zod'

export const periodoPresupuestarioResponseSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  anio: z.number().int(),
  enCurso: z.boolean().default(false),
})

export const periodosPresupuestariosResponseSchema = z.array(periodoPresupuestarioResponseSchema)
