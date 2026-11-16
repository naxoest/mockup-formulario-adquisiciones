import { z } from 'zod'

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const periodoSchema = z.object({
  desde: z.coerce.date().nullable(),
  hasta: z.coerce.date().nullable(),
})

const totalesSchema = z.object({
  registros: z.number(),
  ocValidas: z.number(),
  comprometido: z.number(),
  concentracionTop3: z.number(),
  tratoDirectoParticipacion: z.number(),
})

const puntoEvolucionSchema = z.object({
  mes: z.string(),
  comprometido: z.number(),
  facturado: z.number(),
})

const resumenTipoSchema = z.object({
  tipo: selectOptionSchema,
  registros: z.number(),
  comprometido: z.number(),
  participacion: z.number(),
})

const resumenModalidadSchema = z.object({
  modalidad: selectOptionSchema,
  registros: z.number(),
  comprometido: z.number(),
  participacion: z.number(),
})

const resumenUnidadSchema = z.object({
  unidad: selectOptionSchema,
  campus: selectOptionSchema,
  comprometido: z.number(),
  participacion: z.number(),
})

const resumenCampusSchema = z.object({
  campus: selectOptionSchema,
  comprometido: z.number(),
  participacion: z.number(),
})

export const reporteAdquisicionesResponseSchema = z.object({
  periodo: periodoSchema,
  totales: totalesSchema,
  evolucion: z.array(puntoEvolucionSchema),
  porTipo: z.array(resumenTipoSchema),
  porModalidad: z.array(resumenModalidadSchema),
  porUnidad: z.array(resumenUnidadSchema),
  porCampus: z.array(resumenCampusSchema),
})
