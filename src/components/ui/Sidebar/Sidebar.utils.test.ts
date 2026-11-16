import { describe, it, expect } from 'vitest'
import { formatRoles, resolveActivePath } from './Sidebar.utils'
import type { SidebarNavItem } from './Sidebar.types'

const icon = () => null

const items: SidebarNavItem[] = [
  { type: 'link', icon, label: 'Inicio', path: '/' },
  {
    type: 'group',
    icon,
    label: 'Transacciones',
    items: [
      { label: 'Gestión', path: '/transacciones' },
      { label: 'Monitoreo', path: '/transacciones/monitoreo' },
    ],
  },
]

describe('formatRoles', () => {
  it('returns empty string when given empty array', () => {
    expect(formatRoles([])).toBe('')
  })

  it('returns single role as-is', () => {
    expect(formatRoles(['Admin'])).toBe('Admin')
  })

  it('joins two roles with " y "', () => {
    expect(formatRoles(['Admin', 'Analista'])).toBe('Admin y Analista')
  })

  it('joins three roles with commas and " y " before last', () => {
    expect(formatRoles(['Admin', 'Analista', 'Supervisor'])).toBe('Admin, Analista y Supervisor')
  })

  it('joins four roles correctly', () => {
    expect(formatRoles(['A', 'B', 'C', 'D'])).toBe('A, B, C y D')
  })
})

describe('resolveActivePath', () => {
  it('prefers the most specific path', () => {
    expect(resolveActivePath(items, '/transacciones/monitoreo')).toBe('/transacciones/monitoreo')
  })

  it('resolves a detail route to its section', () => {
    expect(resolveActivePath(items, '/transacciones/15')).toBe('/transacciones')
  })

  it('does not match a partial segment', () => {
    expect(resolveActivePath(items, '/transacciones_archivadas')).toBeNull()
  })

  it('matches the root path only exactly', () => {
    expect(resolveActivePath(items, '/')).toBe('/')
    expect(resolveActivePath(items, '/perfil')).toBeNull()
  })
})
