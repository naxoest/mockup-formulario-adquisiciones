import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'
import { conCuerpo, pedirTransaccion } from '@/mocks/pruebas'

type Historial = ReturnType<typeof historialResponseSchema.parse>
type Evento = Historial['eventos'][number]
type Hito = Extract<Evento, { clase: 'hito' }>

async function pedirHistorial(id: number): Promise<Historial> {
  const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${id}/historial`)
  return historialResponseSchema.parse(await respuesta.json())
}

describe('GET /transacciones/:id/historial', () => {
  it('termina en un hito que coincide con el estado de cada transaccion', async () => {
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const historial = await pedirHistorial(id)
      const hitos = historial.eventos.filter((evento): evento is Hito => evento.clase === 'hito')

      expect(hitos.at(-1)?.estado).toBe(historial.situacion.estado)
    }
  })

  it('registra el paso y el cambio de estado al registrar un paso del proceso', async () => {
    await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      conCuerpo('POST', {
        paso: 'presupuesto_solicitado',
        fecha: '2026-06-10',
        observacion: null,
      }),
    )

    const historial = await pedirHistorial(5)
    const [paso, hito] = historial.eventos.slice(-2)

    expect(paso).toMatchObject({
      clase: 'paso',
      paso: 'presupuesto_solicitado',
      fechaHecho: '2026-06-10',
    })
    expect(hito).toMatchObject({ clase: 'hito', estado: 'Presupuesto solicitado' })
    expect(historial.avance.etapas).toEqual([
      'En cotización',
      'Cotizada',
      'Presupuesto solicitado',
      'Presupuesto asignado',
      'Enviada a adquisiciones',
      'Analista asignado',
      'Aprobada',
      'Facturada',
      'Cerrada',
    ])
  })

  it('informa a los analistas y pide asignar un principal cuando falta', async () => {
    const conPrincipal = await pedirHistorial(1)
    const sinPrincipal = await pedirHistorial(6)

    expect(conPrincipal.cabecera.analistas).toEqual({
      principal: { nombre: 'Camila Ferrada' },
      apoyo: [{ nombre: 'Sebastián Aravena' }],
    })
    expect(sinPrincipal.cabecera.analistas.principal).toBeNull()
    expect(sinPrincipal.situacion.pendientes.map((pendiente) => pendiente.id)).toContain(
      'pend-analista',
    )
  })

  it('registra el paso deshecho con su observacion y el cambio de estado', async () => {
    await pedirTransaccion(
      '/api/transacciones/3/deshacer-paso',
      conCuerpo('POST', { paso: 'aprobada', observacion: 'Se registró por error.' }),
    )

    const historial = await pedirHistorial(3)
    const [paso, hito] = historial.eventos.slice(-2)

    expect(paso).toMatchObject({
      clase: 'paso',
      accion: 'deshecho',
      paso: 'aprobada',
      fechaHecho: null,
      observacion: 'Se registró por error.',
    })
    expect(hito).toMatchObject({ clase: 'hito', estado: 'Analista asignado' })
  })
})
