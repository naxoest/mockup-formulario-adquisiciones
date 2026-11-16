import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useModal } from '@/components/ui/Modal'
import { authSessionKey } from '@/features/auth/session'
import { useAuth } from '@/features/auth/useAuth'
import { useCachePorUsuario } from '@/features/auth/useCachePorUsuario'
import { ApiError } from '@/lib/apiClient'

export function useCicloDeSesion() {
  const router = useRouter()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { closeAll } = useModal()
  const { isAuthenticated, roles, logout } = useAuth()
  const cierreVoluntarioRef = useRef(false)

  useCachePorUsuario()

  const claveRoles = roles
    .map((rol) => rol.nombre)
    .sort((a, b) => a.localeCompare(b))
    .join('|')
  const claveRolesRef = useRef(claveRoles)

  const finalizarSesionInvoluntaria = useCallback(() => {
    closeAll()
    void router.invalidate()
  }, [closeAll, router])

  useEffect(() => {
    if (isAuthenticated || cierreVoluntarioRef.current) return
    finalizarSesionInvoluntaria()
  }, [isAuthenticated, finalizarSesionInvoluntaria])

  useEffect(() => {
    if (claveRolesRef.current === claveRoles) return
    claveRolesRef.current = claveRoles
    if (!isAuthenticated) return
    void router.invalidate()
  }, [claveRoles, isAuthenticated, router])

  const cerrarSesion = () => {
    cierreVoluntarioRef.current = true
    logout.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: '/login' })
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          void navigate({ to: '/login' })
          return
        }
        cierreVoluntarioRef.current = false
        if (queryClient.getQueryData(authSessionKey) === null) {
          finalizarSesionInvoluntaria()
        }
      },
    })
  }

  return { cerrarSesion }
}
