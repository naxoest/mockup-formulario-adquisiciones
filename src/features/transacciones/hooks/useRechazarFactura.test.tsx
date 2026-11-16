import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearFactura } from '@/features/transacciones/api/facturas'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useRechazarFactura } from '@/features/transacciones/hooks/useRechazarFactura'
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
  transaccionId: number
  facturaId: number
  montoOrdenId: number
}

async function prepararFactura(codigo: string, folio: number): Promise<Preparada> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  const conSolicitud = await crearSolicitud(confirmada.id, {
    unidadId: 1,
    tipoSolicitud: 'SABIENES',
  })
  const conOrden = await crearOrdenDeCompra(conSolicitud.id, {
    codigo,
    fechaEmision: '2026-03-02',
    montos: [{ solicitudId: conSolicitud.solicitudes[0].id, anio: 2026, monto: 100000 }],
  })
  const montoOrdenId = conOrden.ordenesDeCompra[0].montos[0].id
  const transaccion = await crearFactura(conOrden.id, {
    folio,
    fechaEmision: '2026-04-02',
    montos: [{ montoOrdenCompraId: montoOrdenId, monto: 100000 }],
  })

  return { transaccionId: transaccion.id, facturaId: transaccion.facturas[0].id, montoOrdenId }
}

describe('useRechazarFactura', () => {
  it('rechaza la factura registrando la observacion obligatoria', async () => {
    const { facturaId } = await prepararFactura('OC-1301', 90001)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarFactura(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: facturaId,
      datos: { observacion: 'El detalle no coincide con la recepcion' },
    })
    const factura = transaccion.facturas.find((item) => item.id === facturaId)

    expect(factura?.estado).toBe('rechazada')
  })

  it('excluye del facturado la factura rechazada al registrar otra por el mismo monto', async () => {
    const { transaccionId, facturaId, montoOrdenId } = await prepararFactura('OC-1302', 90002)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      id: facturaId,
      datos: { observacion: 'Folio emitido con error' },
    })
    const transaccion = await crearFactura(transaccionId, {
      folio: 90003,
      fechaEmision: '2026-04-09',
      montos: [{ montoOrdenCompraId: montoOrdenId, monto: 100000 }],
    })

    expect(transaccion.facturas).toHaveLength(2)
    expect(transaccion.montoFacturado).toBe(100000)
  })

  it('rechaza el cuerpo cuando la observacion viene vacia', async () => {
    const { facturaId } = await prepararFactura('OC-1303', 90004)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarFactura(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: facturaId, datos: { observacion: '' } }),
    ).rejects.toMatchObject({ name: 'ApiError' })
  })

  it('rechaza rechazar una factura ya rechazada', async () => {
    const { facturaId } = await prepararFactura('OC-1304', 90005)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: facturaId, datos: { observacion: 'Monto erroneo' } })

    await expect(
      result.current.mutateAsync({ id: facturaId, datos: { observacion: 'Se rechaza de nuevo' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'transicion_ilegal' })
  })

  it('invalida las consultas de transacciones tras rechazar', async () => {
    const { facturaId } = await prepararFactura('OC-1305', 90006)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRechazarFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: facturaId, datos: { observacion: 'Sin respaldo' } })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
