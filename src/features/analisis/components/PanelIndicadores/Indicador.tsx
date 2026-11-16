import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface IndicadorProps {
  etiqueta: string
  valor: string
  detalle?: string
  cargando?: boolean
}

export function Indicador({ etiqueta, valor, detalle, cargando = false }: IndicadorProps) {
  return (
    <Card className="p-5">
      <p className="text-xs text-mercury-500">{etiqueta}</p>
      {cargando ? (
        <div className="mt-2">
          <Skeleton width="70%" height={28} />
        </div>
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums text-mercury-900">{valor}</p>
      )}
      {detalle && !cargando && <p className="mt-1 text-xs text-mercury-500">{detalle}</p>}
    </Card>
  )
}
