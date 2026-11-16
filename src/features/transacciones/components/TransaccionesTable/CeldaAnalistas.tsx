import { Badge } from '@/components/ui/Badge'
import type {
  AnalistasTransaccion,
  ParticipacionAnalista,
} from '@/features/transacciones/types/transaccion.types'

interface CeldaAnalistasProps {
  analistas: AnalistasTransaccion
  miParticipacion: ParticipacionAnalista | null
}

export function CeldaAnalistas({ analistas, miParticipacion }: CeldaAnalistasProps) {
  const cantidadApoyo = analistas.apoyo.length

  return (
    <span className="flex flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-1.5">
        {analistas.principal === null ? (
          <span className="text-sm text-mercury-400">Sin principal</span>
        ) : (
          <span className="text-sm text-mercury-800">{analistas.principal.nombre}</span>
        )}
        {miParticipacion === 'apoyo' && (
          <Badge variant="info" size="sm">
            De apoyo
          </Badge>
        )}
      </span>
      {cantidadApoyo > 0 && (
        <span className="text-xs text-mercury-500">
          {cantidadApoyo === 1 ? '1 analista de apoyo' : `${cantidadApoyo} analistas de apoyo`}
        </span>
      )}
    </span>
  )
}
