import { z } from 'zod'

export const portadaPerfilResponseSchema = z.object({
  portada: z.string(),
})
