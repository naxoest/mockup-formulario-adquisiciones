import { z } from 'zod'

export const CR_MAXIMO = 4294967295

const cr = z
  .number({ error: 'Ingrese el CR' })
  .int('Ingrese un CR sin decimales')
  .positive('Ingrese un CR mayor que cero')
  .max(CR_MAXIMO, `El CR no puede superar ${CR_MAXIMO}`)

const nombre = z.string().trim().min(1, 'Ingrese el nombre').max(255, 'Máximo 255 caracteres')

export const proyectoFormSchema = z.object({
  cr: cr.nullable().refine((valor): boolean => valor !== null, { error: 'Ingrese el CR' }),
  nombre,
})

export const proyectoRequestSchema = z.object({ cr, nombre })

export const proyectoEdicionSchema = proyectoRequestSchema.partial()

export type ProyectoFormValues = z.infer<typeof proyectoFormSchema>
export type ProyectoRequest = z.infer<typeof proyectoRequestSchema>
export type ProyectoEdicionRequest = z.infer<typeof proyectoEdicionSchema>
