import { z } from 'zod'

export const SECCIONES_MANTENEDOR = ['carreras-y-unidades', 'proyectos'] as const

export type SeccionMantenedor = (typeof SECCIONES_MANTENEDOR)[number]

export const SECCION_INICIAL: SeccionMantenedor = 'carreras-y-unidades'

export const busquedaMantenedorSchema = z.object({
  seccion: z.enum(SECCIONES_MANTENEDOR).optional().catch(undefined),
})
