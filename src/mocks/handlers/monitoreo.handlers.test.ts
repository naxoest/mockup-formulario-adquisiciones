import { describe, expect, it } from 'vitest'
import {
  conCuerpo,
  pedirBloqueadores,
  pedirError,
  pedirMonitoreo,
  pedirRegistroMonitoreo,
  pedirSinCuerpo,
  pedirTransaccion,
} from '@/mocks/pruebas'

const RUTA = '/api/monitoreo/3'

describe('GET /monitoreo/bloqueadores', () => {
  it('entrega el catalogo en el orden definido por el backend', async () => {
    const { respuesta, cuerpo } = await pedirBloqueadores('/api/monitoreo/bloqueadores')

    expect(respuesta.status).toBe(200)
    expect(cuerpo.map((opcion) => opcion.value)).toEqual([
      'presupuesto',
      'adquisiciones',
      'proveedores',
      'gestion_no_iniciada',
      'carrera',
      'equipo_enlace_compras',
      'otros',
    ])
  })
})

describe('GET /monitoreo', () => {
  it('entrega solo los registros de transacciones existentes y confirmadas', async () => {
    const { respuesta, cuerpo } = await pedirMonitoreo('/api/monitoreo')

    expect(respuesta.status).toBe(200)
    expect(cuerpo.map((registro) => registro.transaccionId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('emite el ultimo movimiento sin offset de zona horaria', async () => {
    const respuesta = await pedirSinCuerpo('/api/monitoreo')
    const cuerpo = (await respuesta.json()) as Array<{ ultimoMovimiento: string | null }>
    const conMovimiento = cuerpo.filter((registro) => registro.ultimoMovimiento !== null)

    expect(conMovimiento.length).toBeGreaterThan(0)
    for (const registro of conMovimiento) {
      expect(registro.ultimoMovimiento).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    }
  })

  it('obtiene el analista principal desde las asignaciones de la transaccion', async () => {
    const { cuerpo } = await pedirMonitoreo('/api/monitoreo')

    expect(cuerpo.find((registro) => registro.transaccionId === 1)?.analista).toEqual({
      run: 16234875,
      nombre: 'Camila Ferrada',
    })
    expect(cuerpo.find((registro) => registro.transaccionId === 6)?.analista).toBeNull()
  })

  it('entrega el nombre del proceso desde la transaccion', async () => {
    await pedirTransaccion(
      '/api/transacciones/3',
      conCuerpo('PATCH', { nombre: 'Mobiliario para el aula magna' }),
    )

    const { cuerpo } = await pedirMonitoreo('/api/monitoreo')

    expect(cuerpo.find((registro) => registro.transaccionId === 3)?.nombre).toBe(
      'Mobiliario para el aula magna',
    )
  })
})

describe('PATCH /monitoreo/:transaccionId', () => {
  it('rechaza los campos de gestion anotada eliminados del contrato', async () => {
    const { respuesta } = await pedirError(
      RUTA,
      conCuerpo('PATCH', { ultimaGestion: 'Reunión con el proveedor' }),
    )

    expect(respuesta.status).toBe(422)
  })

  it('asigna un bloqueador y lo devuelve como opcion', async () => {
    const { respuesta, cuerpo } = await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', { bloqueadorPrincipal: 'proveedores' }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.bloqueadorPrincipal).toEqual({ value: 'proveedores', label: 'Proveedores' })
  })

  it('borra el bloqueador con un nulo explicito', async () => {
    await pedirRegistroMonitoreo(RUTA, conCuerpo('PATCH', { bloqueadorPrincipal: 'proveedores' }))

    const { cuerpo } = await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', { bloqueadorPrincipal: null }),
    )

    expect(cuerpo.bloqueadorPrincipal).toBeNull()
  })

  it('trata la cadena vacia como un borrado', async () => {
    await pedirRegistroMonitoreo(RUTA, conCuerpo('PATCH', { bloqueadorPrincipal: 'carrera' }))

    const { cuerpo } = await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', { bloqueadorPrincipal: '' }),
    )

    expect(cuerpo.bloqueadorPrincipal).toBeNull()
  })

  it('no modifica el bloqueador cuando el campo viene ausente', async () => {
    await pedirRegistroMonitoreo(RUTA, conCuerpo('PATCH', { bloqueadorPrincipal: 'otros' }))

    const { cuerpo } = await pedirRegistroMonitoreo(RUTA, conCuerpo('PATCH', { cerrado: false }))

    expect(cuerpo.bloqueadorPrincipal).toEqual({ value: 'otros', label: 'Otros' })
  })

  it('revierte la operacion completa ante un bloqueador fuera del catalogo', async () => {
    await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', { bloqueadorPrincipal: 'presupuesto', cerrado: false }),
    )

    const { respuesta, cuerpo } = await pedirError(
      RUTA,
      conCuerpo('PATCH', { bloqueadorPrincipal: 'inexistente', cerrado: true }),
    )

    expect(respuesta.status).toBe(422)
    expect(cuerpo.code).toBe('bloqueador_inexistente')
    expect(cuerpo.field).toBe('bloqueadorPrincipal')

    const listado = await pedirMonitoreo('/api/monitoreo')
    const registro = listado.cuerpo.find((fila) => fila.transaccionId === 3)

    expect(registro?.bloqueadorPrincipal?.value).toBe('presupuesto')
    expect(registro?.cerrado).toBe(false)
  })

  it('no emite los campos eliminados en la respuesta', async () => {
    const respuesta = await pedirSinCuerpo(RUTA, conCuerpo('PATCH', {}))
    const cuerpo: unknown = await respuesta.json()

    expect(cuerpo).not.toHaveProperty('ultimaGestion')
    expect(cuerpo).not.toHaveProperty('fechaUltimaGestion')
  })

  it('acepta la proxima revision como fecha de calendario sin desplazar el dia', async () => {
    const { respuesta } = await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', { fechaProximaRevision: '2026-09-24' }),
    )

    expect(respuesta.status).toBe(200)

    const listado = await pedirSinCuerpo('/api/monitoreo')
    const cuerpo = (await listado.json()) as Array<{
      transaccionId: number
      fechaProximaRevision: string | null
    }>

    expect(cuerpo.find((fila) => fila.transaccionId === 3)?.fechaProximaRevision).toBe('2026-09-24')
  })

  it('rechaza la proxima revision enviada como instante con zona horaria', async () => {
    const { respuesta } = await pedirError(
      RUTA,
      conCuerpo('PATCH', { fechaProximaRevision: '2026-09-24T03:00:00.000Z' }),
    )

    expect(respuesta.status).toBe(422)
  })

  it('devuelve la evaluacion recalculada al modificar los factores', async () => {
    const { respuesta, cuerpo } = await pedirRegistroMonitoreo(
      RUTA,
      conCuerpo('PATCH', {
        factores: {
          impactoAcademico: 2,
          urgenciaTemporal: 2,
          exposicionInstitucional: 2,
          riesgoOperacional: 2,
        },
      }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.evaluacion?.indice).toBe(2)
    expect(cuerpo.evaluacion?.nivel).toBe('controlado')
  })
})
