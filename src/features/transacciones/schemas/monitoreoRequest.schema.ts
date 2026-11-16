import { z } from 'zod'
import { fechaCivilSchema } from './primitivos.schema'

const valorFactorSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

const factoresCriticidadRequestSchema = z.object({
  impactoAcademico: valorFactorSchema,
  urgenciaTemporal: valorFactorSchema,
  exposicionInstitucional: valorFactorSchema,
  riesgoOperacional: valorFactorSchema,
})

export const actualizacionMonitoreoRequestSchema = z.strictObject({
  factores: factoresCriticidadRequestSchema.optional(),
  proximaAccion: z.string().nullable().optional(),
  fechaProximaRevision: fechaCivilSchema.nullable().optional(),
  bloqueadorPrincipal: z.string().nullable().optional(),
  escalarAJefatura: z.boolean().optional(),
  cerrado: z.boolean().optional(),
  observaciones: z.string().nullable().optional(),
})
