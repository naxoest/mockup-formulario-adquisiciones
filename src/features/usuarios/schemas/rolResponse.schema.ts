import { z } from 'zod'

export const rolResponseSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
})

export const rolesResponseSchema = z.array(rolResponseSchema)
