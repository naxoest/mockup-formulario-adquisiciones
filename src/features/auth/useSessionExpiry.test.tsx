import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, renderHook, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { ModalProvider } from '@/components/ui/Modal'
import { API_BASE_URL } from '@/config/env'
import { useSessionExpiry } from '@/features/auth/useSessionExpiry'
import { authSessionKey } from '@/features/auth/session'
import { setCsrfToken } from '@/lib/apiClient'
import { createMockAuthSession, MOCK_CSRF_TOKEN } from '@/mocks/data/auth.mock'
import { server } from '@/mocks/server'

const HEARTBEAT_WAIT_MS = 5 * 60 * 1000 + 2000

async function flush() {
  await act(async () => {
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)
    await Promise.resolve()
  })
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

function meHandler(remainingSeconds: number) {
  return http.get(`${API_BASE_URL}/auth/me`, () =>
    HttpResponse.json(
      createMockAuthSession({
        sesion: { remaining_seconds: remainingSeconds, should_warn: false },
      }),
    ),
  )
}

function heartbeatHandler(onCall: () => void, remainingSeconds = 1800) {
  return http.get(`${API_BASE_URL}/auth/heartbeat`, () => {
    onCall()
    return HttpResponse.json({
      sesion: { remaining_seconds: remainingSeconds, should_warn: false },
      csrf_token: MOCK_CSRF_TOKEN,
    })
  })
}

function setup(remainingSeconds: number) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(meHandler(remainingSeconds))

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ModalProvider>{children}</ModalProvider>
      </QueryClientProvider>
    )
  }

  const rendered = renderHook(() => useSessionExpiry(), { wrapper: Wrapper })
  return { ...rendered, queryClient }
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

describe('useSessionExpiry', () => {
  beforeEach(() => {
    setCsrfToken(null)
    vi.useFakeTimers({
      toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('programa el aviso y lo muestra al cruzar el umbral', async () => {
    setup(65)
    await flush()
    expect(screen.queryByText('Su sesión está por expirar')).not.toBeInTheDocument()

    await advance(6000)

    expect(screen.getByText('Su sesión está por expirar')).toBeInTheDocument()
  })

  it('no dispara heartbeat inmediato tras la primera actividad', async () => {
    let heartbeatCalls = 0
    server.use(heartbeatHandler(() => heartbeatCalls++))
    setup(1800)
    await flush()

    act(() => {
      document.dispatchEvent(new Event('mousemove'))
    })
    await advance(30_000)

    expect(heartbeatCalls).toBe(0)
  })

  it('la actividad dispara el heartbeat a los cinco minutos y extiende el plazo', async () => {
    let heartbeatCalls = 0
    server.use(heartbeatHandler(() => heartbeatCalls++))
    const { queryClient } = setup(1800)
    await flush()
    await advance(1)

    act(() => {
      document.dispatchEvent(new Event('mousemove'))
    })
    await advance(HEARTBEAT_WAIT_MS)
    await flush()
    expect(heartbeatCalls).toBe(1)

    await advance(26 * 60_000)
    await flush()

    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
    expect(heartbeatCalls).toBe(1)
  })

  it('sin actividad no se envia heartbeat automatico', async () => {
    let heartbeatCalls = 0
    server.use(heartbeatHandler(() => heartbeatCalls++))
    setup(1800)
    await flush()

    await advance(HEARTBEAT_WAIT_MS)

    expect(heartbeatCalls).toBe(0)
  })

  it('continuar sesion renueva la cuenta sin expirar', async () => {
    let heartbeatCalls = 0
    server.use(heartbeatHandler(() => heartbeatCalls++))
    const { queryClient } = setup(65)
    await flush()

    await advance(6000)
    expect(screen.getByText('Su sesión está por expirar')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar sesión' }))
    await flush()
    expect(heartbeatCalls).toBe(1)

    await advance(70_000)
    await flush()

    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })

  it('al llegar a cero expira la sesion', async () => {
    const { queryClient } = setup(65)
    await flush()

    await advance(70_000)
    await flush()

    expect(queryClient.getQueryData(authSessionKey)).toBeNull()
  })

  it('un 401 del heartbeat expira la sesion', async () => {
    server.use(
      http.get(`${API_BASE_URL}/auth/heartbeat`, () =>
        HttpResponse.json({ error: 'No autenticado' }, { status: 401 }),
      ),
    )
    const { queryClient } = setup(1800)
    await flush()
    await advance(1)

    act(() => {
      document.dispatchEvent(new Event('mousemove'))
    })
    await advance(HEARTBEAT_WAIT_MS)
    await flush()

    expect(queryClient.getQueryData(authSessionKey)).toBeNull()
  })
})
