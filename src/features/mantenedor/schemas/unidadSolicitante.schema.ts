import { z } from 'zod'

export const CR_MAXIMO = 4294967295

const cr = z
  .number({ error: 'Ingrese el CR' })
  .int('Ingrese un CR sin decimales')
  .positive('Ingrese un CR mayor que cero')
  .max(CR_MAXIMO, `El CR no puede superar ${CR_MAXIMO}`)

const nombre = z.string().trim().min(1, 'Ingrese el nombre').max(255, 'Máximo 255 caracteres')

const tipo = z.string().min(1, 'Seleccione el tipo')

const sedes = z.array(z.string().min(1)).min(1, 'Seleccione al menos una sede')

export const unidadSolicitanteFormSchema = z.object({
  cr: cr.nullable().refine((valor): boolean => valor !== null, { error: 'Ingrese el CR' }),
  nombre,
  tipo,
  sedes,
})

export const unidadSolicitanteRequestSchema = z.object({ cr, nombre, tipo, sedes })

export const unidadSolicitanteEdicionSchema = unidadSolicitanteRequestSchema.partial()

export type UnidadSolicitanteFormValues = z.infer<typeof unidadSolicitanteFormSchema>
export type UnidadSolicitanteRequest = z.infer<typeof unidadSolicitanteRequestSchema>
