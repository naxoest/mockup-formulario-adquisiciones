import type { FilterDefinition } from '@/components/ui/FilterBar'
import type {
  OpcionEstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import type { ClaveFiltro, Vigencia } from '@/features/requerimientos/utils/filtrosRequerimiento'
import { formatearSolicitante } from '@/features/requerimientos/utils/formato'

type FiltroRequerimiento = FilterDefinition & { key: ClaveFiltro }

interface OpcionSolicitante {
  value: string
  label: string
}

interface OpcionVigencia {
  value: Vigencia
  label: string
}

const OPCIONES_VIGENCIA: OpcionVigencia[] = [
  { value: 'vigente', label: 'Vigentes' },
  { value: 'eliminado', label: 'Eliminados' },
]

function opcionesSolicitante(requerimientos: Requerimiento[]): OpcionSolicitante[] {
  const porIdentificador = new Map<number, OpcionSolicitante>()

  for (const { solicitante } of requerimientos) {
    if (!porIdentificador.has(solicitante.id)) {
      porIdentificador.set(solicitante.id, {
        value: String(solicitante.id),
        label: formatearSolicitante(solicitante),
      })
    }
  }

  return [...porIdentificador.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

export function construirFiltrosRequerimiento(
  requerimientos: Requerimiento[],
  estados: OpcionEstadoRequerimiento[],
): FiltroRequerimiento[] {
  return [
    {
      key: 'solicitante',
      label: 'Solicitante',
      type: 'multi',
      enableSelectAll: true,
      options: opcionesSolicitante(requerimientos),
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      enableSelectAll: true,
      options: estados,
    },
    {
      key: 'vigencia',
      label: 'Vigencia',
      type: 'multi',
      enableSelectAll: false,
      options: OPCIONES_VIGENCIA,
    },
  ]
}
