import { z } from 'zod'
import { opcionSchema } from './primitivos.schema'
import { analistaReferenciaResponseSchema } from './analistaResponse.schema'

const valorFactorSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

const fechaSchema = z
  .union([z.number(), z.string(), z.date()])
  .transform((valor) => {
    if (typeof valor === 'string' && SOLO_FECHA.test(valor)) {
      const [anio, mes, dia] = valor.split('-').map(Number)
      return new Date(anio, mes - 1, dia)
    }
    return valor
  })
  .pipe(z.coerce.date())

const factoresCriticidadResponseSchema = z.object({
  impactoAcademico: valorFactorSchema,
  urgenciaTemporal: valorFactorSchema,
  exposicionInstitucional: valorFactorSchema,
  riesgoOperacional: valorFactorSchema,
})

const pesoSchema = z.number().nonnegative()

const pesosCriticidadResponseSchema = z.object({
  impactoAcademico: pesoSchema,
  urgenciaTemporal: pesoSchema,
  exposicionInstitucional: pesoSchema,
  riesgoOperacional: pesoSchema,
})

const nivelCriticidadResponseSchema = z.enum(['critico', 'atencion', 'controlado'])

const evaluacionCriticidadResponseSchema = z.object({
  factores: factoresCriticidadResponseSchema,
  pesos: pesosCriticidadResponseSchema,
  indice: z.number().nonnegative(),
  nivel: nivelCriticidadResponseSchema,
})

export const resumenCriticidadResponseSchema = z.object({
  indice: z.number().nonnegative(),
  nivel: nivelCriticidadResponseSchema,
})

export const registroMonitoreoResponseSchema = z.object({
  transaccionId: z.number(),
  nombre: z.string(),
  analista: analistaReferenciaResponseSchema.nullable(),
  evaluacion: evaluacionCriticidadResponseSchema.nullable(),
  ultimoMovimiento: fechaSchema.nullable(),
  proximaAccion: z.string().nullable(),
  fechaProximaRevision: fechaSchema.nullable(),
  bloqueadorPrincipal: opcionSchema.nullable(),
  escalarAJefatura: z.boolean(),
  cerrado: z.boolean(),
  observaciones: z.string().nullable(),
})

export const monitoreoResponseSchema = z.array(registroMonitoreoResponseSchema)

export const bloqueadoresResponseSchema = z.array(opcionSchema)
