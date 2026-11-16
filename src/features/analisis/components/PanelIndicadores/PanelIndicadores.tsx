import { Indicador } from '@/features/analisis/components/PanelIndicadores/Indicador'
import type { TotalesReporte } from '@/features/analisis/types/reporte.types'
import { formatCLP } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'

interface PanelIndicadoresProps {
  totales?: TotalesReporte
  cargando: boolean
}

export function PanelIndicadores({ totales, cargando }: PanelIndicadoresProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Indicador
        etiqueta="Total registros"
        valor={totales ? String(totales.registros) : ''}
        cargando={cargando}
      />
      <Indicador
        etiqueta="OC válidas"
        valor={totales ? String(totales.ocValidas) : ''}
        cargando={cargando}
      />
      <Indicador
        etiqueta="Monto total"
        valor={totales ? formatCLP(totales.comprometido) : ''}
        cargando={cargando}
      />
      <Indicador
        etiqueta="Concentración top 3"
        valor={totales ? formatPercentage(totales.concentracionTop3) : ''}
        cargando={cargando}
      />
      <Indicador
        etiqueta="% Trato Directo"
        valor={totales ? formatPercentage(totales.tratoDirectoParticipacion) : ''}
        cargando={cargando}
      />
    </div>
  )
}
