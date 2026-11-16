import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearFactura } from '@/features/transacciones/api/facturas'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useAceptarFactura } from '@/features/transacciones/hooks/useAceptarFactura'
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

async function prepararFactura(codigo: string, folio: number): Promise<number> {
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
  const transaccion = await crearFactura(conOrden.id, {
    folio,
    fechaEmision: '2026-04-02',
    montos: [{ montoOrdenCompraId: conOrden.ordenesDeCompra[0].montos[0].id, monto: 100000 }],
  })

  return transaccion.facturas[0].id
}

describe('useAceptarFactura', () => {
  it('lleva la factura de pendiente a aceptada', async () => {
    const facturaId = await prepararFactura('OC-1201', 89001)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAceptarFactura(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({ id: facturaId })
    const factura = transaccion.facturas.find((item) => item.id === facturaId)

    expect(factura?.estado).toBe('aceptada')
  })

  it('rechaza aceptar dos veces la misma factura', async () => {
    const facturaId = await prepararFactura('OC-1202', 89002)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAceptarFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: facturaId })

    await expect(result.current.mutateAsync({ id: facturaId })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transicion_ilegal',
      field: 'estado',
    })
  })

  it('propaga un ApiError cuando la factura no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAceptarFactura(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync({ id: 999999 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'factura_inexistente',
    })
  })

  it('invalida las consultas de transacciones tras aceptar', async () => {
    const facturaId = await prepararFactura('OC-1203', 89003)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAceptarFactura(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: facturaId })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
