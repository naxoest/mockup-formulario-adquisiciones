import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { asignarSolicitud, crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useIniciarProcesoSolicitud } from '@/features/transacciones/hooks/useIniciarProcesoSolicitud'
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

describe('useIniciarProcesoSolicitud', () => {
  it('lleva la solicitud de asignado a en proceso', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    await asignarSolicitud(solicitudId)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useIniciarProcesoSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({ id: solicitudId })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.estado).toBe('en_proceso')
  })

  it('rechaza iniciar el proceso desde el estado enviada', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useIniciarProcesoSolicitud(), { wrapper: Envoltorio })

    await expect(result.current.mutateAsync({ id: solicitudId })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transicion_ilegal',
    })
  })

  it('invalida las consultas de transacciones tras iniciar el proceso', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    await asignarSolicitud(solicitudId)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useIniciarProcesoSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: solicitudId })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
