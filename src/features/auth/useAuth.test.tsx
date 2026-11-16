import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { API_BASE_URL } from '@/config/env'
import { CuentaSinAccesoError } from '@/features/auth/errores'
import { useAuth } from '@/features/auth/useAuth'
import { setCsrfToken } from '@/lib/apiClient'
import { createMockAuthSession, createMockRol, createMockUsuario } from '@/mocks/data/auth.mock'
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

describe('useAuth', () => {
  beforeEach(() => {
    setCsrfToken(null)
    iniciarSesionSimuladaPorRun(12345678)
  })

  it('expone el usuario cuando hay sesion', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.user?.nombres).toBe('Ana')
  })

  it('expone los roles de la sesion', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json(
          createMockAuthSession({
            roles: [
              createMockRol({ id: 1, nombre: 'analista' }),
              createMockRol({ id: 2, nombre: 'administrador' }),
            ],
          }),
        ),
      ),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.roles).toEqual([
      { id: 1, nombre: 'analista' },
      { id: 2, nombre: 'administrador' },
    ])
  })

  it('expone usuario null y roles vacios cuando la sesion responde 401', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.roles).toEqual([])
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('trata como sin sesion una sesion sin roles asignados', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json(createMockAuthSession({ roles: [] })),
      ),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('actualiza la sesion en cache tras un login exitoso', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(
          createMockAuthSession({ usuario: createMockUsuario({ nombres: 'Beatriz' }) }),
        ),
      ),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)

    await result.current.login.mutateAsync({
      email_intento: 'beatriz@ejemplo.cl',
      password: 'secreta',
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.user?.nombres).toBe('Beatriz')
  })

  it('rechaza el login de una cuenta sin roles y cierra la sesion en el servidor', async () => {
    let logoutSolicitado = false
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(createMockAuthSession({ roles: [] })),
      ),
      http.post(`${API_BASE_URL}/auth/logout`, () => {
        logoutSolicitado = true
        return HttpResponse.json({ message: 'Sesión cerrada' })
      }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      result.current.login.mutateAsync({
        email_intento: 'ana.rojas@ejemplo.cl',
        password: 'secreta',
      }),
    ).rejects.toBeInstanceOf(CuentaSinAccesoError)

    expect(logoutSolicitado).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('limpia la sesion en cache tras un logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await result.current.logout.mutateAsync()

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.roles).toEqual([])
  })
})
