import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import {
  analistasResponseSchema,
  asignacionAnalistasResponseSchema,
} from '@/features/transacciones/schemas/analistaResponse.schema'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { conCuerpo, pedirError } from '@/mocks/pruebas'

const RUN_ADMINISTRADOR = 12345678
const RUN_FERRADA = 16234875
const RUN_ARAVENA = 9876543
const RUN_CONTRERAS = 15432109

describe('Asignacion de analistas', () => {
  it('reserva la consulta y la modificacion al administrador', async () => {
    iniciarSesionSimuladaPorRun(RUN_FERRADA)

    const consulta = await pedirError('/api/transacciones/1/analistas')
    const modificacion = await pedirError(
      '/api/transacciones/1/analistas',
      conCuerpo('PUT', { principal: null, apoyo: [] }),
    )

    expect(consulta.respuesta.status).toBe(403)
    expect(modificacion.respuesta.status).toBe(403)
  })

  it('ofrece solo usuarios activos con rol analista', async () => {
    iniciarSesionSimuladaPorRun(RUN_ADMINISTRADOR)

    const respuesta = await fetch(`${API_BASE_URL}/api/analistas`)
    const runs = analistasResponseSchema
      .parse(await respuesta.json())
      .map((analista) => analista.run)

    expect(runs).toContain(RUN_FERRADA)
    expect(runs).not.toContain(RUN_CONTRERAS)
    expect(runs).not.toContain(RUN_ADMINISTRADOR)
  })

  it('reemplaza el equipo y registra los cambios en el historial', async () => {
    iniciarSesionSimuladaPorRun(RUN_ADMINISTRADOR)

    const respuesta = await fetch(
      `${API_BASE_URL}/api/transacciones/6/analistas`,
      conCuerpo('PUT', {
        principal: RUN_ARAVENA,
        apoyo: [RUN_FERRADA],
        observacion: 'Reasignación',
      }),
    )
    const asignacion = asignacionAnalistasResponseSchema.parse(await respuesta.json())

    expect(respuesta.status).toBe(200)
    expect(asignacion.principal?.run).toBe(RUN_ARAVENA)
    expect(asignacion.apoyo.map((analista) => analista.run)).toEqual([RUN_FERRADA])

    const historial = historialResponseSchema.parse(
      await (await fetch(`${API_BASE_URL}/api/transacciones/6/historial`)).json(),
    )
    const titulos = historial.eventos.map((evento) =>
      evento.clase === 'registro' ? evento.titulo : null,
    )

    expect(titulos).toContain('Sebastián Aravena quedó como analista principal')
    expect(titulos).toContain('Camila Ferrada se sumó como analista de apoyo')
    expect(historial.cabecera.analistas.principal?.nombre).toBe('Sebastián Aravena')
  })

  it('rechaza analistas no elegibles o repetidos', async () => {
    iniciarSesionSimuladaPorRun(RUN_ADMINISTRADOR)

    const noElegible = await pedirError(
      '/api/transacciones/1/analistas',
      conCuerpo('PUT', { principal: RUN_CONTRERAS, apoyo: [] }),
    )
    const repetido = await pedirError(
      '/api/transacciones/1/analistas',
      conCuerpo('PUT', { principal: RUN_FERRADA, apoyo: [RUN_FERRADA] }),
    )

    expect(noElegible.cuerpo.code).toBe('analista_no_elegible')
    expect(noElegible.cuerpo.field).toBe('principal')
    expect(repetido.cuerpo.code).toBe('analista_duplicado')
  })
})
