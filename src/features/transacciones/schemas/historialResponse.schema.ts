import { z } from 'zod'
import { analistasTransaccionResponseSchema } from '@/features/transacciones/schemas/analistaResponse.schema'
import { fechaCivilSchema } from '@/features/transacciones/schemas/primitivos.schema'
import { pasoProcesoSchema } from '@/features/transacciones/schemas/transaccionResponse.schema'

const fechaSchema = z.string().refine((valor) => !Number.isNaN(Date.parse(valor)), {
  message: 'La fecha no es una marca temporal válida',
})

const tonoEventoSchema = z.enum(['registrado', 'enCurso', 'logrado', 'espera', 'detenido'])

const tipoEntidadSchema = z.enum(['solicitud', 'ordenDeCompra', 'factura'])

const referenciaEntidadSchema = z.object({
  tipo: tipoEntidadSchema,
  id: z.number().int().positive(),
  codigo: z.string(),
})

const transicionEstadoSchema = z.object({
  anterior: z.string().nullable(),
  posterior: z.string(),
  tono: tonoEventoSchema,
})

const contextoEventoSchema = z.object({
  unidad: z.object({ nombre: z.string() }).optional(),
  campus: z.string().optional(),
  proveedor: z.string().optional(),
  relacionadas: z.array(referenciaEntidadSchema).optional(),
})

const eventoEntidadSchema = z.object({
  clase: z.literal('evento'),
  id: z.string(),
  fecha: fechaSchema,
  entidad: referenciaEntidadSchema,
  contexto: contextoEventoSchema,
  titulo: z.string(),
  monto: z.number().nullable(),
  transicion: transicionEstadoSchema,
  observacion: z.string(),
  autor: z.string(),
})

const hitoTransaccionSchema = z.object({
  clase: z.literal('hito'),
  id: z.string(),
  fecha: fechaSchema,
  estado: z.string(),
  explicacion: z.string(),
})

const registroBitacoraSchema = z.object({
  clase: z.literal('registro'),
  id: z.string(),
  fecha: fechaSchema,
  titulo: z.string(),
  observacion: z.string(),
  autor: z.string(),
})

const pasoHistorialBaseSchema = z.object({
  clase: z.literal('paso'),
  id: z.string(),
  fecha: fechaSchema,
  paso: pasoProcesoSchema,
  titulo: z.string(),
  autor: z.string(),
})

const pasoHistorialSchema = z.discriminatedUnion('accion', [
  pasoHistorialBaseSchema.extend({
    accion: z.literal('registrado'),
    fechaHecho: fechaCivilSchema,
    observacion: z.string().nullable(),
  }),
  pasoHistorialBaseSchema.extend({
    accion: z.literal('deshecho'),
    fechaHecho: z.null(),
    observacion: z.string(),
  }),
])

const eventoHistorialSchema = z.discriminatedUnion('clase', [
  eventoEntidadSchema,
  hitoTransaccionSchema,
  registroBitacoraSchema,
  pasoHistorialSchema,
])

const cabeceraHistorialSchema = z.object({
  codigo: z.string(),
  nombre: z.string().min(1),
  linkCarpetaAntecedentes: z.httpUrl().nullable(),
  modalidad: z.string(),
  totalSolicitudes: z.number().int().nonnegative(),
  totalOrdenes: z.number().int().nonnegative(),
  totalFacturas: z.number().int().nonnegative(),
  fechaApertura: fechaSchema,
  analistas: analistasTransaccionResponseSchema,
})

const situacionActualSchema = z.object({
  estado: z.string(),
  explicacion: z.string(),
  pendientes: z.array(
    z.object({
      id: z.string(),
      descripcion: z.string(),
    }),
  ),
})

const montoComparadoSchema = z.object({
  valor: z.number(),
  nota: z.string(),
})

const montosComparadosSchema = z.object({
  cotizadoVigente: montoComparadoSchema,
  comprometido: montoComparadoSchema,
  facturado: montoComparadoSchema,
})

const avanceTransaccionSchema = z.object({
  etapas: z.array(z.string()),
  actual: z.string(),
})

export const historialResponseSchema = z.object({
  cabecera: cabeceraHistorialSchema,
  situacion: situacionActualSchema,
  montos: montosComparadosSchema,
  avance: avanceTransaccionSchema,
  eventos: z.array(eventoHistorialSchema),
})
