import { useMemo } from 'react'
import { BarChart } from '@/components/ui/BarChart'
import type { BarChartSeries } from '@/components/ui/BarChart'
import { Card } from '@/components/ui/Card'
import type { ResumenModalidad } from '@/features/analisis/types/reporte.types'
import { formatCLP, formatCompactCLP } from '@/utils/currency'

const SERIES_MONTO: BarChartSeries[] = [
  { key: 'monto', label: 'Monto comprometido', color: 'primary' },
]

interface GraficoModalidadProps {
  porModalidad: ResumenModalidad[]
  cargando: boolean
}

export function GraficoModalidad({ porModalidad, cargando }: GraficoModalidadProps) {
  const datos = useMemo(
    () =>
      porModalidad.map((fila) => ({
        modalidad: fila.modalidad.label,
        monto: fila.comprometido,
      })),
    [porModalidad],
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Card.Title>Distribución del monto por modalidad de compra</Card.Title>
          <p className="text-xs text-mercury-500">
            Participación del comprometido por modalidad de compra
          </p>
        </div>
      </Card.Header>
      <Card.Body>
        <BarChart
          data={datos}
          categoryKey="modalidad"
          series={SERIES_MONTO}
          formatValue={formatCLP}
          formatCompactValue={formatCompactCLP}
          showLegend={false}
          loading={cargando}
          ariaLabel="Distribución del monto por modalidad de compra"
          emptyMessage="Sin registros en el periodo"
          height={300}
        />
      </Card.Body>
    </Card>
  )
}
