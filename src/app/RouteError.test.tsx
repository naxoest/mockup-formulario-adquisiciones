import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouteError } from '@/app/RouteError'
import { AccesoDenegadoError } from '@/features/auth/errores'

function renderizar(cargar: () => void) {
  const rootRoute = createRootRoute()
  const inicioRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Pantalla de inicio</div>,
  })
  const seccionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/seccion',
    beforeLoad: cargar,
    component: () => <div>Contenido de la sección</div>,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([inicioRoute, seccionRoute]),
    history: createMemoryHistory({ initialEntries: ['/seccion'] }),
    defaultErrorComponent: RouteError,
  })

  render(<RouterProvider router={router} />)
}

describe('RouteError', () => {
  let consoleError: ReturnType<typeof vi.spyOn>
  let consoleWarn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
    consoleWarn.mockRestore()
  })

  it('muestra la pantalla 403 ante un acceso denegado', async () => {
    renderizar(() => {
      throw new AccesoDenegadoError()
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acceso denegado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Error 403')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('Contenido de la sección')).not.toBeInTheDocument()
  })

  it('muestra un error generico y permite reintentar la carga', async () => {
    const user = userEvent.setup()
    let intentos = 0
    renderizar(() => {
      intentos += 1
      if (intentos === 1) {
        throw new Error('Fallo de carga')
      }
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ocurrió un error inesperado' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Contenido de la sección')).toBeInTheDocument()
  })
})
