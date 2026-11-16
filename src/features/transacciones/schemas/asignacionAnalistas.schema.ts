import { z } from 'zod'

export const asignacionAnalistasFormSchema = z
  .object({
    principal: z.string(),
    apoyo: z.array(z.string()),
    observacion: z.string().max(200, 'La observación admite hasta 200 caracteres.'),
  })
  .refine((valores) => valores.principal === '' || !valores.apoyo.includes(valores.principal), {
    message: 'El analista principal no puede ser también analista de apoyo.',
    path: ['apoyo'],
  })

export type AsignacionAnalistasValues = z.infer<typeof asignacionAnalistasFormSchema>
