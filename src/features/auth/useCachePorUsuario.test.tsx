import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { authSessionKey } from '@/features/auth/session'
import { useAuth } from '@/features/auth/useAuth'
import { useCachePorUsuario } from '@/features/auth/useCachePorUsuario'
import { createMockAuthSession } from '@/mocks/data/auth.mock'
import type { AuthSession } from '@/features/auth/types'

const CLAVE_DE_DATOS = ['transacciones', 1] as const

interface ResultadoAuth {
  readonly current: ReturnType<typeof useAuth>
}

function renderizar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(authSessionKey, createMockAuthSession())
  queryClient.setQueryData(CLAVE_DE_DATOS, { id: 1 })

  const { result } = renderHook(
    () => {
      useCachePorUsuario()
      return useAuth()
    },
    {
      wrapper: function Envoltorio({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      },
    },
  )

  return { queryClient, result }
}

function actualizarSesion(queryClient: QueryClient, cambio: (sesion: AuthSession) => AuthSession) {
  queryClient.setQueryData<AuthSession | null>(authSessionKey, (actual) =>
    actual ? cambio(actual) : actual,
  )
}

async function renovarSesion(queryClient: QueryClient, resultado: ResultadoAuth, segundos: number) {
  actualizarSesion(queryClient, (sesion) => ({
    ...sesion,
    sesion: { ...sesion.sesion, remaining_seconds: segundos },
  }))

  await waitFor(() => expect(resultado.current.session?.remaining_seconds).toBe(segundos))
}

describe('useCachePorUsuario', () => {
  it('descarta los datos en cache cuando la sesion pasa a otro usuario', async () => {
    const { queryClient } = renderizar()

    actualizarSesion(queryClient, (sesion) => ({
      ...sesion,
      usuario: { ...sesion.usuario, run: sesion.usuario.run + 1 },
    }))

    await waitFor(() => expect(queryClient.getQueryData(CLAVE_DE_DATOS)).toBeUndefined())
    expect(queryClient.getQueryData(authSessionKey)).not.toBeNull()
  })

  it('conserva los datos mientras la sesion se renueva para el mismo usuario', async () => {
    const { queryClient, result } = renderizar()

    await renovarSesion(queryClient, result, 10)
    await renovarSesion(queryClient, result, 20)

    expect(queryClient.getQueryData(CLAVE_DE_DATOS)).toEqual({ id: 1 })
  })
})
