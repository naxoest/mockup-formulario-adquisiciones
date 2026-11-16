import { z } from 'zod'

const fechaCivil = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const busquedaRankingUnidadesSchema = z.object({
  campus: z.array(z.string()).optional().catch(undefined),
  desde: fechaCivil.optional().catch(undefined),
  hasta: fechaCivil.optional().catch(undefined),
})
