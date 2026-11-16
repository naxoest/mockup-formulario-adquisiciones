import { Settings, Home, ChartBar, ScanBarcode, ClipboardList } from 'lucide-react'
import type { SidebarNavItem } from '@/components/ui/Sidebar'
import { tienePermiso, type Permiso } from '@/features/auth/permisos'
import type { Rol } from '@/features/auth/types'

type SidebarLink = Extract<SidebarNavItem, { type: 'link' }>
type SidebarGroup = Extract<SidebarNavItem, { type: 'group' }>

interface NavigationLink extends SidebarLink {
  permission: Permiso
}

interface NavigationGroupEntry {
  label: string
  path: string
  permission: Permiso
}

interface NavigationGroup extends Omit<SidebarGroup, 'items'> {
  items: NavigationGroupEntry[]
}

export type NavigationItem = NavigationLink | NavigationGroup

export const navigationItems: NavigationItem[] = [
  {
    type: 'link',
    icon: Home,
    label: 'Inicio',
    path: '/',
    permission: 'inicio:ver',
  },
  {
    type: 'group',
    icon: ScanBarcode,
    label: 'Transacciones',
    items: [
      {
        label: 'Gestión de Transacciones',
        path: '/transacciones',
        permission: 'transacciones:ver',
      },
      {
        label: 'Monitoreo de criticidad',
        path: '/transacciones/monitoreo',
        permission: 'monitoreo:ver',
      },
    ],
  },
  {
    type: 'group',
    icon: ClipboardList,
    label: 'Requerimientos',
    items: [
      {
        label: 'Requerimientos registrados',
        path: '/requerimientos',
        permission: 'requerimientos:ver',
      },
      {
        label: 'Historial de importaciones',
        path: '/requerimientos/importaciones',
        permission: 'requerimientos:ver',
      },
      {
        label: 'Formularios de compra',
        path: '/formularios',
        permission: 'requerimientos:ver',
      },
    ],
  },
  {
    type: 'group',
    icon: ChartBar,
    label: 'Análisis',
    items: [
      { label: 'Adquisiciones', path: '/analisis/adquisiciones', permission: 'analisis:ver' },
      { label: 'Por carrera', path: '/analisis_por_carreras', permission: 'analisis:ver' },
    ],
  },
  {
    type: 'group',
    icon: Settings,
    label: 'Configuración',
    items: [
      {
        label: 'Administración de usuarios',
        path: '/configuracion/admin_usuarios',
        permission: 'usuarios:gestionar',
      },
      {
        label: 'Mantenedor',
        path: '/configuracion/mantenedor',
        permission: 'mantenedor:ver',
      },
    ],
  },
]

export function filterNavigationItems(
  items: readonly NavigationItem[],
  roles: readonly Rol[],
): SidebarNavItem[] {
  return items.flatMap((item): SidebarNavItem[] => {
    if (item.type === 'link') {
      if (!tienePermiso(roles, item.permission)) return []
      return [{ type: 'link', icon: item.icon, label: item.label, path: item.path }]
    }

    const allowedEntries = item.items.filter((entry) => tienePermiso(roles, entry.permission))
    if (allowedEntries.length === 0) return []

    return [
      {
        type: 'group',
        icon: item.icon,
        label: item.label,
        items: allowedEntries.map((entry) => ({ label: entry.label, path: entry.path })),
      },
    ]
  })
}

export function firstAllowedPath(
  items: readonly NavigationItem[],
  roles: readonly Rol[],
): string | null {
  for (const item of items) {
    if (item.type === 'link') {
      if (tienePermiso(roles, item.permission)) return item.path
      continue
    }

    const allowedEntry = item.items.find((entry) => tienePermiso(roles, entry.permission))
    if (allowedEntry) return allowedEntry.path
  }

  if (tienePermiso(roles, 'perfil:ver')) {
    return '/perfil'
  }

  return null
}
