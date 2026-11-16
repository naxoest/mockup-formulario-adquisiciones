import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import { crearFactura } from '@/features/transacciones/api/facturas'
import {
  cancelarOrdenDeCompra,
  crearOrdenDeCompra,
} from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useReemplazarMontosOrdenDeCompra } from '@/features/transacciones/hooks/useReemplazarMontosOrdenDeCompra'
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
  const agregada = conOrden.solicitudes.find((item) => item.tipoSolicitud === 'SABIENES')

  if (!agregada) {
    throw new Error('No se pudo ubicar la solicitud agregada')
  }

  return {
    transaccion: conOrden,
    ordenId: conOrden.ordenesDeCompra[0].id,
    primeraId: conOrden.solicitudes[0].id,
    segundaId: agregada.id,
  }
}

describe('useReemplazarMontosOrdenDeCompra', () => {
  it('reemplaza los montos y recalcula el total de la orden', async () => {
    const { ordenId, primeraId, segundaId } = await prepararConOrden('OC-6001')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: ordenId,
      datos: {
        montos: [
          { solicitudId: primeraId, anio: 2026, monto: 50000 },
          { solicitudId: segundaId, anio: 2026, monto: 70000 },
        ],
      },
    })
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    expect(orden?.montos).toHaveLength(2)
    expect(orden?.monto).toBe(120000)
  })

  it('reemplaza los montos de una orden en una transaccion en borrador', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const conOrden = await crearOrdenDeCompra(borrador.id, {
      codigo: 'OC-6006',
      fechaEmision: '2026-03-02',
      montos: [{ solicitudId: borrador.solicitudes[0].id, anio: 2026, monto: 100000 }],
    })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: conOrden.ordenesDeCompra[0].id,
      datos: { montos: [{ solicitudId: borrador.solicitudes[0].id, anio: 2026, monto: 25000 }] },
    })

    expect(transaccion.confirmadaEn).toBeNull()
    expect(transaccion.ordenesDeCompra[0].monto).toBe(25000)
  })

  it('rechaza reemplazar los montos de una orden cancelada', async () => {
    const { ordenId, primeraId } = await prepararConOrden('OC-6002')
    await cancelarOrdenDeCompra(ordenId, { observacion: 'Error de digitacion' })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: ordenId,
        datos: { montos: [{ solicitudId: primeraId, anio: 2026, monto: 10000 }] },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'orden_cancelada' })
  })

  it('rechaza un anio repetido para la misma solicitud en el reemplazo', async () => {
    const { ordenId, primeraId } = await prepararConOrden('OC-6003')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: ordenId,
        datos: {
          montos: [
            { solicitudId: primeraId, anio: 2026, monto: 10000 },
            { solicitudId: primeraId, anio: 2026, monto: 20000 },
          ],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'anio_duplicado',
      field: 'montos.1.anio',
    })
  })

  it('rechaza reemplazar los montos de una orden que ya tiene facturas', async () => {
    const { transaccion, ordenId, primeraId } = await prepararConOrden('OC-6005')
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

    if (!orden) {
      throw new Error('No se pudo ubicar la orden creada')
    }

    await crearFactura(transaccion.id, {
      folio: 91001,
      fechaEmision: '2026-04-02',
      montos: [{ montoOrdenCompraId: orden.montos[0].id, monto: 40000 }],
    })

    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: ordenId,
        datos: { montos: [{ solicitudId: primeraId, anio: 2026, monto: 20000 }] },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'orden_con_facturas' })
  })

  it('invalida las consultas de transacciones tras reemplazar', async () => {
    const { ordenId, primeraId } = await prepararConOrden('OC-6004')
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useReemplazarMontosOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      id: ordenId,
      datos: { montos: [{ solicitudId: primeraId, anio: 2026, monto: 30000 }] },
    })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
