import type { SidebarNavItem } from '@/components/ui/Sidebar'
import { filterNavigationItems, firstAllowedPath, navigationItems } from '@/config/navigation'
import type { Rol } from '@/features/auth/types'

const administrador: Rol = { id: 2, nombre: 'administrador' }
const analista: Rol = { id: 1, nombre: 'analista' }
const solicitante: Rol = { id: 3, nombre: 'solicitante' }

function visibleEntries(items: SidebarNavItem[]): string[] {
  return items.flatMap((item) =>
    item.type === 'link'
      ? [item.label]
      : item.items.map((entry) => `${item.label} > ${entry.label}`),
  )
}

describe('filterNavigationItems', () => {
  it('muestra todas las secciones al administrador', () => {
    expect(visibleEntries(filterNavigationItems(navigationItems, [administrador]))).toEqual([
      'Inicio',
      'Transacciones > Gestión de Transacciones',
      'Transacciones > Monitoreo de criticidad',
      'Requerimientos > Requerimientos registrados',
      'Requerimientos > Historial de importaciones',
      'Requerimientos > Formularios de compra',
      'Análisis > Adquisiciones',
      'Análisis > Por carrera',
      'Configuración > Administración de usuarios',
      'Configuración > Mantenedor',
    ])
  })

  it('oculta al analista el monitoreo, mis solicitudes y la configuracion', () => {
    expect(visibleEntries(filterNavigationItems(navigationItems, [analista]))).toEqual([
      'Inicio',
      'Transacciones > Gestión de Transacciones',
      'Requerimientos > Requerimientos registrados',
      'Requerimientos > Historial de importaciones',
      'Requerimientos > Formularios de compra',
      'Análisis > Adquisiciones',
      'Análisis > Por carrera',
    ])
  })

  it('omite los grupos que quedan sin secciones permitidas', () => {
    const groups = filterNavigationItems(navigationItems, [solicitante]).filter(
      (item) => item.type === 'group',
    )

    expect(groups).toEqual([])
  })

  it('no muestra secciones sin roles reconocidos', () => {
    expect(filterNavigationItems(navigationItems, [])).toEqual([])
    expect(filterNavigationItems(navigationItems, [{ id: 9, nombre: 'auditor' }])).toEqual([])
  })

  it('no entrega el permiso a los elementos del sidebar', () => {
    const [home] = filterNavigationItems(navigationItems, [administrador])

    expect(home).not.toHaveProperty('permission')
  })
})

describe('firstAllowedPath', () => {
  it('lleva al inicio a administradores y analistas', () => {
    expect(firstAllowedPath(navigationItems, [administrador])).toBe('/')
    expect(firstAllowedPath(navigationItems, [analista])).toBe('/')
  })

  it('lleva a perfil al solicitante', () => {
    expect(firstAllowedPath(navigationItems, [solicitante])).toBe('/perfil')
  })

  it('retorna null cuando no hay secciones permitidas', () => {
    expect(firstAllowedPath(navigationItems, [])).toBeNull()
  })
})
