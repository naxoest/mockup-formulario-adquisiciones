import type { FilterDefinition } from '@/components/ui/FilterBar'
import {
  analistasDisponibles,
  VALOR_ESTADO_ABIERTO,
  VALOR_ESTADO_CERRADO,
  type ClaveFiltroMonitoreo,
} from '@/features/transacciones/utils/filtrosMonitoreo'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

type FiltroMonitoreo = FilterDefinition & { key: ClaveFiltroMonitoreo }

export function construirFiltrosMonitoreo(filas: FilaMonitoreo[]): FiltroMonitoreo[] {
  return [
    {
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      options: [
        { value: VALOR_ESTADO_ABIERTO, label: 'Abierto' },
        { value: VALOR_ESTADO_CERRADO, label: 'Cerrado' },
      ],
    },
    {
      key: 'criticidad',
      label: 'Criticidad',
      type: 'multi',
      enableSelectAll: true,
      options: [
        { value: 'critico', label: 'Crítico' },
        { value: 'atencion', label: 'Atención' },
        { value: 'controlado', label: 'Controlado' },
      ],
    },
    {
      key: 'seguimiento',
      label: 'Seguimiento',
      type: 'multi',
      enableSelectAll: true,
      options: [
        { value: 'sinRegistro', label: 'Sin gestión registrada' },
        { value: 'critico', label: 'Tres días o más' },
        { value: 'atencion', label: 'Dos días' },
        { value: 'normal', label: 'Al día' },
      ],
    },
    {
      key: 'analista',
      label: 'Analista',
      type: 'multi',
      enableSelectAll: true,
      options: analistasDisponibles(filas),
    },
  ]
}
