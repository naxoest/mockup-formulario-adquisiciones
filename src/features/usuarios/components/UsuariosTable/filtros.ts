import { etiquetaRol } from '@/features/auth/roles'
import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { ClaveFiltro } from '@/features/usuarios/utils/filtrosUsuario'
import type { Rol } from '@/features/usuarios/types/usuario.types'

type FiltroUsuario = FilterDefinition & { key: ClaveFiltro }

export function construirFiltrosUsuarios(roles: Rol[]): FiltroUsuario[] {
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
    {
      key: 'rol',
      label: 'Rol',
      type: 'multi',
      enableSelectAll: true,
      options: roles.map((rol) => ({ value: String(rol.id), label: etiquetaRol(rol.nombre) })),
    },
  ]
}
