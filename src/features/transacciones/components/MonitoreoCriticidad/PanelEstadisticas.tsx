import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { EstadisticasMonitoreo } from '@/features/transacciones/utils/estadisticasMonitoreo'

interface Indicador {
  clave: string
  etiqueta: string
  valor: number
  claseValor: string
}

function indicadores(estadisticas: EstadisticasMonitoreo): Indicador[] {
  return [
    {
      clave: 'criticos',
      etiqueta: 'Procesos críticos',
      valor: estadisticas.criticos,
      claseValor: 'text-scarlet-700',
    },
    {
      clave: 'sinGestion',
      etiqueta: 'Sin gestión hace tres días o más',
      valor: estadisticas.sinGestionSobreUmbral,
      claseValor: 'text-saffron-700',
    },
    {
      clave: 'revisiones',
      etiqueta: 'Revisiones vencidas',
      valor: estadisticas.revisionesVencidas,
      claseValor: 'text-mercury-900',
    },
    {
      clave: 'escalamientos',
      etiqueta: 'Escalados a jefatura',
      valor: estadisticas.escalamientosPendientes,
      claseValor: 'text-mercury-900',
    },
  ]
}

export function PanelEstadisticas({ estadisticas }: { estadisticas: EstadisticasMonitoreo }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {indicadores(estadisticas).map((indicador) => (
        <Card key={indicador.clave}>
          <Card.Body className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mercury-600">{indicador.etiqueta}</span>
            <span className={cn('text-2xl font-semibold tabular-nums', indicador.claseValor)}>
              {indicador.valor}
            </span>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}
