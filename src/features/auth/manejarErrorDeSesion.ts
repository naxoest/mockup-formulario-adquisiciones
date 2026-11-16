import type { QueryClient } from '@tanstack/react-query'
import { authSessionKey } from '@/features/auth/session'
import { ApiError, FORBIDDEN_ROLE_CODE, setCsrfToken } from '@/lib/apiClient'

export function manejarErrorDeSesion(queryClient: QueryClient, error: unknown): void {
  if (!(error instanceof ApiError)) return

  if (error.status === 401) {
    queryClient.setQueryData(authSessionKey, null)
    setCsrfToken(null)
    return
  }

  if (error.status === 403 && error.code === FORBIDDEN_ROLE_CODE) {
    void queryClient.invalidateQueries({ queryKey: authSessionKey })
  }
}
