import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { ClaveFiltro } from '@/features/mantenedor/utils/filtrosUnidad'
import type { SelectOption } from '@/types/select'

type FiltroUnidad = FilterDefinition & { key: ClaveFiltro }

export function construirFiltrosUnidades(
  tipos: SelectOption[],
  sedes: SelectOption[],
): FiltroUnidad[] {
  return [
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'multi',
      enableSelectAll: true,
      options: tipos,
    },
    {
      key: 'sede',
      label: 'Sede',
      type: 'multi',
      enableSelectAll: true,
      options: sedes,
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      options: [
        { value: 'activa', label: 'Activa' },
        { value: 'inactiva', label: 'Inactiva' },
      ],
    },
  ]
}
