import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useEditarTransaccion } from '@/features/transacciones/hooks/useEditarTransaccion'
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

const BORRADOR_VALIDO = datosDeBorrador({ solicitudes: [] })

describe('useEditarTransaccion', () => {
  it('modifica la modalidad de un borrador existente', async () => {
    const borrador = await crearTransaccion(BORRADOR_VALIDO)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarTransaccion(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: borrador.id,
      datos: { modalidad: 'directo' },
    })

    expect(transaccion.id).toBe(borrador.id)
    expect(transaccion.modalidad).toBe('directo')
  })

  it('invalida las consultas de transacciones tras editar', async () => {
    const borrador = await crearTransaccion(BORRADOR_VALIDO)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useEditarTransaccion(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: borrador.id, datos: { modalidad: 'directo' } })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })

  it('propaga un ApiError cuando la transaccion no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarTransaccion(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: 999999, datos: { modalidad: 'directo' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 404, code: 'transaccion_inexistente' })
  })
})
