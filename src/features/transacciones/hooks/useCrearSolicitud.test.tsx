import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useCrearSolicitud } from '@/features/transacciones/hooks/useCrearSolicitud'
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

const NUEVA = { unidadId: 1, tipoSolicitud: 'SABIENES' }

describe('useCrearSolicitud', () => {
  it('agrega una solicitud sin estado cuando la transaccion es borrador', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      transaccionId: borrador.id,
      datos: NUEVA,
    })

    expect(transaccion.solicitudes).toHaveLength(2)
    expect(transaccion.solicitudes.every((solicitud) => solicitud.estado === null)).toBe(true)
  })

  it('agrega una solicitud en estado enviada cuando la transaccion esta confirmada', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const confirmada = await confirmarTransaccion(borrador.id)
    const previos = confirmada.solicitudes.map((solicitud) => solicitud.id)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      transaccionId: confirmada.id,
      datos: NUEVA,
    })
    const agregada = transaccion.solicitudes.find((solicitud) => !previos.includes(solicitud.id))

    expect(agregada?.estado).toBe('enviada')
  })

  it('propaga un ApiError cuando la unidad no existe', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearSolicitud(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: borrador.id,
        datos: { unidadId: 999999, tipoSolicitud: 'SASERVI' },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400, field: 'unidadId' })
  })

  it('invalida las consultas de transacciones tras crear', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCrearSolicitud(), { wrapper: Envoltorio })

    await result.current.mutateAsync({ transaccionId: borrador.id, datos: NUEVA })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })

  it('registra el financiamiento de la solicitud agregada', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const previos = borrador.solicitudes.map((solicitud) => solicitud.id)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearSolicitud(), { wrapper: Envoltorio })

    const transaccion = await result.current.mutateAsync({
      transaccionId: borrador.id,
      datos: { ...NUEVA, financiamiento: 'proyectos' },
    })
    const agregada = transaccion.solicitudes.find((solicitud) => !previos.includes(solicitud.id))

    expect(agregada?.financiamiento).toBe('proyectos')
  })
})
