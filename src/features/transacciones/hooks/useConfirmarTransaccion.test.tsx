import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useConfirmarTransaccion } from '@/features/transacciones/hooks/useConfirmarTransaccion'
import { datosDeBorrador } from '@/mocks/pruebas'

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

const BORRADOR_CON_SOLICITUD = datosDeBorrador()

describe('useConfirmarTransaccion', () => {
  it('confirma un borrador y le asigna marca temporal y estado', async () => {
    const borrador = await crearTransaccion(BORRADOR_CON_SOLICITUD)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useConfirmarTransaccion(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync(borrador.id)

    expect(transaccion.confirmadaEn).not.toBeNull()
    expect(transaccion.estado).not.toBeNull()
  })

  it('invalida las consultas de transacciones tras confirmar', async () => {
    const borrador = await crearTransaccion(BORRADOR_CON_SOLICITUD)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useConfirmarTransaccion(), { wrapper: Envoltorio })

    await result.current.mutateAsync(borrador.id)

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })

  it('rechaza confirmar dos veces la misma transaccion', async () => {
    const borrador = await crearTransaccion(BORRADOR_CON_SOLICITUD)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useConfirmarTransaccion(), { wrapper: Envoltorio })

    await result.current.mutateAsync(borrador.id)

    await expect(result.current.mutateAsync(borrador.id)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transaccion_ya_confirmada',
    })
  })
})
