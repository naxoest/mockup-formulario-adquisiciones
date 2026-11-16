import { Building2, GraduationCap, type LucideIcon } from 'lucide-react'
import type {
  FacturaForm,
  OrdenDeCompraForm,
  SolicitudDisponible,
  TransaccionFormState,
  UnidadSolicitanteForm,
} from '@/features/transacciones/types/transaccion.types'
import { nuevaClaveSolicitante } from '@/features/transacciones/utils/solicitantes'

export const presentacionPorTipo: Record<string, { icono: LucideIcon; clases: string }> = {
  carrera: { icono: GraduationCap, clases: 'bg-jade-50 text-jade-700' },
  unidad: { icono: Building2, clases: 'bg-primary-100 text-primary-700' },
}

export function etiquetaSolicitud(solicitud: SolicitudDisponible): string {
  return [`Solicitud ${solicitud.ordinal}`, solicitud.unidad]
    .filter((parte) => parte.length > 0)
    .join(' · ')
}

export function detalleSolicitud(solicitud: SolicitudDisponible): string {
  return [
    solicitud.sedes || null,
    solicitud.cr ? `CR ${solicitud.cr}` : null,
    solicitud.id != null ? `ID ${solicitud.id}` : 'Sin guardar',
  ]
    .filter((detalle): detalle is string => detalle !== null)
    .join(' · ')
}

export const getUnidadSolicitanteDefaults = (): UnidadSolicitanteForm => ({
  id: null,
  unidadId: null,
  claveFormulario: nuevaClaveSolicitante(),
  tipo: '',
  tipoSolicitud: '',
  codigoSaserviSabienes: '',
  financiamiento: null,
  nombre: '',
  campus: '',
  cr: 0,
  precompromisos: [],
})

export const getOrdenDeCompraDefaults = (): OrdenDeCompraForm => ({
  id: null,
  claveFormulario: nuevaClaveSolicitante(),
  codigo: '',
  fechaEmision: null,
  solicitantes: [],
})

export const getFacturaDefaults = (): FacturaForm => ({
  id: null,
  folio: null,
  fechaEmision: null,
  montos: [],
})

export const getTransaccionDefaults = (): TransaccionFormState => ({
  id: null,
  nombre: '',
  linkCarpetaAntecedentes: '',
  modalidad: '',
  fecha: new Date(),
  solicitantes: [],
  ordenesDeCompra: [],
  facturas: [],
})

export function mensajeDeArreglo(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined
  const n = node as { root?: { message?: unknown }; message?: unknown }
  const msg = n.root?.message ?? n.message
  return typeof msg === 'string' ? msg : undefined
}
