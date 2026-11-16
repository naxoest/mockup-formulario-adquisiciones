import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { getCsrfToken, getMe, heartbeat, login, logout } from '@/features/auth/api'
import { ApiError, setCsrfToken } from '@/lib/apiClient'
import {
  CLAVE_SIMULADA,
  createMockAuthSession,
  createMockRol,
  MOCK_CSRF_TOKEN,
} from '@/mocks/data/auth.mock'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { server } from '@/mocks/server'

describe('auth api', () => {
  beforeEach(() => {
    setCsrfToken(null)
    iniciarSesionSimuladaPorRun(12345678)
  })

  it('login envia las credenciales en el body y retorna la sesion', async () => {
    let body: unknown = null
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(createMockAuthSession())
      }),
    )

    const session = await login({
      email_intento: 'ana.rojas@ejemplo.cl',
      password: 'secreta',
    })

    expect(body).toEqual({
      email_intento: 'ana.rojas@ejemplo.cl',
      password: 'secreta',
    })
    expect(session.usuario.run).toBe(12345678)
    expect(session.roles).toEqual([createMockRol()])
    expect(session.csrf_token).toBe(MOCK_CSRF_TOKEN)
  })

  it('login habilita el envio del csrf en mutantes posteriores', async () => {
    let csrfHeader: string | null = null
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ message: 'Sesión cerrada' })
      }),
    )

    await login({ email_intento: 'ana.rojas@ejemplo.cl', password: CLAVE_SIMULADA })
    await logout()

    expect(csrfHeader).toBe(MOCK_CSRF_TOKEN)
  })

  it('logout limpia el token csrf', async () => {
    await login({ email_intento: 'ana.rojas@ejemplo.cl', password: CLAVE_SIMULADA })
    await logout()

    let csrfHeader: string | null = 'sin-leer'
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ message: 'Sesión cerrada' })
      }),
    )

    await logout()

    expect(csrfHeader).toBeNull()
  })

  it('getMe retorna la sesion completa y captura el csrf', async () => {
    const session = await getMe()

    expect(session.usuario.email_institucional).toBe('ana.rojas@ejemplo.cl')
    expect(session.sesion).toEqual({ remaining_seconds: 1800, should_warn: false })
    expect(session.roles).toEqual([createMockRol()])
    expect(session.csrf_token).toBe(MOCK_CSRF_TOKEN)
  })

  it('getMe rechaza una respuesta que no cumple el contrato', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({
          usuario: {
            rut: 12345678,
            email_institucional: 'ana.rojas@ejemplo.cl',
            email_estudiantil: null,
            nombres: 'Ana',
            apellidos: 'Rojas Pérez',
            es_estudiante: false,
          },
          sesion: { remaining_seconds: 1800, should_warn: false },
          csrf_token: MOCK_CSRF_TOKEN,
        }),
      ),
    )

    await expect(getMe()).rejects.toThrow()
  })

  it('heartbeat retorna la sesion y el csrf', async () => {
    const response = await heartbeat()

    expect(response.sesion.remaining_seconds).toBe(1800)
    expect(response.csrf_token).toBe(MOCK_CSRF_TOKEN)
  })

  it('heartbeat rechaza una respuesta sin sesion', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/heartbeat`, () =>
        HttpResponse.json({ csrf_token: MOCK_CSRF_TOKEN }),
      ),
    )

    await expect(heartbeat()).rejects.toThrow()
  })

  it('getCsrfToken retorna el token', async () => {
    const response = await getCsrfToken()

    expect(response.csrf_token).toBe(MOCK_CSRF_TOKEN)
  })

  it('login propaga el error de credenciales invalidas', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }),
      ),
    )

    const error = await login({
      email_intento: 'otra@ejemplo.cl',
      password: 'mala',
    }).catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(401)
    expect(error.message).toBe('Credenciales inválidas')
  })

  it('login propaga el 429 de demasiados intentos', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Demasiados intentos' }, { status: 429 }),
      ),
    )

    const error = await login({
      email_intento: 'otra@ejemplo.cl',
      password: 'mala',
    }).catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(429)
  })
})
