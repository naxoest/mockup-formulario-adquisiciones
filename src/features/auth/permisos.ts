import { AccesoDenegadoError } from '@/features/auth/errores'
import { esNombreRol, type NombreRol } from '@/features/auth/roles'
import type { Rol } from '@/features/auth/types'

export const PERMISOS = {
  'inicio:ver': ['administrador', 'analista'],
  'transacciones:ver': ['administrador', 'analista'],
  'transacciones:eliminar': ['administrador'],
  'transacciones:asignarAnalistas': ['administrador'],
  'monitoreo:ver': ['administrador'],
  'requerimientos:ver': ['administrador', 'analista'],
  'requerimientos:importar': ['administrador'],
  'analisis:ver': ['administrador', 'analista'],
  'misSolicitudes:ver': ['administrador', 'solicitante'],
  'perfil:ver': ['administrador', 'analista', 'solicitante'],
  'usuarios:gestionar': ['administrador'],
  'mantenedor:ver': ['administrador'],
} as const satisfies Record<string, readonly NombreRol[]>

export type Permiso = keyof typeof PERMISOS

export function tienePermiso(roles: readonly Rol[], permiso: Permiso): boolean {
  const permitidos: readonly NombreRol[] = PERMISOS[permiso]
  return roles.some((rol) => esNombreRol(rol.nombre) && permitidos.includes(rol.nombre))
}

export function exigirPermiso(roles: readonly Rol[], permiso: Permiso): void {
  if (!tienePermiso(roles, permiso)) {
    throw new AccesoDenegadoError()
  }
}
