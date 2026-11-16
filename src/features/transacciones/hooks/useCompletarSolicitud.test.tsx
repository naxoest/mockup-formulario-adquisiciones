import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  asignarSolicitud,
  crearSolicitud,
  iniciarProcesoSolicitud,
} from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useCompletarSolicitud } from '@/features/transacciones/hooks/useCompletarSolicitud'
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

async function prepararSolicitudEnProceso(): Promise<number> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  const previos = confirmada.solicitudes.map((solicitud) => solicitud.id)
  const transaccion = await crearSolicitud(confirmada.id, {
    unidadId: 1,
    tipoSolicitud: 'SABIENES',
  })
  const agregada = transaccion.solicitudes.find((solicitud) => !previos.includes(solicitud.id))

  if (!agregada) {
    throw new Error('No se pudo preparar la solicitud en proceso')
  }

  await asignarSolicitud(agregada.id)
  await iniciarProcesoSolicitud(agregada.id)

  return agregada.id
}

describe('useCompletarSolicitud', () => {
  it('lleva la solicitud de en proceso a completada', async () => {
    const solicitudId = await prepararSolicitudEnProceso()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCompletarSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({ id: solicitudId })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.estado).toBe('completada')
  })

  it('rechaza completar dos veces la misma solicitud', async () => {
    const solicitudId = await prepararSolicitudEnProceso()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCompletarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: solicitudId })

    await expect(result.current.mutateAsync({ id: solicitudId })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'transicion_ilegal',
    })
  })

  it('invalida las consultas de transacciones tras completar', async () => {
    const solicitudId = await prepararSolicitudEnProceso()
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCompletarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ id: solicitudId })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
