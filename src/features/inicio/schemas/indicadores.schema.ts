import { z } from 'zod'

export const elementoSerieSchema = z.object({
  periodo: z.string(),
  precompromiso: z.number(),
  compromiso: z.number(),
  facturado: z.number(),
})

export const resumenPresupuestarioSchema = z
  .object({
    fechaCorte: z.string(),
    serie: z.array(elementoSerieSchema).default([]),
    cantidadTransacciones: z.number().int(),
  })
  .transform((data) => ({
    fechaCorte: data.fechaCorte ?? '',
    serie: data.serie,
    cantidadTransacciones: data.cantidadTransacciones,
  }))

export const indicadores = resumenPresupuestarioSchema

export type ElementoSerie = z.infer<typeof elementoSerieSchema>
export type ResumenPresupuestario = z.infer<typeof resumenPresupuestarioSchema>
export type indicadoresValues = ResumenPresupuestario
