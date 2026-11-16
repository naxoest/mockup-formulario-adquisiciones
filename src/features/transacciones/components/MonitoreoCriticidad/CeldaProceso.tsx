import { Badge } from '@/components/ui/Badge'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

export function CeldaProceso({ fila }: { fila: FilaMonitoreo }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-medium text-mercury-800">{fila.nombre}</span>
        {fila.escalarAJefatura ? (
          <Badge variant="error" size="sm">
            Escalado
          </Badge>
        ) : null}
        {fila.cerrado ? (
          <Badge variant="neutral" size="sm">
            Cerrado
          </Badge>
        ) : null}
      </span>
      <span className="text-xs tabular-nums text-mercury-500">#{fila.transaccionId}</span>
    </span>
  )
}
