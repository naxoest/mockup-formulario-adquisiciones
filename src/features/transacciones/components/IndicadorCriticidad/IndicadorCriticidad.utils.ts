import type { NivelCriticidad } from '@/features/transacciones/types/monitoreo.types'

const formateadorIndice = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatearIndice(indice: number): string {
  return formateadorIndice.format(indice)
}

export function etiquetaCriticidad(nivel: NivelCriticidad): string {
  switch (nivel) {
    case 'critico':
      return 'Crítico'
    case 'atencion':
      return 'Atención'
    case 'controlado':
      return 'Controlado'
  }
}

export function claseSegmentoCriticidad(nivel: NivelCriticidad): string {
  switch (nivel) {
    case 'critico':
      return 'bg-scarlet-500'
    case 'atencion':
      return 'bg-saffron-500'
    case 'controlado':
      return 'bg-jade-500'
  }
}

export function segmentosLlenos(indice: number): number {
  return Math.round(indice)
}
