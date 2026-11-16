import { z } from 'zod'

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const unidadRankingSchema = z.object({
  id: z.number().int(),
  nombre: z.string(),
  cr: z.number().int(),
  tipo: selectOptionSchema,
  sedes: z.array(selectOptionSchema).min(1),
})

const resumenRankingUnidadSchema = z.object({
  posicion: z.number().int(),
  unidad: unidadRankingSchema,
  comprometido: z.number(),
  participacion: z.number(),
  ordenes: z.object({
    validas: z.number().int(),
    total: z.number().int(),
  }),
  modalidades: z.array(selectOptionSchema),
})

export const rankingUnidadesResponseSchema = z.object({
  totales: z.object({
    comprometido: z.number(),
  }),
  data: z.array(resumenRankingUnidadSchema),
})
