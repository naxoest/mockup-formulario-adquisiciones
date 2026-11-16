import { UMBRAL_SEGUIMIENTO_CRITICO_EN_DIAS } from './criticidad'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

export interface EstadisticasMonitoreo {
  criticos: number
  sinGestionSobreUmbral: number
  revisionesVencidas: number
  escalamientosPendientes: number
}

export function calcularEstadisticasMonitoreo(filas: FilaMonitoreo[]): EstadisticasMonitoreo {
  let criticos = 0
  let sinGestionSobreUmbral = 0
  let revisionesVencidas = 0
  let escalamientosPendientes = 0

  for (const fila of filas) {
    if (fila.evaluacion?.nivel === 'critico') criticos += 1

    if (fila.diasSinGestion === null || fila.diasSinGestion >= UMBRAL_SEGUIMIENTO_CRITICO_EN_DIAS) {
      sinGestionSobreUmbral += 1
    }

    if (fila.diasHastaRevision !== null && fila.diasHastaRevision < 0) revisionesVencidas += 1

    if (fila.escalarAJefatura) escalamientosPendientes += 1
  }

  return { criticos, sinGestionSobreUmbral, revisionesVencidas, escalamientosPendientes }
}
