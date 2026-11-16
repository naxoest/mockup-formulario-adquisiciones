import { useMemo } from 'react'
import { BarChart } from '@/components/ui/BarChart'
import type { BarChartSeries } from '@/components/ui/BarChart'
import { Card } from '@/components/ui/Card'
import type { ResumenUnidad } from '@/features/analisis/types/reporte.types'
import { formatCLP, formatCompactCLP } from '@/utils/currency'

const MAXIMO_UNIDADES = 10

const SERIES_MONTO: BarChartSeries[] = [
  { key: 'monto', label: 'Monto comprometido', color: 'primary' },
]

interface GraficoUnidadesProps {
  porUnidad: ResumenUnidad[]
  cargando: boolean
}

export function GraficoUnidades({ porUnidad, cargando }: GraficoUnidadesProps) {
  const datos = useMemo(
    () =>
      porUnidad.slice(0, MAXIMO_UNIDADES).map((fila) => ({
        unidad: fila.unidad.label,
        monto: fila.comprometido,
      })),
    [porUnidad],
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Card.Title>Diez unidades con mayor monto comprometido</Card.Title>
          <p className="text-xs text-mercury-500">
            Comprometido acumulado en el periodo seleccionado
          </p>
        </div>
      </Card.Header>
      <Card.Body>
        <BarChart
          data={datos}
          categoryKey="unidad"
          series={SERIES_MONTO}
          orientation="horizontal"
          formatValue={formatCLP}
          formatCompactValue={formatCompactCLP}
          showValueLabels
          showLegend={false}
          loading={cargando}
          ariaLabel="Diez unidades con mayor monto comprometido"
          emptyMessage="Sin unidades con gasto en el periodo"
          height={360}
        />
      </Card.Body>
    </Card>
  )
}
