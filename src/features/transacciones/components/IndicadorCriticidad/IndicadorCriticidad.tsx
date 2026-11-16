import { cn } from '@/utils/cn'
import type { ResumenCriticidad } from '@/features/transacciones/types/monitoreo.types'
import {
  claseSegmentoCriticidad,
  etiquetaCriticidad,
  formatearIndice,
  segmentosLlenos,
} from './IndicadorCriticidad.utils'

const SEGMENTOS = [1, 2, 3, 4, 5]

export function IndicadorCriticidad({ criticidad }: { criticidad: ResumenCriticidad | null }) {
  if (criticidad === null) {
    return <span className="text-sm text-mercury-500">Sin evaluar</span>
  }

  const llenos = segmentosLlenos(criticidad.indice)
  const claseLleno = claseSegmentoCriticidad(criticidad.nivel)

  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium tabular-nums text-mercury-800">
          {formatearIndice(criticidad.indice)}
        </span>
        <span className="text-xs text-mercury-600">{etiquetaCriticidad(criticidad.nivel)}</span>
      </span>
      <span className="flex gap-0.5" aria-hidden="true">
        {SEGMENTOS.map((segmento) => (
          <span
            key={segmento}
            className={cn('h-1 w-4 rounded-sm', segmento <= llenos ? claseLleno : 'bg-mercury-200')}
          />
        ))}
      </span>
    </span>
  )
}
