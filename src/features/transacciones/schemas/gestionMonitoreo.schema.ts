import { z } from 'zod'

const factorSchema = z.union(
  [z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)],
  { error: 'Ingresa un número entero entre 1 y 5' },
)

export const gestionMonitoreoSchema = z.object({
  impactoAcademico: factorSchema,
  urgenciaTemporal: factorSchema,
  exposicionInstitucional: factorSchema,
  riesgoOperacional: factorSchema,
  proximaAccion: z.string(),
  fechaProximaRevision: z.date().nullable(),
  bloqueadorPrincipal: z.string(),
  escalarAJefatura: z.boolean(),
  cerrado: z.boolean(),
  observaciones: z.string(),
})

export type GestionMonitoreoValues = z.infer<typeof gestionMonitoreoSchema>
