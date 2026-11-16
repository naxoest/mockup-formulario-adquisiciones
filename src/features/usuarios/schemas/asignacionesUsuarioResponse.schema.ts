import { z } from 'zod'

export const asignacionesUsuarioResponseSchema = z.object({
  principal: z.number().int().nonnegative(),
  apoyo: z.number().int().nonnegative(),
})
