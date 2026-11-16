import { Indicador } from '@/features/analisis/components/PanelIndicadores/Indicador'
import type { TotalesPerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'
import { formatCLP } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'

interface IndicadoresUnidadProps {
  totales?: TotalesPerfilUnidad
  cargando: boolean
}

function detalleOrdenes(ordenes: number): string {
  return ordenes === 1 ? 'De 1 orden de compra' : `De ${ordenes} órdenes de compra`
}

export function IndicadoresUnidad({ totales, cargando }: IndicadoresUnidadProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Indicador
        etiqueta="Total registros"
        valor={totales ? String(totales.registros) : ''}
        detalle="Montos de OC atribuidos a la unidad"
        cargando={cargando}
      />
      <Indicador
        etiqueta="OC válidas"
        valor={totales ? String(totales.ocValidas) : ''}
        detalle={totales ? detalleOrdenes(totales.ordenes) : undefined}
        cargando={cargando}
      />
      <Indicador
        etiqueta="Monto total"
        valor={totales ? formatCLP(totales.comprometido) : ''}
        detalle="Comprometido en OC válidas"
        cargando={cargando}
      />
      <Indicador
        etiqueta="% del total global"
        valor={totales ? formatPercentage(totales.participacionGlobal) : ''}
        detalle={
          totales
            ? `Sobre ${formatCLP(totales.comprometidoGlobal)} de todas las unidades`
            : undefined
        }
        cargando={cargando}
      />
      <Indicador
        etiqueta="Monto precomprometido"
        valor={totales ? formatCLP(totales.precomprometido) : ''}
        detalle="Cotizaciones de solicitudes no rechazadas"
        cargando={cargando}
      />
    </div>
  )
}
