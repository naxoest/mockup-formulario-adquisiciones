import type { BadgeVariant } from '@/components/ui/Badge'
import { formatShortDate } from '@/utils/date'
import type {
  NivelCriticidad,
  NivelSeguimiento,
} from '@/features/transacciones/types/monitoreo.types'

const formateadorRelativo = new Intl.RelativeTimeFormat('es-CL', { numeric: 'auto' })

export function formatearDiasRelativos(dias: number): string {
  return formateadorRelativo.format(-dias, 'day')
}

export function varianteCriticidad(nivel: NivelCriticidad): BadgeVariant {
  switch (nivel) {
    case 'critico':
      return 'error'
    case 'atencion':
      return 'warning'
    case 'controlado':
      return 'success'
  }
}

export function claseTextoSeguimiento(nivel: NivelSeguimiento): string {
  switch (nivel) {
    case 'critico':
      return 'text-scarlet-700'
    case 'atencion':
      return 'text-saffron-700'
    case 'normal':
      return 'text-mercury-700'
    case 'sinRegistro':
      return 'text-mercury-500'
  }
}

export function formatearFecha(fecha: Date): string {
  return formatShortDate(fecha)
}
