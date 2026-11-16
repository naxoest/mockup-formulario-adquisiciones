import { useCallback } from 'react'
import { tienePermiso, type Permiso } from '@/features/auth/permisos'
import { useAuth } from '@/features/auth/useAuth'

export function usePermisos() {
  const { roles } = useAuth()

  const puede = useCallback((permiso: Permiso) => tienePermiso(roles, permiso), [roles])

  return { puede }
}
