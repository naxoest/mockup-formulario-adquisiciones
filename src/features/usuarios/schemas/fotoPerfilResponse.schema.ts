import { z } from 'zod'

export const fotoPerfilResponseSchema = z.object({
  fotoUrl: z.string(),
})
