import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { ClaveFiltroProyecto } from '@/features/mantenedor/utils/filtrosProyecto'

type FiltroProyecto = FilterDefinition & { key: ClaveFiltroProyecto }

export function construirFiltrosProyectos(): FiltroProyecto[] {
  return [
    {
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
      ],
    },
  ]
}
