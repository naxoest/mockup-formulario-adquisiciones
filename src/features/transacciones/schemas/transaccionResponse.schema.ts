import { z } from 'zod'
import {
  estadoEvaluacionSchema,
  fechaCivilSchema,
} from '@/features/transacciones/schemas/primitivos.schema'
import {
  analistasTransaccionResponseSchema,
  participacionAnalistaSchema,
} from '@/features/transacciones/schemas/analistaResponse.schema'
import { resumenCriticidadResponseSchema } from '@/features/transacciones/schemas/monitoreoResponse.schema'

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const instanteSchema = z.string().refine((valor) => !Number.isNaN(Date.parse(valor)), {
  message: 'La marca temporal no es valida',
})

export const pasoProcesoSchema = z.enum([
  'presupuesto_solicitado',
  'presupuesto_asignado',
  'enviada_a_adquisiciones',
  'analista_asignado',
  'aprobada',
  'aprobada_con_observaciones',
  'subsanada',
  'publicada',
  'evaluada',
])

const estadoTransaccionSchema = z.enum([
  'en_cotizacion',
  'cotizada',
  'presupuesto_solicitado',
  'presupuesto_asignado',
  'enviada_a_adquisiciones',
  'analista_asignado',
  'aprobada',
  'aprobada_con_observaciones',
  'subsanada',
  'publicada',
  'evaluada',
  'facturada',
  'cerrada',
  'rechazada',
])

const estadoSolicitudSchema = z.enum([
  'enviada',
  'asignado',
  'en_proceso',
  'completada',
  'rechazada',
])

const estadoOrdenDeCompraSchema = z.enum([
  'enviada_a_proveedor',
  'aceptada',
  'recepcion_conforme',
  'cancelada',
])

const estadoFacturaSchema = z.enum(['pendiente', 'aceptada', 'rechazada'])

const sedeSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
})

const unidadSolicitanteSchema = z.object({
  id: z.number().int().positive(),
  cr: z.number().int().positive(),
  nombre: z.string().min(1),
  sedes: z.array(sedeSchema).min(1),
  tipo: z.string().min(1),
})

export const unidadesSolicitantesResponseSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    label: z.string().min(1),
    cr: z.number().int().positive(),
    activo: z.boolean(),
    sedes: z.array(sedeSchema).min(1),
  }),
)

const precompromisoSchema = z.object({
  anio: z.number().int(),
  monto: z.number().int().nonnegative(),
})

const solicitudSchema = z.object({
  id: z.number().int().positive(),
  estado: estadoSolicitudSchema.nullable(),
  estadoEvaluacion: estadoEvaluacionSchema.nullable(),
  tipoSolicitud: z.string().min(1),
  codigoSaserviSabienes: z.string().nullable(),
  financiamiento: z.string().nullable(),
  montoCotizacion: z.number().nullable(),
  precompromisos: z.array(precompromisoSchema),
  unidad: unidadSolicitanteSchema,
})

const montoOrdenDeCompraSchema = z.object({
  id: z.number().int().positive(),
  solicitudId: z.number().int().positive(),
  anio: z.number().int(),
  monto: z.number().positive(),
})

const ordenDeCompraSchema = z.object({
  id: z.number().int().positive(),
  codigo: z.string().min(1),
  fechaEmision: fechaCivilSchema,
  estado: estadoOrdenDeCompraSchema,
  monto: z.number().nonnegative(),
  montos: z.array(montoOrdenDeCompraSchema),
})

const montoFacturaSchema = z.object({
  id: z.number().int().positive(),
  montoOrdenCompraId: z.number().int().positive(),
  monto: z.number().positive(),
})

const facturaSchema = z.object({
  id: z.number().int().positive(),
  folio: z.number().int().positive(),
  estado: estadoFacturaSchema,
  fechaEmision: fechaCivilSchema,
  monto: z.number().nonnegative(),
  montos: z.array(montoFacturaSchema),
})

const pasoAplicableSchema = z.object({
  paso: pasoProcesoSchema,
  etiqueta: z.string().min(1),
})

const procesoSchema = z.object({
  pasoActual: pasoProcesoSchema.nullable(),
  siguientesPermitidos: z.array(
    pasoAplicableSchema.extend({
      requiereObservacion: z.boolean(),
    }),
  ),
  pasosAplicables: z.array(pasoAplicableSchema),
  registrados: z.array(
    pasoAplicableSchema.extend({
      fecha: fechaCivilSchema,
      observacion: z.string().nullable(),
      registradoEn: instanteSchema,
      autor: z.string(),
    }),
  ),
  motivoBloqueo: z
    .object({
      codigo: z.string(),
      mensaje: z.string(),
    })
    .nullable(),
})

export const transaccionResponseSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
  linkCarpetaAntecedentes: z.httpUrl().nullable(),
  fecha: fechaCivilSchema,
  modalidad: z.string().min(1),
  estado: estadoTransaccionSchema.nullable(),
  montoCotizado: z.number().nonnegative(),
  montoComprometido: z.number().nonnegative(),
  montoFacturado: z.number().nonnegative(),
  creadaEn: instanteSchema,
  confirmadaEn: instanteSchema.nullable(),
  solicitudes: z.array(solicitudSchema),
  ordenesDeCompra: z.array(ordenDeCompraSchema),
  facturas: z.array(facturaSchema),
  proceso: procesoSchema,
})

export const transaccionListadoSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
  linkCarpetaAntecedentes: z.httpUrl().nullable(),
  fecha: fechaCivilSchema,
  modalidad: selectOptionSchema,
  estado: selectOptionSchema.nullable(),
  tipos: z.array(selectOptionSchema),
  montoCotizado: z.number().nonnegative(),
  montoComprometido: z.number().nonnegative(),
  montoFacturado: z.number().nonnegative(),
  solicitudes: z.object({
    total: z.number().int().nonnegative(),
    carreras: z.number().int().nonnegative(),
    unidades: z.number().int().nonnegative(),
  }),
  analistas: analistasTransaccionResponseSchema,
  miParticipacion: participacionAnalistaSchema.nullable(),
  criticidad: resumenCriticidadResponseSchema.nullable(),
})

const paginacionSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const paginaTransaccionesSchema = z.object({
  data: z.array(transaccionListadoSchema),
  meta: paginacionSchema,
})
