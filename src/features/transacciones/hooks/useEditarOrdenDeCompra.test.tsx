import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import {
  cancelarOrdenDeCompra,
  crearOrdenDeCompra,
} from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useEditarOrdenDeCompra } from '@/features/transacciones/hooks/useEditarOrdenDeCompra'
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

async function prepararConOrden(codigo: string) {
  const transaccion = await prepararConfirmada()
  const conOrden = await crearOrdenDeCompra(transaccion.id, {
    codigo,
    fechaEmision: '2026-03-02',
    montos: [{ solicitudId: transaccion.solicitudes[0].id, anio: 2026, monto: 100000 }],
  })

  return { transaccion: conOrden, ordenId: conOrden.ordenesDeCompra[0].id }
}

describe('useEditarOrdenDeCompra', () => {
  it('renombra el codigo de la orden', async () => {
    const { ordenId } = await prepararConOrden('OC-5001')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: ordenId,
      datos: { codigo: 'OC-5001-B' },
    })
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    expect(orden?.codigo).toBe('OC-5001-B')
  })

  it('rechaza un codigo que ya usa otra orden de la misma transaccion', async () => {
    const { transaccion, ordenId } = await prepararConOrden('OC-5002')
    const segunda = transaccion.solicitudes.find((item) => item.tipoSolicitud === 'SABIENES')

    if (!segunda) {
      throw new Error('No se pudo ubicar la solicitud agregada')
    }

    await crearOrdenDeCompra(transaccion.id, {
      codigo: 'OC-5003',
      fechaEmision: '2026-03-02',
      montos: [{ solicitudId: segunda.id, anio: 2026, monto: 50000 }],
    })

    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: ordenId, datos: { codigo: 'OC-5003' } }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'codigo_duplicado',
      field: 'codigo',
    })
  })

  it('rechaza editar una orden cancelada', async () => {
    const { ordenId } = await prepararConOrden('OC-5004')
    await cancelarOrdenDeCompra(ordenId, { observacion: 'El proveedor no responde' })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: ordenId, datos: { codigo: 'OC-5004-B' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'orden_cancelada' })
  })

  it('propaga un ApiError cuando la orden no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: 999999, datos: { codigo: 'OC-0000' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 404, code: 'orden_inexistente' })
  })

  it('invalida las consultas de transacciones tras editar', async () => {
    const { ordenId } = await prepararConOrden('OC-5005')
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useEditarOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: ordenId, datos: { codigo: 'OC-5005-B' } })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
