import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { RouteError } from '@/app/RouteError'
import { ModalProvider } from '@/components/ui/Modal'
import { ApiError } from '@/lib/apiClient'
import { ENABLE_API_MOCKING } from '@/config/env'
import { manejarErrorDeSesion } from '@/features/auth/manejarErrorDeSesion'
import { routeTree } from '@/routeTree.gen'
import '@/index.css'

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }
  return failureCount < 2
}

function handleGlobalError(error: unknown) {
  manejarErrorDeSesion(queryClient, error)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
    },
  },
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({ onError: handleGlobalError }),
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultErrorComponent: RouteError,
  notFoundMode: 'root',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function enableMocking() {
  if (!ENABLE_API_MOCKING) {
    return
  }
  const { iniciarSimulacion } = await import('@/mocks/browser')
  await iniciarSimulacion()
}

async function bootstrap() {
  await enableMocking()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('No se encontró el elemento root en index.html')
  }

  if (!rootElement.innerHTML) {
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            <RouterProvider router={router} />
            <Toaster richColors />
          </ModalProvider>
        </QueryClientProvider>
      </StrictMode>,
    )
  }
}

void bootstrap()
