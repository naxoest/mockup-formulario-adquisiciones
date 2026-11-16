import { z } from 'zod'
import { identificadorSchema } from '@/features/requerimientos/schemas/primitivos.schema'

export const MAXIMO_FILAS_IMPORTACION = 1000

const valorCeldaSchema = z.union([z.string(), z.number(), z.null()])

const filaPlanillaSchema = z.object({
  fila: z.number().int().min(2),
  identificador: identificadorSchema,
  materiales: valorCeldaSchema,
  descripcion: valorCeldaSchema,
  cantidad: valorCeldaSchema,
  estado: valorCeldaSchema,
  modalidad: valorCeldaSchema,
  ordenDeCompra: valorCeldaSchema,
  fechaMaximaLlegada: valorCeldaSchema,
  fechaLlegada: valorCeldaSchema,
  observaciones: valorCeldaSchema,
  carpeta: valorCeldaSchema,
})

function sinRepetidos(valores: readonly (string | number)[]): boolean {
  return new Set(valores).size === valores.length
}

export const nuevaImportacionRequestSchema = z.object({
  solicitanteId: z.number().int().positive(),
  archivo: z.object({
    nombre: z.string().min(1),
    tamano: z.number().int().positive(),
    huella: z.string().regex(/^[0-9a-f]{64}$/, 'La huella debe ser un SHA-256 en hexadecimal'),
  }),
  filas: z
    .array(filaPlanillaSchema)
    .min(1, 'La planilla no tiene filas con datos')
    .max(MAXIMO_FILAS_IMPORTACION, `La planilla supera las ${MAXIMO_FILAS_IMPORTACION} filas`)
    .refine((filas) => sinRepetidos(filas.map((fila) => fila.fila)), {
      message: 'Los números de fila no pueden repetirse',
    })
    .refine((filas) => sinRepetidos(filas.map((fila) => fila.identificador)), {
      message: 'Los ítems no pueden repetirse',
    }),
})

export type ValorCelda = z.infer<typeof valorCeldaSchema>

export type NuevaImportacionRequest = z.infer<typeof nuevaImportacionRequestSchema>

export type FilaPlanillaRequest = NuevaImportacionRequest['filas'][number]
