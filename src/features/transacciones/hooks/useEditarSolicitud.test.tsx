import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useEditarSolicitud } from '@/features/transacciones/hooks/useEditarSolicitud'
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

describe('useEditarSolicitud', () => {
  it('reemplaza los precompromisos y deriva el monto de cotizacion', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const solicitudId = borrador.solicitudes[0].id
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: solicitudId,
      datos: {
        precompromisos: [
          { anio: 2027, monto: 150000 },
          { anio: 2026, monto: 300000 },
        ],
      },
    })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.precompromisos).toEqual([
      { anio: 2026, monto: 300000 },
      { anio: 2027, monto: 150000 },
    ])
    expect(solicitud?.montoCotizacion).toBe(450000)
  })

  it('elimina todos los precompromisos con una lista vacia', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const solicitudId = borrador.solicitudes[0].id
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      id: solicitudId,
      datos: { precompromisos: [{ anio: 2026, monto: 450000 }] },
    })
    const transaccion = await result.current.mutateAsync({
      id: solicitudId,
      datos: { precompromisos: [] },
    })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.precompromisos).toEqual([])
    expect(solicitud?.montoCotizacion).toBeNull()
  })

  it('modifica el estado de evaluacion de una solicitud', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const solicitudId = borrador.solicitudes[0].id
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: solicitudId,
      datos: { estadoEvaluacion: 'en_evaluacion' },
    })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.estadoEvaluacion).toBe('en_evaluacion')
  })

  it('propaga un ApiError cuando la solicitud no existe', async () => {
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: 999999,
        datos: { precompromisos: [{ anio: 2026, monto: 1000 }] },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 404, code: 'solicitud_inexistente' })
  })

  it('invalida las consultas de transacciones tras editar', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      id: borrador.solicitudes[0].id,
      datos: { precompromisos: [{ anio: 2026, monto: 1000 }] },
    })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })

  it('rechaza un anio que no existe en el catalogo de periodos', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: borrador.solicitudes[0].id,
        datos: { precompromisos: [{ anio: 1999, monto: 1000 }] },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400, code: 'periodo_inexistente' })
  })

  it('rechaza dos montos del mismo anio', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: borrador.solicitudes[0].id,
        datos: {
          precompromisos: [
            { anio: 2026, monto: 1000 },
            { anio: 2026, monto: 2000 },
          ],
        },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'anio_duplicado' })
  })

  it('asigna y quita el financiamiento de una solicitud', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const solicitudId = borrador.solicitudes[0].id
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    const asignada = await result.current.mutateAsync({
      id: solicitudId,
      datos: { financiamiento: 'proyectos' },
    })
    const quitada = await result.current.mutateAsync({
      id: solicitudId,
      datos: { financiamiento: null },
    })

    expect(asignada.solicitudes.find((item) => item.id === solicitudId)?.financiamiento).toBe(
      'proyectos',
    )
    expect(quitada.solicitudes.find((item) => item.id === solicitudId)?.financiamiento).toBeNull()
  })

  it('rechaza un financiamiento que no existe en el catalogo', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useEditarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        id: borrador.solicitudes[0].id,
        datos: { financiamiento: 'inexistente' },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'financiamiento_inexistente',
      field: 'financiamiento',
    })
  })
})
