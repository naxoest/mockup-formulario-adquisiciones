import { useMemo } from 'react'
import { PieChart } from '@/components/ui/PieChart'
import { Card } from '@/components/ui/Card'
import type { ResumenTipo } from '@/features/analisis/types/reporte.types'
import { formatCLP } from '@/utils/currency'

interface GraficoTipoProps {
  porTipo: ResumenTipo[]
  cargando: boolean
}

export function GraficoTipo({ porTipo, cargando }: GraficoTipoProps) {
  const datos = useMemo(
    () =>
      porTipo.map((fila) => ({
        key: fila.tipo.value,
        label: fila.tipo.label,
        value: fila.comprometido,
      })),
    [porTipo],
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Card.Title>Distribución del monto por tipo</Card.Title>
          <p className="text-xs text-mercury-500">
            Participación del comprometido por tipo de solicitud
          </p>
        </div>
      </Card.Header>
      <Card.Body>
        <PieChart
          data={datos}
          variant="pie"
          formatValue={formatCLP}
          loading={cargando}
          ariaLabel="Distribución del monto por tipo"
          emptyMessage="Sin registros en el periodo"
          height={300}
        />
      </Card.Body>
    </Card>
  )
}
