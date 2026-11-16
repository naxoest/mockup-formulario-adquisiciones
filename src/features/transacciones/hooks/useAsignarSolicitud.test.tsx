import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useAsignarSolicitud } from '@/features/transacciones/hooks/useAsignarSolicitud'
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

async function prepararSolicitudEnviada(): Promise<number> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  const previos = confirmada.solicitudes.map((solicitud) => solicitud.id)
  const transaccion = await crearSolicitud(confirmada.id, {
    unidadId: 1,
    tipoSolicitud: 'SABIENES',
  })
  const agregada = transaccion.solicitudes.find((solicitud) => !previos.includes(solicitud.id))

  if (!agregada) {
    throw new Error('No se pudo preparar la solicitud enviada')
  }

  return agregada.id
}

describe('useAsignarSolicitud', () => {
  it('lleva la solicitud de enviada a asignado', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAsignarSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({ id: solicitudId })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.estado).toBe('asignado')
  })

  it('rechaza asignar dos veces la misma solicitud', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAsignarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: solicitudId })

    await expect(result.current.mutateAsync({ id: solicitudId })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transicion_ilegal',
    })
  })

  it('rechaza la transicion cuando la transaccion no esta confirmada', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useAsignarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: borrador.solicitudes[0].id }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'transaccion_no_confirmada' })
  })

  it('invalida las consultas de transacciones tras asignar', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAsignarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: solicitudId })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
