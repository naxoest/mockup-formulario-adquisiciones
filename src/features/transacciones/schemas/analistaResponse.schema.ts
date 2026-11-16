import { z } from 'zod'

export const analistaReferenciaResponseSchema = z.object({
  run: z.number().int().positive(),
  nombre: z.string().min(1),
})

export const analistaAsignadoResponseSchema = z.object({
  nombre: z.string().min(1),
})

export const analistasTransaccionResponseSchema = z.object({
  principal: analistaAsignadoResponseSchema.nullable(),
  apoyo: z.array(analistaAsignadoResponseSchema),
})

export const participacionAnalistaSchema = z.enum(['principal', 'apoyo'])

export const analistasResponseSchema = z.array(analistaReferenciaResponseSchema)

export const asignacionAnalistasResponseSchema = z.object({
  principal: analistaReferenciaResponseSchema.nullable(),
  apoyo: z.array(analistaReferenciaResponseSchema),
})
