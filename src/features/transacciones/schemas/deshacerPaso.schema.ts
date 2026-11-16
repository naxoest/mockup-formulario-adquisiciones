import { z } from 'zod'

export const deshacerPasoFormSchema = z.object({
  observacion: z.string().refine((valor) => valor.trim().length > 0, 'Ingrese el motivo'),
})

export type DeshacerPasoValues = z.infer<typeof deshacerPasoFormSchema>
