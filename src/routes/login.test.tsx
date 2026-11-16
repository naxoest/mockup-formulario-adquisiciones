import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { authSessionKey } from '@/features/auth/session'
import { setCsrfToken } from '@/lib/apiClient'
import { createMockAuthSession } from '@/mocks/data/auth.mock'
import { server } from '@/mocks/server'
import { Route as LoginRoute } from './login'

function renderLogin(prepararCache?: (queryClient: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  prepararCache?.(queryClient)

  const rootRoute = createRootRoute()
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginRoute.options.component,
    validateSearch: LoginRoute.options.validateSearch,
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Pagina de inicio</div>,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([loginRoute, indexRoute]),
    history: undefined,
    context: { queryClient },
  })

  router.navigate({ to: '/login' })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}

describe('LoginPage', () => {
  beforeEach(() => {
    setCsrfToken(null)
    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
    )
  })

  it('renderiza los campos y el boton', async () => {
    renderLogin()
    expect(await screen.findByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('descarta los datos de la sesion anterior al entrar y conserva la consulta de sesion', async () => {
    const { queryClient } = renderLogin((cliente) => {
      cliente.setQueryData(['transacciones', 'lista'], { data: [] })
    })
    await screen.findByLabelText('Correo electrónico')

    await waitFor(() =>
      expect(queryClient.getQueryData(['transacciones', 'lista'])).toBeUndefined(),
    )
    expect(queryClient.getQueryState(authSessionKey)).toBeDefined()
  })

  it('muestra errores de validacion cuando los campos estan vacios', async () => {
    const user = userEvent.setup()
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('Debe ingresar su correo institucional')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
  })

  it('muestra el mensaje del backend ante credenciales invalidas', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }),
      ),
    )
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })

  it('mapea un error 422 al campo correspondiente', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(
          { error: 'Formato inválido', code: 'invalid', field: 'email_intento' },
          { status: 422 },
        ),
      ),
    )
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('Formato inválido')).toBeInTheDocument()
  })

  it('muestra mensaje generico ante un 503', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Servicio no disponible' }, { status: 503 }),
      ),
    )
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText('No se pudo conectar con el servidor. Intente nuevamente.'),
    ).toBeInTheDocument()
  })

  it('muestra un aviso formal ante demasiados intentos', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(
          { error: 'Demasiados intentos fallidos. Inténtalo más tarde' },
          { status: 429 },
        ),
      ),
    )
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText('Demasiados intentos fallidos. Intente nuevamente más tarde.'),
    ).toBeInTheDocument()
  })

  it('muestra el aviso de cuenta desactivada ante un 403 del login', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ error: 'Tu cuenta está desactivada' }, { status: 403 }),
      ),
    )
    renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText('Su cuenta está desactivada. Contacte al administrador.'),
    ).toBeInTheDocument()
  })

  it('muestra el aviso de cuenta sin acceso cuando el usuario no tiene roles', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(createMockAuthSession({ roles: [] })),
      ),
    )
    const { router } = renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(
        'Su cuenta no tiene acceso asignado al sistema. Contacte al administrador.',
      ),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('redirige tras un login exitoso', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () => HttpResponse.json(createMockAuthSession())),
    )
    const { router } = renderLogin()
    await screen.findByLabelText('Correo electrónico')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
