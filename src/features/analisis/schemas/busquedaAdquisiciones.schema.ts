import { z } from 'zod'

const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const busquedaAdquisicionesSchema = z.object({
  desde: fechaIso.optional().catch(undefined),
  hasta: fechaIso.optional().catch(undefined),
  titulo: z.string().max(160).optional().catch(undefined),
  etiquetaPeriodo: z.string().max(80).optional().catch(undefined),
})
