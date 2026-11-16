import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import {
  aceptarOrdenDeCompra,
  crearOrdenDeCompra,
} from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useCancelarOrdenDeCompra } from '@/features/transacciones/hooks/useCancelarOrdenDeCompra'
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

describe('useCancelarOrdenDeCompra', () => {
  it('cancela una orden enviada a proveedor registrando la observacion', async () => {
    const ordenId = await prepararOrden('OC-9101')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCancelarOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: ordenId,
      datos: { observacion: 'El proveedor no confirmo el despacho' },
    })
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    expect(orden?.estado).toBe('cancelada')
  })

  it('cancela una orden ya aceptada', async () => {
    const ordenId = await prepararOrden('OC-9102')
    await aceptarOrdenDeCompra(ordenId)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCancelarOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: ordenId,
      datos: { observacion: 'Incumplimiento del plazo pactado' },
    })
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    expect(orden?.estado).toBe('cancelada')
  })

  it('rechaza el cuerpo cuando la observacion viene vacia', async () => {
    const ordenId = await prepararOrden('OC-9103')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCancelarOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: ordenId, datos: { observacion: '' } }),
    ).rejects.toMatchObject({ name: 'ApiError' })
  })

  it('rechaza cancelar una orden ya cancelada', async () => {
    const ordenId = await prepararOrden('OC-9104')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCancelarOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: ordenId, datos: { observacion: 'Se anula la compra' } })

    await expect(
      result.current.mutateAsync({ id: ordenId, datos: { observacion: 'Se anula de nuevo' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'transicion_ilegal' })
  })

  it('invalida las consultas de transacciones tras cancelar', async () => {
    const ordenId = await prepararOrden('OC-9105')
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCancelarOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: ordenId, datos: { observacion: 'Sin stock' } })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
