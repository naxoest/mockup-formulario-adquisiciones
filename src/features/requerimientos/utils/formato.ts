import { formatShortDate, fromCivilDate } from '@/utils/date'
import type { SolicitanteRequerimiento } from '@/features/requerimientos/types/requerimiento.types'
import type { SelectOption } from '@/types/select'

const formatoCantidad = new Intl.NumberFormat('es-CL')

export function formatearFechaCivil(valor: string): string {
  return formatShortDate(fromCivilDate(valor))
}

export function formatearInstante(valor: string): string {
  const [fecha, hora] = valor.split('T')
  return `${formatearFechaCivil(fecha)}, ${hora.slice(0, 5)}`
}

export function formatearCantidad(valor: number): string {
  return formatoCantidad.format(valor)
}

export function formatearSedes(sedes: SelectOption[]): string {
  return sedes.map((sede) => sede.label).join(', ')
}

export function formatearSolicitante(solicitante: SolicitanteRequerimiento): string {
  return `${solicitante.nombre} (${formatearSedes(solicitante.sedes)})`
}
