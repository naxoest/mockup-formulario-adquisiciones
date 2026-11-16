import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { API_BASE_URL } from '@/config/env'
import { datosDeBorrador } from '@/mocks/pruebas'
import { server } from '@/mocks/server'
import { useCrearTransaccion } from '@/features/transacciones/hooks/useCrearTransaccion'

function crearEnvoltorio() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    queryClient,
    Envoltorio: function Envoltorio({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  }
}

const BORRADOR_VALIDO = datosDeBorrador({ solicitudes: [] })

describe('useCrearTransaccion', () => {
  it('crea el borrador y devuelve la transaccion sin confirmar', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync(BORRADOR_VALIDO)

    expect(transaccion.id).toBeGreaterThan(0)
    expect(transaccion.confirmadaEn).toBeNull()
    expect(transaccion.estado).toBeNull()
    expect(transaccion.modalidad).toBe('agil')
  })

  it('invalida las consultas de transacciones tras crear', async () => {
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Envoltorio })

    await result.current.mutateAsync(BORRADOR_VALIDO)

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })

  it('propaga un ApiError cuando la modalidad no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ ...BORRADOR_VALIDO, modalidad: 'inexistente' }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400, field: 'modalidad' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('propaga el fallo cuando el servidor responde con un error inesperado', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/transacciones`, () =>
        HttpResponse.json({ error: 'Falla interna' }, { status: 500 }),
      ),
    )

    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync(BORRADOR_VALIDO)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
  })
})
