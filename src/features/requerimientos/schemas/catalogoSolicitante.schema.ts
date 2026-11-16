import { z } from 'zod'
import { opcionSchema } from '@/features/requerimientos/schemas/primitivos.schema'

export const opcionesCatalogoResponseSchema = z.array(opcionSchema)

export const unidadesSolicitantesResponseSchema = z.array(
  z.object({
    id: z.number().int().positive(),

    label: z.string().min(1),
    cr: z.number().int(),
    activo: z.boolean(),
  }),
)
