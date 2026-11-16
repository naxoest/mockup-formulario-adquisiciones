import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { apiClient, ApiError, FORBIDDEN_ROLE_CODE, setCsrfToken } from '@/lib/apiClient'
import { server } from '@/mocks/server'

describe('apiClient', () => {
  beforeEach(() => {
    setCsrfToken(null)
  })

  it('resuelve el json de una respuesta exitosa', async () => {
    server.use(http.get(`${API_BASE_URL}/recurso`, () => HttpResponse.json({ id: 1 })))

    const data = await apiClient<{ id: number }>('/recurso')

    expect(data).toEqual({ id: 1 })
  })

  it('envia content-type json cuando hay body', async () => {
    let contentType: string | null = null
    server.use(
      http.post(`${API_BASE_URL}/recurso`, ({ request }) => {
        contentType = request.headers.get('Content-Type')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso', { method: 'POST', body: { a: 1 } })

    expect(contentType).toBe('application/json')
  })

  it('no envia x-csrf-token en get aunque exista token', async () => {
    setCsrfToken('token-123')
    let csrfHeader: string | null = 'sin-leer'
    server.use(
      http.get(`${API_BASE_URL}/recurso`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso')

    expect(csrfHeader).toBeNull()
  })

  it('envia x-csrf-token en post cuando hay token', async () => {
    setCsrfToken('token-123')
    let csrfHeader: string | null = null
    server.use(
      http.post(`${API_BASE_URL}/recurso`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso', { method: 'POST', body: {} })

    expect(csrfHeader).toBe('token-123')
  })

  it('no envia x-csrf-token en post cuando no hay token', async () => {
    let csrfHeader: string | null = 'sin-leer'
    server.use(
      http.post(`${API_BASE_URL}/recurso`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso', { method: 'POST', body: {} })

    expect(csrfHeader).toBeNull()
  })

  it('lanza apierror con status y mensaje del backend', async () => {
    server.use(
      http.get(`${API_BASE_URL}/recurso`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
    )

    const error = await apiClient('/recurso').catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(401)
    expect(error.message).toBe('No autenticado')
  })

  it('expone code y field de un error de validacion', async () => {
    server.use(
      http.post(`${API_BASE_URL}/recurso`, () =>
        HttpResponse.json(
          { error: 'Campo requerido', code: 'missing', field: 'identificador' },
          { status: 422 },
        ),
      ),
    )

    const error = await apiClient('/recurso', { method: 'POST', body: {} }).catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(422)
    expect(error.code).toBe('missing')
    expect(error.field).toBe('identificador')
  })

  it('lanza apierror con mensaje generico si el cuerpo no es json', async () => {
    server.use(
      http.get(`${API_BASE_URL}/recurso`, () =>
        HttpResponse.text('error interno', { status: 500 }),
      ),
    )

    const error = await apiClient('/recurso').catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(500)
    expect(error.message).toBe('Respuesta inesperada del servidor')
  })

  it('presenta el 403 sin codigo de una ruta /api como falta de permisos', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/recurso`, () =>
        HttpResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 },
        ),
      ),
    )

    const error = await apiClient('/api/recurso').catch((e: unknown) => e)

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.status).toBe(403)
    expect(error.code).toBe(FORBIDDEN_ROLE_CODE)
    expect(error.message).toBe('No tiene permisos para realizar esta acción.')
  })

  it('conserva el 403 con codigo de una ruta /api', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/recurso`, () =>
        HttpResponse.json(
          { error: 'Token CSRF inválido o ausente', code: 'CSRF_INVALID' },
          { status: 403 },
        ),
      ),
    )

    const error = await apiClient('/api/recurso', { method: 'POST', body: {} }).catch(
      (e: unknown) => e,
    )

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.code).toBe('CSRF_INVALID')
    expect(error.message).toBe('Token CSRF inválido o ausente')
  })

  it('conserva el 403 sin codigo fuera de las rutas /api', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Tu cuenta está desactivada' }, { status: 403 }),
      ),
    )

    const error = await apiClient('/auth/login', { method: 'POST', body: {} }).catch(
      (e: unknown) => e,
    )

    if (!(error instanceof ApiError)) {
      throw new Error('se esperaba una instancia de ApiError')
    }
    expect(error.code).toBeUndefined()
    expect(error.message).toBe('Tu cuenta está desactivada')
  })

  it('envia un cuerpo binario con su tipo de contenido sin convertirlo a json', async () => {
    let contentType: string | null = null
    let bytes: number[] = []
    server.use(
      http.put(`${API_BASE_URL}/recurso`, async ({ request }) => {
        contentType = request.headers.get('Content-Type')
        bytes = Array.from(new Uint8Array(await request.arrayBuffer()))
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso', {
      method: 'PUT',
      binary: { data: new Uint8Array([1, 2, 3]).buffer, contentType: 'image/jpeg' },
    })

    expect(contentType).toBe('image/jpeg')
    expect(bytes).toEqual([1, 2, 3])
  })

  it('envia x-csrf-token con un cuerpo binario', async () => {
    setCsrfToken('token-123')
    let csrfHeader: string | null = null
    server.use(
      http.put(`${API_BASE_URL}/recurso`, ({ request }) => {
        csrfHeader = request.headers.get('X-CSRF-Token')
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiClient('/recurso', {
      method: 'PUT',
      binary: { data: new Uint8Array([1]).buffer, contentType: 'image/png' },
    })

    expect(csrfHeader).toBe('token-123')
  })
})
