import type { SelectOption } from '@/types/select'
import type { ResumenCriticidad } from '@/features/transacciones/types/monitoreo.types'

export type PasoProceso =
  | 'presupuesto_solicitado'
  | 'presupuesto_asignado'
  | 'enviada_a_adquisiciones'
  | 'analista_asignado'
  | 'aprobada'
  | 'aprobada_con_observaciones'
  | 'subsanada'
  | 'publicada'
  | 'evaluada'

export type EstadoTransaccion =
  | 'en_cotizacion'
  | 'cotizada'
  | PasoProceso
  | 'facturada'
  | 'cerrada'
  | 'rechazada'

export type EstadoSolicitud = 'enviada' | 'asignado' | 'en_proceso' | 'completada' | 'rechazada'

export type EstadoEvaluacion = 'sindefinir' | 'en_evaluacion' | 'evaluado' | 'norequiere'

export type EstadoOrdenDeCompra =
  | 'enviada_a_proveedor'
  | 'aceptada'
  | 'recepcion_conforme'
  | 'cancelada'

export type EstadoFactura = 'pendiente' | 'aceptada' | 'rechazada'

export interface Paginacion {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export type ParticipacionAnalista = 'principal' | 'apoyo'

export interface AnalistaReferencia {
  run: number
  nombre: string
}

export interface AnalistaAsignado {
  nombre: string
}

export interface AnalistasTransaccion {
  principal: AnalistaAsignado | null
  apoyo: AnalistaAsignado[]
}

export interface AsignacionAnalistas {
  principal: AnalistaReferencia | null
  apoyo: AnalistaReferencia[]
}

export interface UnidadSolicitante {
  id: number
  cr: number
  nombre: string
  sedes: SelectOption[]
  tipo: string
}

export interface Precompromiso {
  anio: number
  monto: number
}

export interface PeriodoPresupuestario {
  value: string
  label: string
  anio: number
  enCurso: boolean
}

export interface Solicitud {
  id: number
  estado: EstadoSolicitud | null
  estadoEvaluacion: EstadoEvaluacion | null
  tipoSolicitud: string
  codigoSaserviSabienes: string | null
  financiamiento: string | null
  montoCotizacion: number | null
  precompromisos: Precompromiso[]
  unidad: UnidadSolicitante
}

export interface MontoOrdenDeCompra {
  id: number
  solicitudId: number
  anio: number
  monto: number
}

export interface OrdenDeCompra {
  id: number
  codigo: string
  fechaEmision: string
  estado: EstadoOrdenDeCompra
  monto: number
  montos: MontoOrdenDeCompra[]
}

export interface MontoFactura {
  id: number
  montoOrdenCompraId: number
  monto: number
}

export interface Factura {
  id: number
  folio: number
  estado: EstadoFactura
  fechaEmision: string
  monto: number
  montos: MontoFactura[]
}

export interface PasoAplicable {
  paso: PasoProceso
  etiqueta: string
}

export interface SiguientePermitido extends PasoAplicable {
  requiereObservacion: boolean
}

export interface PasoRegistrado extends PasoAplicable {
  fecha: string
  observacion: string | null
  registradoEn: string
  autor: string
}

export interface MotivoBloqueoProceso {
  codigo: string
  mensaje: string
}

export interface ProcesoAdquisicion {
  pasoActual: PasoProceso | null
  siguientesPermitidos: SiguientePermitido[]
  pasosAplicables: PasoAplicable[]
  registrados: PasoRegistrado[]
  motivoBloqueo: MotivoBloqueoProceso | null
}

export interface Transaccion {
  id: number
  nombre: string
  linkCarpetaAntecedentes: string | null
  fecha: string
  modalidad: string
  estado: EstadoTransaccion | null
  montoCotizado: number
  montoComprometido: number
  montoFacturado: number
  creadaEn: string
  confirmadaEn: string | null
  solicitudes: Solicitud[]
  ordenesDeCompra: OrdenDeCompra[]
  facturas: Factura[]
  proceso: ProcesoAdquisicion
}

export interface ResumenSolicitudes {
  total: number
  carreras: number
  unidades: number
}

export interface TransaccionListado {
  id: number
  nombre: string
  linkCarpetaAntecedentes: string | null
  fecha: string
  modalidad: SelectOption
  estado: SelectOption | null
  tipos: SelectOption[]
  montoCotizado: number
  montoComprometido: number
  montoFacturado: number
  solicitudes: ResumenSolicitudes
  analistas: AnalistasTransaccion
  miParticipacion: ParticipacionAnalista | null
  criticidad: ResumenCriticidad | null
}

export interface PaginaTransacciones {
  data: TransaccionListado[]
  meta: Paginacion
}

export interface PrecompromisoForm {
  anio: string | null
  monto: number | null
}

export interface UnidadSolicitanteForm {
  id: number | null
  unidadId: number | null
  claveFormulario: string
  tipo: string
  tipoSolicitud: string
  codigoSaserviSabienes: string
  financiamiento: string | null
  nombre: string
  campus: string
  cr: number
  precompromisos: PrecompromisoForm[]
}

export interface SolicitudDisponible {
  claveFormulario: string
  ordinal: number
  tipo: string
  unidad: string
  sedes: string
  tipoSolicitud: string
  etiquetaTipoSolicitud: string
  cr?: number
  id: number | null
  precompromisos: PrecompromisoForm[]
}

export interface MontoAnualOrdenDeCompraForm {
  anio: string | null
  monto: number | null
}

export interface SolicitanteOrdenDeCompraForm {
  claveFormulario: string
  montos: MontoAnualOrdenDeCompraForm[]
}

export interface OrdenDeCompraForm {
  id: number | null
  claveFormulario: string
  codigo: string
  fechaEmision: Date | null
  solicitantes: SolicitanteOrdenDeCompraForm[]
}

export interface MontoFacturaForm {
  montoOrdenCompraId: string
  monto: number | null
}

export interface FacturaForm {
  id: number | null
  folio: number | null
  fechaEmision: Date | null
  montos: MontoFacturaForm[]
}

export interface TransaccionFormState {
  id: number | null
  nombre: string
  linkCarpetaAntecedentes: string
  modalidad: string | null
  fecha: Date | null
  solicitantes: Array<UnidadSolicitanteForm>
  ordenesDeCompra: OrdenDeCompraForm[]
  facturas: FacturaForm[]
}
