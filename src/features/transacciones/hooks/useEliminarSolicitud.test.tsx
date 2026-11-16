import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useEliminarSolicitud } from '@/features/transacciones/hooks/useEliminarSolicitud'
import { datosDeBorrador, pedirTransaccion } from '@/mocks/pruebas'

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

describe('useEliminarSolicitud', () => {
  it('elimina la solicitud de un borrador y no devuelve cuerpo', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEliminarSolicitud(), { wrapper: Envoltorio })

    const devuelto = await result.current.mutateAsync(borrador.solicitudes[0].id)
    const { cuerpo } = await pedirTransaccion(`/api/transacciones/${borrador.id}`)

    expect(devuelto).toBeUndefined()
    expect(cuerpo.solicitudes).toHaveLength(0)
  })

  it('rechaza dejar una transaccion confirmada sin solicitudes activas', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const confirmada = await confirmarTransaccion(borrador.id)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEliminarSolicitud(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync(confirmada.solicitudes[0].id)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'sin_solicitudes_activas',
    })
  })

  it('propaga un ApiError cuando la solicitud no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEliminarSolicitud(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync(999999)).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'solicitud_inexistente',
    })
  })

  it('rechaza eliminar una solicitud que participa en una orden de compra', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const confirmada = await confirmarTransaccion(borrador.id)
    const transaccion = await crearSolicitud(confirmada.id, {
      unidadId: 1,
      tipoSolicitud: 'SABIENES',
    })
    const agregada = transaccion.solicitudes.find((item) => item.tipoSolicitud === 'SABIENES')

    if (!agregada) {
      throw new Error('No se pudo ubicar la solicitud agregada')
    }

    await crearOrdenDeCompra(transaccion.id, {
      codigo: 'OC-9201',
      fechaEmision: '2026-03-02',
      montos: [{ solicitudId: agregada.id, anio: 2026, monto: 80000 }],
    })

    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEliminarSolicitud(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync(agregada.id)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'solicitud_en_orden',
    })
  })

  it('invalida las consultas de transacciones tras eliminar', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useEliminarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync(borrador.solicitudes[0].id)

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
