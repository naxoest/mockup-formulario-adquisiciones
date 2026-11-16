import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { RouteError } from '@/app/RouteError'
import { Modal, ModalProvider, useModal } from '@/components/ui/Modal'
import type { ModalComponentProps } from '@/components/ui/Modal'
import { API_BASE_URL } from '@/config/env'
import { exigirPermiso } from '@/features/auth/permisos'
import { authSessionKey, sessionQueryOptions } from '@/features/auth/session'
import type { AuthSession } from '@/features/auth/types'
import { useCicloDeSesion } from '@/features/auth/useCicloDeSesion'
import { setCsrfToken } from '@/lib/apiClient'
import { createMockRol } from '@/mocks/data/auth.mock'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { server } from '@/mocks/server'

function dispararSalidaDeModales() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    if (!dialog.dataset.open && dialog.open) {
      const event = new Event('transitionend', { bubbles: true }) as TransitionEvent
      Object.defineProperty(event, 'propertyName', { value: 'opacity' })
      Object.defineProperty(event, 'target', { value: dialog })
      dialog.dispatchEvent(event)
    }
  })
}

function DialogoDePrueba({ open, onExited, reject }: ModalComponentProps<void>) {
  return (
    <Modal open={open} onClose={() => reject()} onExited={onExited}>
      <Modal.Header>Diálogo de prueba</Modal.Header>
      <Modal.Body>Contenido del diálogo</Modal.Body>
    </Modal>
  )
}

function Layout() {
  const { cerrarSesion } = useCicloDeSesion()

  return (
    <>
      <button type="button" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
      <Outlet />
    </>
  )
}

function Pagina() {
  const modal = useModal()

  return (
    <button
      type="button"
      onClick={() => {
        void modal.open(DialogoDePrueba, {}).catch(() => undefined)
      }}
    >
      Abrir diálogo
    </button>
  )
}

function renderizar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const rootRoute = createRootRoute()
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    component: () => <div>Pantalla de login</div>,
  })
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'app',
    beforeLoad: async ({ location }) => {
      const sesion = await queryClient.ensureQueryData(sessionQueryOptions)
      if (sesion === null) {
        throw redirect({ to: '/login', search: { redirect: location.href } })
      }
    },
    component: Layout,
  })
  const paginaRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/pagina',
    beforeLoad: () => {
      const sesion = queryClient.getQueryData<AuthSession | null>(authSessionKey)
      exigirPermiso(sesion?.roles ?? [], 'monitoreo:ver')
    },
    component: Pagina,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([loginRoute, layoutRoute.addChildren([paginaRoute])]),
    history: createMemoryHistory({ initialEntries: ['/pagina'] }),
    defaultErrorComponent: RouteError,
  })

  render(
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <RouterProvider router={router} />
      </ModalProvider>
    </QueryClientProvider>,
  )

  return { router, queryClient }
}

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
})

describe('useCicloDeSesion', () => {
  beforeEach(() => {
    setCsrfToken(null)
    iniciarSesionSimuladaPorRun(12345678)
  })

  it('cierra los modales y redirige al login conservando el destino cuando la sesion termina', async () => {
    const user = userEvent.setup()
    const { router, queryClient } = renderizar()

    await user.click(await screen.findByRole('button', { name: 'Abrir diálogo' }))
    expect(await screen.findByText('Contenido del diálogo')).toBeInTheDocument()

    act(() => {
      queryClient.setQueryData(authSessionKey, null)
    })

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toEqual({ redirect: '/pagina' })

    act(() => {
      dispararSalidaDeModales()
    })
    await waitFor(() => expect(screen.queryByText('Contenido del diálogo')).not.toBeInTheDocument())
  })

  it('lleva al login sin destino guardado tras un cierre de sesion voluntario', async () => {
    const user = userEvent.setup()
    const { router, queryClient } = renderizar()

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toEqual({})
    expect(queryClient.getQueryData(authSessionKey)).toBeNull()
  })

  it('lleva al login si el cierre voluntario responde 401', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    const { router } = renderizar()

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toEqual({})
  })

  it('permanece en la pantalla si el cierre voluntario falla por otro motivo', async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () =>
        HttpResponse.json({ error: 'Error interno del servidor' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    const { router, queryClient } = renderizar()

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() =>
      expect(
        queryClient
          .getMutationCache()
          .getAll()
          .every((mutacion) => mutacion.state.status === 'error'),
      ).toBe(true),
    )
    expect(router.state.location.pathname).toBe('/pagina')
    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })

  it('redirige conservando el destino si el cierre voluntario falla y la sesion ya habia terminado', async () => {
    const user = userEvent.setup()
    const { router, queryClient } = renderizar()
    server.use(
      http.post(`${API_BASE_URL}/auth/logout`, () => {
        queryClient.setQueryData(authSessionKey, null)
        return HttpResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
      }),
    )

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.search).toEqual({ redirect: '/pagina' })
  })

  it('revalida la ruta cuando cambian los roles y muestra el 403 dentro del layout', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { router, queryClient } = renderizar()

    expect(await screen.findByRole('button', { name: 'Abrir diálogo' })).toBeInTheDocument()

    act(() => {
      queryClient.setQueryData<AuthSession | null>(authSessionKey, (actual) =>
        actual ? { ...actual, roles: [createMockRol({ id: 1, nombre: 'analista' })] } : actual,
      )
    })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Acceso denegado' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/pagina')

    consoleError.mockRestore()
    consoleWarn.mockRestore()
  })
})
