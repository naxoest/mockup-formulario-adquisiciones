import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { API_BASE_URL } from '@/config/env'
import { usePermisos } from '@/features/auth/usePermisos'
import { setCsrfToken } from '@/lib/apiClient'
import { createMockAuthSession, createMockRol } from '@/mocks/data/auth.mock'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { server } from '@/mocks/server'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePermisos', () => {
  beforeEach(() => {
    setCsrfToken(null)
    iniciarSesionSimuladaPorRun(12345678)
  })

  it('otorga al administrador eliminar transacciones e importar planillas', async () => {
    const { result } = renderHook(() => usePermisos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.puede('transacciones:eliminar')).toBe(true))
    expect(result.current.puede('requerimientos:importar')).toBe(true)
  })

  it('niega al analista eliminar transacciones e importar planillas', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json(
          createMockAuthSession({ roles: [createMockRol({ id: 1, nombre: 'analista' })] }),
        ),
      ),
    )

    const { result } = renderHook(() => usePermisos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.puede('transacciones:ver')).toBe(true))
    expect(result.current.puede('transacciones:eliminar')).toBe(false)
    expect(result.current.puede('requerimientos:ver')).toBe(true)
    expect(result.current.puede('requerimientos:importar')).toBe(false)
  })
})
