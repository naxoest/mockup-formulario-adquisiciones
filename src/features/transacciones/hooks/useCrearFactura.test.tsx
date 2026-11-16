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
import { useCrearFactura } from '@/features/transacciones/hooks/useCrearFactura'
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

interface Preparada {
  transaccion: Transaccion
  ordenId: number
  montoOrdenId: number
}

async function prepararConOrden(codigo: string): Promise<Preparada> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  const conSolicitud = await crearSolicitud(confirmada.id, {
    unidadId: 1,
    tipoSolicitud: 'SABIENES',
  })
  const transaccion = await crearOrdenDeCompra(conSolicitud.id, {
    codigo,
    fechaEmision: '2026-03-02',
    montos: [{ solicitudId: conSolicitud.solicitudes[0].id, anio: 2026, monto: 100000 }],
  })
  const orden = transaccion.ordenesDeCompra[0]

  return { transaccion, ordenId: orden.id, montoOrdenId: orden.montos[0].id }
}

describe('useCrearFactura', () => {
  it('registra la factura en estado pendiente con su monto total', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1101')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        folio: 88001,
        fechaEmision: '2026-04-02',
        montos: [{ montoOrdenCompraId: montoOrdenId, monto: 100000 }],
      },
    })

    expect(actualizada.facturas).toHaveLength(1)
    expect(actualizada.facturas[0].folio).toBe(88001)
    expect(actualizada.facturas[0].estado).toBe('pendiente')
    expect(actualizada.facturas[0].monto).toBe(100000)
  })

  it('admite varias facturas sobre el mismo monto de orden', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1102')
    await crearFactura(transaccion.id, {
      folio: 88002,
      fechaEmision: '2026-04-02',
      montos: [{ montoOrdenCompraId: montoOrdenId, monto: 40000 }],
    })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        folio: 88003,
        fechaEmision: '2026-04-09',
        montos: [{ montoOrdenCompraId: montoOrdenId, monto: 60000 }],
      },
    })

    expect(actualizada.facturas).toHaveLength(2)
    expect(actualizada.montoFacturado).toBe(100000)
  })

  it('admite una factura que excede el monto de la orden', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1103')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        folio: 88004,
        fechaEmision: '2026-04-02',
        montos: [{ montoOrdenCompraId: montoOrdenId, monto: 100001 }],
      },
    })

    expect(actualizada.montoFacturado).toBe(100001)
  })

  it('rechaza un folio repetido dentro de la misma transaccion', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1104')
    await crearFactura(transaccion.id, {
      folio: 88005,
      fechaEmision: '2026-04-02',
      montos: [{ montoOrdenCompraId: montoOrdenId, monto: 10000 }],
    })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          folio: 88005,
          fechaEmision: '2026-04-09',
          montos: [{ montoOrdenCompraId: montoOrdenId, monto: 10000 }],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'folio_duplicado',
      field: 'folio',
    })
  })

  it('rechaza un monto de orden que pertenece a otra transaccion', async () => {
    const propia = await prepararConOrden('OC-1105')
    const ajena = await prepararConOrden('OC-1106')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: propia.transaccion.id,
        datos: {
          folio: 88006,
          fechaEmision: '2026-04-02',
          montos: [{ montoOrdenCompraId: ajena.montoOrdenId, monto: 10000 }],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'monto_orden_ajeno',
      field: 'montos.0.montoOrdenCompraId',
    })
  })

  it('rechaza el mismo monto de orden repetido dentro de la factura', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1107')
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          folio: 88007,
          fechaEmision: '2026-04-02',
          montos: [
            { montoOrdenCompraId: montoOrdenId, monto: 10000 },
            { montoOrdenCompraId: montoOrdenId, monto: 20000 },
          ],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'monto_orden_duplicado',
      field: 'montos.1.montoOrdenCompraId',
    })
  })

  it('rechaza facturar contra una orden cancelada', async () => {
    const { transaccion, ordenId, montoOrdenId } = await prepararConOrden('OC-1108')
    await cancelarOrdenDeCompra(ordenId, { observacion: 'El proveedor no despacho' })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          folio: 88008,
          fechaEmision: '2026-04-02',
          montos: [{ montoOrdenCompraId: montoOrdenId, monto: 10000 }],
        },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'orden_cancelada' })
  })

  it('registra la factura sobre una transaccion en borrador', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const conOrden = await crearOrdenDeCompra(borrador.id, {
      codigo: 'OC-1110',
      fechaEmision: '2026-03-02',
      montos: [{ solicitudId: borrador.solicitudes[0].id, anio: 2026, monto: 50000 }],
    })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: conOrden.id,
      datos: {
        folio: 88009,
        fechaEmision: '2026-04-02',
        montos: [{ montoOrdenCompraId: conOrden.ordenesDeCompra[0].montos[0].id, monto: 50000 }],
      },
    })

    expect(actualizada.confirmadaEn).toBeNull()
    expect(actualizada.facturas).toHaveLength(1)
    expect(actualizada.facturas[0].monto).toBe(50000)
  })

  it('invalida las consultas de transacciones tras registrar', async () => {
    const { transaccion, montoOrdenId } = await prepararConOrden('OC-1109')
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCrearFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        folio: 88010,
        fechaEmision: '2026-04-02',
        montos: [{ montoOrdenCompraId: montoOrdenId, monto: 10000 }],
      },
    })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
