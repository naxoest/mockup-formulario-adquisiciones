import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import { crearSolicitud, rechazarSolicitud } from '@/features/transacciones/api/solicitudes'
import { confirmarTransaccion, crearTransaccion } from '@/features/transacciones/api/transacciones'
import { useCrearOrdenDeCompra } from '@/features/transacciones/hooks/useCrearOrdenDeCompra'
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

const FECHA_EMISION = '2026-03-02'

async function prepararConfirmada(): Promise<Transaccion> {
  const borrador = await crearTransaccion(BORRADOR)
  const confirmada = await confirmarTransaccion(borrador.id)
  return crearSolicitud(confirmada.id, { unidadId: 1, tipoSolicitud: 'SABIENES' })
}

function ubicarAgregada(transaccion: Transaccion) {
  const solicitud = transaccion.solicitudes.find((item) => item.tipoSolicitud === 'SABIENES')

  if (!solicitud) {
    throw new Error('No se pudo ubicar la solicitud agregada')
  }

  return solicitud
}

describe('useCrearOrdenDeCompra', () => {
  it('crea la orden en estado enviada a proveedor', async () => {
    const transaccion = await prepararConfirmada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        codigo: 'OC-4501',
        fechaEmision: FECHA_EMISION,
        montos: [{ solicitudId: transaccion.solicitudes[0].id, anio: 2026, monto: 120000 }],
      },
    })

    expect(actualizada.ordenesDeCompra).toHaveLength(1)
    expect(actualizada.ordenesDeCompra[0].codigo).toBe('OC-4501')
    expect(actualizada.ordenesDeCompra[0].estado).toBe('enviada_a_proveedor')
    expect(actualizada.ordenesDeCompra[0].monto).toBe(120000)
  })

  it('crea la orden sobre una transaccion en borrador', async () => {
    const borrador = await crearTransaccion(BORRADOR)
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    const actualizada = await result.current.mutateAsync({
      transaccionId: borrador.id,
      datos: {
        codigo: 'OC-4502',
        fechaEmision: FECHA_EMISION,
        montos: [{ solicitudId: borrador.solicitudes[0].id, anio: 2026, monto: 90000 }],
      },
    })

    expect(actualizada.confirmadaEn).toBeNull()
    expect(actualizada.ordenesDeCompra).toHaveLength(1)
    expect(actualizada.ordenesDeCompra[0].monto).toBe(90000)
  })

  it('rechaza un codigo repetido dentro de la misma transaccion', async () => {
    const transaccion = await prepararConfirmada()
    await crearOrdenDeCompra(transaccion.id, {
      codigo: 'OC-4503',
      fechaEmision: FECHA_EMISION,
      montos: [{ solicitudId: transaccion.solicitudes[0].id, anio: 2026, monto: 1000 }],
    })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          codigo: 'OC-4503',
          fechaEmision: FECHA_EMISION,
          montos: [{ solicitudId: ubicarAgregada(transaccion).id, anio: 2026, monto: 2000 }],
        },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'codigo_duplicado' })
  })

  it('rechaza una solicitud que pertenece a otra transaccion', async () => {
    const propia = await prepararConfirmada()
    const ajena = await prepararConfirmada()
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: propia.id,
        datos: {
          codigo: 'OC-4504',
          fechaEmision: FECHA_EMISION,
          montos: [{ solicitudId: ajena.solicitudes[0].id, anio: 2026, monto: 1000 }],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'solicitud_ajena',
      field: 'montos.0.solicitudId',
    })
  })

  it('rechaza un anio repetido para la misma solicitud dentro de la orden', async () => {
    const transaccion = await prepararConfirmada()
    const solicitudId = transaccion.solicitudes[0].id
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          codigo: 'OC-4505',
          fechaEmision: FECHA_EMISION,
          montos: [
            { solicitudId, anio: 2026, monto: 1000 },
            { solicitudId, anio: 2026, monto: 2000 },
          ],
        },
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'anio_duplicado',
      field: 'montos.1.anio',
    })
  })

  it('rechaza una solicitud que ya fue rechazada', async () => {
    const transaccion = await prepararConfirmada()
    const agregada = ubicarAgregada(transaccion)
    await rechazarSolicitud(agregada.id, { observacion: 'La unidad desistio' })
    const { Envoltorio } = crearEnvoltorio()
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    await expect(
      result.current.mutateAsync({
        transaccionId: transaccion.id,
        datos: {
          codigo: 'OC-4506',
          fechaEmision: FECHA_EMISION,
          montos: [{ solicitudId: agregada.id, anio: 2026, monto: 1000 }],
        },
      }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, code: 'solicitud_rechazada' })
  })

  it('invalida las consultas de transacciones tras crear', async () => {
    const transaccion = await prepararConfirmada()
    const { queryClient, Envoltorio } = crearEnvoltorio()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCrearOrdenDeCompra(), { wrapper: Envoltorio })

    await result.current.mutateAsync({
      transaccionId: transaccion.id,
      datos: {
        codigo: 'OC-4507',
        fechaEmision: FECHA_EMISION,
        montos: [{ solicitudId: transaccion.solicitudes[0].id, anio: 2026, monto: 1000 }],
      },
    })

    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['transacciones'] })
  })
})
