import type {
  AnalistasTransaccion,
  PasoProceso,
} from '@/features/transacciones/types/transaccion.types'

export type TonoEvento = 'registrado' | 'enCurso' | 'logrado' | 'espera' | 'detenido'

export type TipoEntidadHistorial = 'solicitud' | 'ordenDeCompra' | 'factura'

export interface ReferenciaEntidad {
  tipo: TipoEntidadHistorial
  id: number
  codigo: string
}

export interface TransicionEstado {
  anterior: string | null
  posterior: string
  tono: TonoEvento
}

export interface UnidadEvento {
  nombre: string
}

export interface ContextoEvento {
  unidad?: UnidadEvento
  campus?: string
  proveedor?: string
  relacionadas?: ReferenciaEntidad[]
}

export interface EventoEntidad {
  clase: 'evento'
  id: string
  fecha: string
  entidad: ReferenciaEntidad
  contexto: ContextoEvento
  titulo: string
  monto: number | null
  transicion: TransicionEstado
  observacion: string
  autor: string
}

export interface HitoTransaccion {
  clase: 'hito'
  id: string
  fecha: string
  estado: string
  explicacion: string
}

export interface RegistroBitacora {
  clase: 'registro'
  id: string
  fecha: string
  titulo: string
  observacion: string
  autor: string
}

interface PasoHistorialBase {
  clase: 'paso'
  id: string
  fecha: string
  paso: PasoProceso
  titulo: string
  autor: string
}

export interface PasoRegistradoHistorial extends PasoHistorialBase {
  accion: 'registrado'
  fechaHecho: string
  observacion: string | null
}

export interface PasoDeshechoHistorial extends PasoHistorialBase {
  accion: 'deshecho'
  fechaHecho: null
  observacion: string
}

export type PasoHistorial = PasoRegistradoHistorial | PasoDeshechoHistorial

export type EventoHistorial = EventoEntidad | HitoTransaccion | RegistroBitacora | PasoHistorial

export interface CabeceraHistorial {
  codigo: string
  nombre: string
  linkCarpetaAntecedentes: string | null
  modalidad: string
  totalSolicitudes: number
  totalOrdenes: number
  totalFacturas: number
  fechaApertura: string
  analistas: AnalistasTransaccion
}

export interface PendienteSituacion {
  id: string
  descripcion: string
}

export interface SituacionActual {
  estado: string
  explicacion: string
  pendientes: PendienteSituacion[]
}

export interface MontoComparado {
  valor: number
  nota: string
}

export interface MontosComparados {
  cotizadoVigente: MontoComparado
  comprometido: MontoComparado
  facturado: MontoComparado
}

export interface AvanceTransaccion {
  etapas: string[]
  actual: string
}

export interface HistorialTransaccion {
  cabecera: CabeceraHistorial
  situacion: SituacionActual
  montos: MontosComparados
  avance: AvanceTransaccion
  eventos: EventoHistorial[]
}
