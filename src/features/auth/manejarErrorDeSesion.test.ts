import { QueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { manejarErrorDeSesion } from '@/features/auth/manejarErrorDeSesion'
import { authSessionKey } from '@/features/auth/session'
import { apiClient, ApiError, FORBIDDEN_ROLE_CODE, setCsrfToken } from '@/lib/apiClient'
import { createMockAuthSession } from '@/mocks/data/auth.mock'
import { server } from '@/mocks/server'

function crearCliente() {
  const queryClient = new QueryClient()
  queryClient.setQueryData(authSessionKey, createMockAuthSession())
  return queryClient
}

describe('manejarErrorDeSesion', () => {
  beforeEach(() => {
    setCsrfToken(null)
  })

  it('termina la sesion y descarta el token csrf ante un 401', async () => {
    const queryClient = crearCliente()
    setCsrfToken('token-123')
    let csrfHeader: string | null = 'sin-leer'
    server.use(
      http.post(`${API_BASE_URL}/recurso`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ ok: true })
      }),
    )

    manejarErrorDeSesion(queryClient, new ApiError(401, { error: 'No autenticado' }))

    expect(queryClient.getQueryData(authSessionKey)).toBeNull()
    await apiClient('/recurso', { method: 'POST', body: {} })
    expect(csrfHeader).toBeNull()
  })

  it('invalida la sesion para volver a consultar los roles ante un rechazo por rol', () => {
    const queryClient = crearCliente()

    manejarErrorDeSesion(
      queryClient,
      new ApiError(403, {
        error: 'No tiene permisos para realizar esta acción.',
        code: FORBIDDEN_ROLE_CODE,
      }),
    )

    expect(queryClient.getQueryState(authSessionKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })

  it('no modifica la sesion ante otros 403', () => {
    const queryClient = crearCliente()

    manejarErrorDeSesion(
      queryClient,
      new ApiError(403, { error: 'Token CSRF inválido o ausente', code: 'CSRF_INVALID' }),
    )

    expect(queryClient.getQueryState(authSessionKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })

  it('ignora los errores que no provienen de la api', () => {
    const queryClient = crearCliente()

    manejarErrorDeSesion(queryClient, new Error('Fallo de red'))

    expect(queryClient.getQueryState(authSessionKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })
})
