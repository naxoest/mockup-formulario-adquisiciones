import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useRechazarSolicitud } from '@/features/transacciones/hooks/useRechazarSolicitud'
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

describe('useRechazarSolicitud', () => {
  it('rechaza la solicitud registrando la observacion obligatoria', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      id: solicitudId,
      datos: { observacion: 'La unidad desistio de la compra' },
    })
    const solicitud = transaccion.solicitudes.find((item) => item.id === solicitudId)

    expect(solicitud?.estado).toBe('rechazada')
  })

  it('rechaza el cuerpo cuando la observacion viene vacia', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: solicitudId, datos: { observacion: '' } }),
    ).rejects.toMatchObject({ name: 'ApiError' })
  })

  it('rechaza rechazar una solicitud que participa en una orden de compra', async () => {
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
      codigo: 'OC-9202',
      fechaEmision: '2026-03-02',
      montos: [{ solicitudId: agregada.id, anio: 2026, monto: 80000 }],
    })

    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useRechazarSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({ id: agregada.id, datos: { observacion: 'Sin presupuesto' } }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'solicitud_en_orden' })
  })

  it('invalida las consultas de transacciones tras rechazar', async () => {
    const solicitudId = await prepararSolicitudEnviada()
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRechazarSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      id: solicitudId,
      datos: { observacion: 'Presupuesto agotado' },
    })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
