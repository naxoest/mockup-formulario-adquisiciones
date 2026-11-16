import { useMemo } from 'react'
import { LineChart } from '@/components/ui/LineChart'
import type { LineChartSeries } from '@/components/ui/LineChart'
import { Card } from '@/components/ui/Card'
import type { PuntoEvolucion } from '@/features/analisis/types/reporte.types'
import { etiquetaMes } from '@/features/analisis/utils/reporte'
import { formatCLP, formatCompactCLP } from '@/utils/currency'

const SERIES_EVOLUCION: LineChartSeries[] = [
  { key: 'comprometido', label: 'Comprometido', color: 'primary' },
  { key: 'facturado', label: 'Facturado', color: 'abyss', strokeDasharray: '5 4' },
]

interface GraficoEvolucionProps {
  evolucion: PuntoEvolucion[]
  cargando: boolean
}

export function GraficoEvolucion({ evolucion, cargando }: GraficoEvolucionProps) {
  const datos = useMemo(
    () =>
      evolucion.map((punto) => ({
        mes: etiquetaMes(punto.mes),
        comprometido: punto.comprometido,
        facturado: punto.facturado,
      })),
    [evolucion],
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Card.Title>Evolución mensual del monto comprometido y facturado</Card.Title>
          <p className="text-xs text-mercury-500">Comprometido y facturado mes a mes</p>
        </div>
      </Card.Header>
      <Card.Body>
        <LineChart
          data={datos}
          categoryKey="mes"
          series={SERIES_EVOLUCION}
          formatValue={formatCLP}
          formatCompactValue={formatCompactCLP}
          loading={cargando}
          ariaLabel="Evolución mensual del monto comprometido y facturado"
          emptyMessage="Sin movimientos en el periodo seleccionado"
          height={300}
        />
      </Card.Body>
    </Card>
  )
}
