import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { FilaDetalleUnidad } from '@/features/analisis/types/perfilUnidad.types'
import {
  opcionesFiltroDetalle,
  type ClaveFiltroDetalleUnidad,
} from '@/features/analisis/utils/perfilUnidad'

type FiltroDetalleUnidad = FilterDefinition & { key: ClaveFiltroDetalleUnidad }

export function construirFiltrosDetalleUnidad(filas: FilaDetalleUnidad[]): FiltroDetalleUnidad[] {
  return [
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'multi',
      enableSelectAll: true,
      options: opcionesFiltroDetalle(filas, 'tipo'),
    },
    {
      key: 'modalidad',
      label: 'Modalidad',
      type: 'multi',
      enableSelectAll: true,
      options: opcionesFiltroDetalle(filas, 'modalidad'),
    },
  ]
}
