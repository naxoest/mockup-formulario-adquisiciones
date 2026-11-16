import { cn } from '@/utils/cn'
import {
  claseTextoSeguimiento,
  formatearDiasRelativos,
  formatearFecha,
} from './MonitoreoCriticidad.utils'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

export function CeldaUltimaGestion({ fila }: { fila: FilaMonitoreo }) {
  if (fila.ultimoMovimiento === null || fila.diasSinGestion === null) {
    return <span className={cn('text-sm', claseTextoSeguimiento('sinRegistro'))}>Sin gestión</span>
  }

  return (
    <span className="flex flex-col gap-0.5">
      <span className={cn('text-sm', claseTextoSeguimiento(fila.nivelSeguimiento))}>
        {formatearDiasRelativos(fila.diasSinGestion)}
      </span>
      <time dateTime={fila.ultimoMovimiento.toISOString()} className="text-xs text-mercury-500">
        {formatearFecha(fila.ultimoMovimiento)}
      </time>
    </span>
  )
}
