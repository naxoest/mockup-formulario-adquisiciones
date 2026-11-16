import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useAceptarOrdenDeCompra } from '@/features/transacciones/hooks/useAceptarOrdenDeCompra'
import { datosDeBorrador } from '@/mocks/pruebas'

function crearEnvoltorio() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return {
    queryClient,
    Envoltorio: function Envoltorio({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  }
}

const BORRADOR = datosDeBorrador()

async function prepararConfirmada(): Promise<Transaccion> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  return crearSolicitud(confirmada.id, { unidadId: 1, tipoSolicitud: 'SABIENES' })
}

async function prepararOrden(codigo: string): Promise<number> {
  const transaccion = await prepararConfirmada()
  const conOrden = await crearOrdenDeCompra(transaccion.id, {
    codigo,
    fechaEmision: '2026-03-02',
    montos: [{ solicitudId: transaccion.solicitudes[0].id, anio: 2026, monto: 100000 }],
  })

  return conOrden.ordenesDeCompra[0].id
}

describe('useAceptarOrdenDeCompra', () => {
  it('lleva la orden de enviada a proveedor a aceptada', async () => {
    const ordenId = await prepararOrden('OC-7001')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAceptarOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({ id: ordenId })
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    expect(orden?.estado).toBe('aceptada')
  })

  it('rechaza aceptar dos veces la misma orden', async () => {
    const ordenId = await prepararOrden('OC-7002')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAceptarOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: ordenId })

    await expect(result.current.mutateAsync({ id: ordenId })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transicion_ilegal',
      field: 'estado',
    })
  })

  it('invalida las consultas de transacciones tras aceptar', async () => {
    const ordenId = await prepararOrden('OC-7003')
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAceptarOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: ordenId })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
