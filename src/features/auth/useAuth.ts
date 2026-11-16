import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login as loginRequest, logout as logoutRequest } from '@/features/auth/api'
import { CuentaSinAccesoError } from '@/features/auth/errores'
import { authSessionKey, descartarDatosEnCache, sessionQueryOptions } from '@/features/auth/session'
import type { LoginCredentials, Rol } from '@/features/auth/types'

const SIN_ROLES: Rol[] = []

async function iniciarSesion(credentials: LoginCredentials) {
  const session = await loginRequest(credentials)
  if (session.roles.length === 0) {
    await logoutRequest().catch(() => undefined)
    throw new CuentaSinAccesoError()
  }
  return session
}

export function useAuth() {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery(sessionQueryOptions)

  const loginMutation = useMutation({
    mutationFn: iniciarSesion,
    onSuccess: (session) => {
      descartarDatosEnCache(queryClient)
      queryClient.setQueryData(authSessionKey, session)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      queryClient.setQueryData(authSessionKey, null)
    },
  })

  const session = sessionQuery.data ?? null

  return {
    user: session?.usuario ?? null,
    roles: session?.roles ?? SIN_ROLES,
    session: session?.sesion ?? null,
    isAuthenticated: session !== null,
    isLoading: sessionQuery.isLoading,
    login: loginMutation,
    logout: logoutMutation,
  }
}
