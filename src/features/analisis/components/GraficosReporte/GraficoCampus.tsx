import { useMemo } from 'react'
import { BarChart } from '@/components/ui/BarChart'
import type { BarChartSeries } from '@/components/ui/BarChart'
import { Card } from '@/components/ui/Card'
import type { ResumenCampus } from '@/features/analisis/types/reporte.types'
import { formatCLP, formatCompactCLP } from '@/utils/currency'

const SERIES_MONTO: BarChartSeries[] = [
  { key: 'monto', label: 'Monto comprometido', color: 'primary' },
]

interface GraficoCampusProps {
  porCampus: ResumenCampus[]
  cargando: boolean
}

export function GraficoCampus({ porCampus, cargando }: GraficoCampusProps) {
  const datos = useMemo(
    () =>
      porCampus.map((fila) => ({
        campus: fila.campus.label,
        monto: fila.comprometido,
      })),
    [porCampus],
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Card.Title>Inversión por campus</Card.Title>
          <p className="text-xs text-mercury-500">Comprometido acumulado por campus</p>
        </div>
      </Card.Header>
      <Card.Body>
        <BarChart
          data={datos}
          categoryKey="campus"
          series={SERIES_MONTO}
          formatValue={formatCLP}
          formatCompactValue={formatCompactCLP}
          showLegend={false}
          loading={cargando}
          ariaLabel="Inversión por campus"
          emptyMessage="Sin registros en el periodo"
          height={300}
        />
      </Card.Body>
    </Card>
  )
}
