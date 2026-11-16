import { queryOptions, type QueryClient, type QueryKey } from '@tanstack/react-query'
import { getMe } from '@/features/auth/api'
import { ApiError, setCsrfToken } from '@/lib/apiClient'
import type { AuthSession } from '@/features/auth/types'

export const authSessionKey = ['auth', 'session'] as const

async function fetchSession(): Promise<AuthSession | null> {
  try {
    const session = await getMe()
    if (session.roles.length === 0) {
      setCsrfToken(null)
      return null
    }
    return session
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export const sessionQueryOptions = queryOptions({
  queryKey: authSessionKey,
  queryFn: fetchSession,
  staleTime: 60_000,
  retry: 1,
  refetchOnWindowFocus: (query) => query.state.data != null,
  refetchOnReconnect: (query) => query.state.data != null,
})

function esClaveDeSesion(clave: QueryKey): boolean {
  return (
    clave.length === authSessionKey.length &&
    authSessionKey.every((parte, indice) => clave[indice] === parte)
  )
}

export function descartarDatosEnCache(queryClient: QueryClient): void {
  void queryClient.resetQueries({ predicate: (consulta) => !esClaveDeSesion(consulta.queryKey) })
}
