import { z } from 'zod'
import {
  enlaceCarpetaFormularioSchema,
  nombreTransaccionSchema,
} from '@/features/transacciones/schemas/primitivos.schema'

export const precompromisoFormSchema = z.object({
  anio: z.string({ error: 'Seleccione un año' }).min(1, 'Seleccione un año'),
  monto: z
    .number({ error: 'Ingrese un monto' })
    .int('Ingrese un monto sin decimales')
    .nonnegative('Ingrese un monto mayor o igual a cero'),
})

interface AnioRepetido {
  indice: number
  anio: string
}

function aniosRepetidos(filas: Array<{ anio: string }>): AnioRepetido[] {
  const vistos = new Set<string>()
  const repetidos: AnioRepetido[] = []

  filas.forEach((fila, indice) => {
    if (fila.anio.length === 0) {
      return
    }

    if (vistos.has(fila.anio)) {
      repetidos.push({ indice, anio: fila.anio })
    }

    vistos.add(fila.anio)
  })

  return repetidos
}

export const precompromisosFormSchema = z
  .array(precompromisoFormSchema)
  .superRefine((precompromisos, ctx) => {
    for (const { indice, anio } of aniosRepetidos(precompromisos)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Este año ya está registrado en la solicitud',
        path: [indice, 'anio'],
        input: anio,
      })
    }
  })

export const unidadSolicitanteSchema = z.object({
  id: z.number().nullable(),
  unidadId: z
    .number()
    .int()
    .positive()
    .nullable()
    .refine((valor) => valor !== null, { message: 'Seleccione una unidad solicitante' }),
  claveFormulario: z.string().min(1),
  tipo: z.string().min(1, 'Ingrese un tipo'),
  tipoSolicitud: z.string().min(1, 'Seleccione un tipo de solicitud'),
  codigoSaserviSabienes: z
    .string()
    .max(50, 'Ingrese hasta 50 dígitos')
    .regex(/^[0-9]*$/, 'Ingrese solo dígitos'),
  financiamiento: z.string().nullable(),
  nombre: z.string().min(1, 'Ingrese el nombre'),
  campus: z.string(),
  cr: z.number().optional(),
  precompromisos: precompromisosFormSchema,
})

export const montoAnualOrdenDeCompraSchema = z.object({
  anio: z.string({ error: 'Seleccione un año' }).min(1, 'Seleccione un año'),
  monto: z.number({ error: 'Ingrese un monto' }).min(1, 'Ingrese un monto'),
})

export const solicitanteOrdenDeCompraSchema = z.object({
  claveFormulario: z.string().min(1, 'Seleccione una solicitud'),
  montos: z
    .array(montoAnualOrdenDeCompraSchema)
    .min(1, 'Agregue al menos un año')
    .superRefine((montos, ctx) => {
      for (const { indice, anio } of aniosRepetidos(montos)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Este año ya está registrado para la solicitud en esta orden',
          path: [indice, 'anio'],
          input: anio,
        })
      }
    }),
})

export const ordenDeCompraSchema = z.object({
  id: z.number().nullable(),
  claveFormulario: z.string().min(1),
  codigo: z.string().min(1, 'Ingrese el código'),
  fechaEmision: z.date({ error: 'Seleccione la fecha de emisión' }),
  solicitantes: z.array(solicitanteOrdenDeCompraSchema).min(1, 'Seleccione al menos 1 solicitante'),
})

export const montoFacturaSchema = z.object({
  montoOrdenCompraId: z.string().min(1, 'Seleccione el monto de orden a facturar'),
  monto: z.number().min(1, 'Ingrese un monto'),
})

export const facturaSchema = z.object({
  id: z.number().nullable(),
  folio: z.number().int().positive('Ingrese un folio válido'),
  fechaEmision: z.date({ error: 'Seleccione la fecha de emisión' }),
  montos: z.array(montoFacturaSchema).min(1, 'Agregue al menos una línea'),
})

export const transaccionSchema = z.object({
  id: z.number().nullable(),
  nombre: nombreTransaccionSchema,
  linkCarpetaAntecedentes: enlaceCarpetaFormularioSchema,
  modalidad: z.string().min(1, 'Seleccione una modalidad'),
  fecha: z.date({ error: 'Seleccione una fecha' }),
  solicitantes: z
    .array(unidadSolicitanteSchema)
    .min(1, 'Agregue al menos un solicitante')
    .max(8, 'Máximo 8 solicitantes'),
  ordenesDeCompra: z.array(ordenDeCompraSchema),
  facturas: z.array(facturaSchema),
})

export type TransaccionValues = z.infer<typeof transaccionSchema>
