import { cn } from '@/utils/cn'
import { formatearDiasRelativos, formatearFecha } from './MonitoreoCriticidad.utils'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

export function CeldaProximaRevision({ fila }: { fila: FilaMonitoreo }) {
  if (fila.fechaProximaRevision === null || fila.diasHastaRevision === null) {
    return <span className="text-sm text-mercury-400">Sin fecha</span>
  }

  const vencida = fila.diasHastaRevision < 0

  return (
    <span className="flex flex-col gap-0.5">
      <span className={cn('text-sm', vencida ? 'text-scarlet-700' : 'text-mercury-700')}>
        {vencida ? 'Vencida' : formatearDiasRelativos(-fila.diasHastaRevision)}
      </span>
      <time dateTime={fila.fechaProximaRevision.toISOString()} className="text-xs text-mercury-500">
        {formatearFecha(fila.fechaProximaRevision)}
      </time>
    </span>
  )
}
