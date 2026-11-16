import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { asignacionAnalistasResponseSchema } from '@/features/transacciones/schemas/analistaResponse.schema'
import { cerrarSesionSimulada, iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import {
  conCuerpo,
  crearBorrador,
  pedirError,
  pedirPagina,
  pedirTransaccion,
} from '@/mocks/pruebas'

const RUN_ADMINISTRADOR = 12345678
const RUN_ARAVENA = 9876543
const RUN_FERRADA = 16234875

describe('POST /transacciones', () => {
  it('crea un borrador sin estado y con identificadores por sobre la semilla', async () => {
    const { respuesta, cuerpo } = await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
      solicitudes: [
        {
          unidadId: 1,
          tipoSolicitud: 'SABIENES',
          precompromisos: [{ anio: 2026, monto: 500000 }],
        },
      ],
    })

    expect(respuesta.status).toBe(201)
    expect(respuesta.headers.get('Location')).toBe(`${API_BASE_URL}/api/transacciones/11`)
    expect(cuerpo.id).toBe(11)
    expect(cuerpo.estado).toBeNull()
    expect(cuerpo.confirmadaEn).toBeNull()
    expect(cuerpo.solicitudes[0].id).toBe(126)
    expect(cuerpo.solicitudes[0].estado).toBeNull()
  })

  it('excluye el borrador del listado y lo entrega en el detalle', async () => {
    await crearBorrador({ nombre: 'Compra de prueba', modalidad: 'agil', fecha: '2026-09-01' })

    const listado = await pedirPagina('/api/transacciones?page=1&perPage=25')
    const detalle = await pedirTransaccion('/api/transacciones/11')

    expect(listado.cuerpo.meta.total).toBe(9)
    expect(detalle.cuerpo.id).toBe(11)
  })

  it('rechaza una unidad solicitante inexistente', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones',
      conCuerpo('POST', {
        nombre: 'Compra de prueba',
        modalidad: 'agil',
        fecha: '2026-09-01',
        solicitudes: [{ unidadId: 9999, tipoSolicitud: 'SABIENES' }],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('unidad_inexistente')
    expect(cuerpo.field).toBe('solicitudes.0.unidadId')
  })

  it('registra el financiamiento de cada solicitud, distinto o ausente', async () => {
    const { cuerpo } = await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
      solicitudes: [
        { unidadId: 1, tipoSolicitud: 'SABIENES', financiamiento: 'institucional' },
        { unidadId: 2, tipoSolicitud: 'SASERVI', financiamiento: 'proyectos' },
        { unidadId: 4, tipoSolicitud: 'SABIENES' },
      ],
    })

    expect(cuerpo.solicitudes.map((solicitud) => solicitud.financiamiento)).toEqual([
      'institucional',
      'proyectos',
      null,
    ])
  })

  it('rechaza un financiamiento inexistente en una solicitud', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones',
      conCuerpo('POST', {
        nombre: 'Compra de prueba',
        modalidad: 'agil',
        fecha: '2026-09-01',
        solicitudes: [
          { unidadId: 1, tipoSolicitud: 'SABIENES', financiamiento: 'institucional' },
          { unidadId: 2, tipoSolicitud: 'SABIENES', financiamiento: 'inexistente' },
        ],
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.code).toBe('financiamiento_inexistente')
    expect(cuerpo.field).toBe('solicitudes.1.financiamiento')
  })

  it('rechaza un borrador sin nombre o con un nombre en blanco', async () => {
    const sinNombre = await pedirError(
      '/api/transacciones',
      conCuerpo('POST', { modalidad: 'agil', fecha: '2026-09-01' }),
    )
    const enBlanco = await pedirError(
      '/api/transacciones',
      conCuerpo('POST', { nombre: '   ', modalidad: 'agil', fecha: '2026-09-01' }),
    )

    expect(sinNombre.respuesta.status).toBe(400)
    expect(sinNombre.cuerpo.field).toBe('nombre')
    expect(enBlanco.respuesta.status).toBe(400)
    expect(enBlanco.cuerpo.field).toBe('nombre')
  })

  it('rechaza una carpeta de antecedentes que no sea una direccion http o https', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones',
      conCuerpo('POST', {
        nombre: 'Compra de prueba',
        modalidad: 'agil',
        fecha: '2026-09-01',
        linkCarpetaAntecedentes: 'javascript:alert(1)',
      }),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo.field).toBe('linkCarpetaAntecedentes')
  })
})

describe('PATCH /transacciones/:id', () => {
  it('modifica solo los campos enviados', async () => {
    const { cuerpo } = await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { fecha: '2026-09-02' }),
    )

    expect(cuerpo.fecha).toBe('2026-09-02')
    expect(cuerpo.modalidad).toBe('agil')
    expect(cuerpo.nombre).toBe('Compra consolidada de inicio del año académico')
  })

  it('borra la carpeta con un nulo explicito y la conserva cuando viene ausente', async () => {
    const conservada = await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { fecha: '2026-09-02' }),
    )

    expect(conservada.cuerpo.linkCarpetaAntecedentes).toBe(
      'https://example.org/carpetas/antecedentes-transaccion-1',
    )

    const borrada = await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { linkCarpetaAntecedentes: null }),
    )

    expect(borrada.cuerpo.linkCarpetaAntecedentes).toBeNull()
  })
})

describe('POST /transacciones/:id/confirmar', () => {
  it('responde 409 si ya estaba confirmada', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/transacciones/1/confirmar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('transaccion_ya_confirmada')
  })

  it('responde 409 si no hay solicitudes activas', async () => {
    await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
    })

    const { respuesta, cuerpo } = await pedirError('/api/transacciones/11/confirmar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('sin_solicitudes_activas')
  })

  it('confirma sin exigir financiamiento, envia las solicitudes, deriva el estado y aparece en el listado', async () => {
    await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
      solicitudes: [
        {
          unidadId: 1,
          tipoSolicitud: 'SABIENES',
          precompromisos: [{ anio: 2026, monto: 500000 }],
        },
      ],
    })

    const { respuesta, cuerpo } = await pedirTransaccion('/api/transacciones/11/confirmar', {
      method: 'POST',
    })

    expect(respuesta.status).toBe(200)
    expect(cuerpo.confirmadaEn).not.toBeNull()
    expect(cuerpo.solicitudes[0].estado).toBe('enviada')
    expect(cuerpo.estado).toBe('cotizada')

    const listado = await pedirPagina('/api/transacciones?page=1&perPage=25')

    expect(listado.cuerpo.meta.total).toBe(10)
  })
})

describe('GET /transacciones', () => {
  it('ordena por criticidad con las transacciones sin evaluar al final en ambos sentidos', async () => {
    const ascendente = await pedirPagina('/api/transacciones?page=1&perPage=25&sort=criticidad')
    const descendente = await pedirPagina('/api/transacciones?page=1&perPage=25&sort=-criticidad')

    expect(ascendente.cuerpo.data.map((fila) => fila.id)).toEqual([7, 4, 9, 3, 2, 1, 5, 8, 6])
    expect(descendente.cuerpo.data.map((fila) => fila.id)).toEqual([8, 5, 1, 2, 3, 9, 4, 7, 6])
  })

  it('entrega al analista solo las transacciones donde participa, con su participacion', async () => {
    iniciarSesionSimuladaPorRun(RUN_ARAVENA)

    const { cuerpo } = await pedirPagina('/api/transacciones?page=1&perPage=25')
    const filas = cuerpo.data
      .map((fila) => ({ id: fila.id, participacion: fila.miParticipacion }))
      .sort((a, b) => a.id - b.id)

    expect(cuerpo.meta.total).toBe(2)
    expect(filas).toEqual([
      { id: 1, participacion: 'apoyo' },
      { id: 8, participacion: 'apoyo' },
    ])
  })
})

describe('visibilidad por asignacion', () => {
  it('exige una sesion iniciada', async () => {
    cerrarSesionSimulada()

    const listado = await pedirError('/api/transacciones?page=1&perPage=25')
    const historial = await pedirError('/api/transacciones/1/historial')

    expect(listado.respuesta.status).toBe(401)
    expect(historial.respuesta.status).toBe(401)
  })

  it('responde 404 al analista en una transaccion donde no participa', async () => {
    iniciarSesionSimuladaPorRun(RUN_ARAVENA)

    const visible = await pedirTransaccion('/api/transacciones/1')
    const detalle = await pedirError('/api/transacciones/2')
    const historial = await pedirError('/api/transacciones/2/historial')
    const solicitud = await pedirError(
      '/api/solicitudes/109/completar',
      conCuerpo('POST', { observacion: 'Sin acceso' }),
    )

    expect(visible.respuesta.status).toBe(200)
    expect(detalle.respuesta.status).toBe(404)
    expect(historial.respuesta.status).toBe(404)
    expect(solicitud.cuerpo.code).toBe('solicitud_inexistente')
  })

  it('deja como analista principal al analista que crea la transaccion', async () => {
    iniciarSesionSimuladaPorRun(RUN_FERRADA)

    const { cuerpo } = await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
    })
    const detalle = await pedirTransaccion(`/api/transacciones/${cuerpo.id}`)

    expect(detalle.respuesta.status).toBe(200)

    iniciarSesionSimuladaPorRun(RUN_ADMINISTRADOR)

    const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${cuerpo.id}/analistas`)
    const asignacion = asignacionAnalistasResponseSchema.parse(await respuesta.json())

    expect(asignacion.principal?.run).toBe(RUN_FERRADA)
  })

  it('reserva el monitoreo al administrador', async () => {
    iniciarSesionSimuladaPorRun(RUN_ARAVENA)

    const { respuesta } = await pedirError('/api/monitoreo')

    expect(respuesta.status).toBe(403)
  })
})

function cuerpoDePaso(paso: string, fecha: string, observacion: string | null = null) {
  return conCuerpo('POST', { paso, fecha, observacion })
}

describe('POST /transacciones/:id/registrar-paso', () => {
  it('registra el primer paso, deriva el estado e informa el siguiente', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('presupuesto_solicitado', '2026-06-10'),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.estado).toBe('presupuesto_solicitado')
    expect(cuerpo.proceso.pasoActual).toBe('presupuesto_solicitado')
    expect(cuerpo.proceso.registrados.map((registrado) => registrado.fecha)).toEqual(['2026-06-10'])
    expect(cuerpo.proceso.siguientesPermitidos).toEqual([
      {
        paso: 'presupuesto_asignado',
        etiqueta: 'Presupuesto asignado',
        requiereObservacion: false,
      },
    ])
  })

  it('ofrece las dos opciones de aprobacion y exige observacion en la aprobacion con observaciones', async () => {
    await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('presupuesto_solicitado', '2026-06-08'),
    )
    const asignado = await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('presupuesto_asignado', '2026-06-09'),
    )
    await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('enviada_a_adquisiciones', '2026-06-10'),
    )
    const { cuerpo } = await pedirTransaccion(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('analista_asignado', '2026-06-11'),
    )

    expect(asignado.cuerpo.proceso.siguientesPermitidos.map((item) => item.paso)).toEqual([
      'enviada_a_adquisiciones',
    ])

    expect(cuerpo.proceso.siguientesPermitidos).toEqual([
      { paso: 'aprobada', etiqueta: 'Aprobada', requiereObservacion: false },
      {
        paso: 'aprobada_con_observaciones',
        etiqueta: 'Aprobada con observaciones',
        requiereObservacion: true,
      },
    ])

    const sinObservacion = await pedirError(
      '/api/transacciones/5/registrar-paso',
      cuerpoDePaso('aprobada_con_observaciones', '2026-06-12'),
    )

    expect(sinObservacion.respuesta.status).toBe(400)
    expect(sinObservacion.cuerpo.code).toBe('observacion_requerida')
    expect(sinObservacion.cuerpo.field).toBe('observacion')
  })

  it('informa los pasos que aplican segun la modalidad y el resultado de la aprobacion', async () => {
    const suministro = await pedirTransaccion('/api/transacciones/5')
    const conObservaciones = await pedirTransaccion('/api/transacciones/9')

    expect(suministro.cuerpo.proceso.pasosAplicables.map((item) => item.paso)).toEqual([
      'presupuesto_solicitado',
      'presupuesto_asignado',
      'enviada_a_adquisiciones',
      'analista_asignado',
      'aprobada',
    ])
    expect(conObservaciones.cuerpo.proceso.pasosAplicables.map((item) => item.paso)).toEqual([
      'presupuesto_solicitado',
      'presupuesto_asignado',
      'enviada_a_adquisiciones',
      'analista_asignado',
      'aprobada_con_observaciones',
      'subsanada',
      'publicada',
      'evaluada',
    ])
  })

  it('rechaza un paso inexistente, fuera de orden o con una fecha invalida', async () => {
    const ruta = '/api/transacciones/5/registrar-paso'
    const inexistente = await pedirError(ruta, cuerpoDePaso('inexistente', '2026-06-10'))
    const fueraDeOrden = await pedirError(
      ruta,
      cuerpoDePaso('enviada_a_adquisiciones', '2026-06-10'),
    )
    const futura = await pedirError(ruta, cuerpoDePaso('presupuesto_solicitado', '2999-01-01'))

    await pedirTransaccion(ruta, cuerpoDePaso('presupuesto_solicitado', '2026-06-10'))

    const anterior = await pedirError(ruta, cuerpoDePaso('presupuesto_asignado', '2026-06-09'))

    expect(inexistente.cuerpo.code).toBe('paso_inexistente')
    expect(fueraDeOrden.cuerpo.code).toBe('transicion_ilegal')
    expect(futura.cuerpo.code).toBe('fecha_futura')
    expect(anterior.cuerpo.code).toBe('fecha_anterior_al_paso_previo')
    expect(anterior.cuerpo.field).toBe('fecha')
  })

  it('registra pasos sin confirmar la transaccion e informa el motivo cuando no se puede iniciar', async () => {
    const { cuerpo: borrador } = await crearBorrador({
      nombre: 'Compra de prueba',
      modalidad: 'agil',
      fecha: '2026-09-01',
      solicitudes: [
        {
          unidadId: 1,
          tipoSolicitud: 'SABIENES',
          precompromisos: [{ anio: 2026, monto: 1000 }],
        },
      ],
    })

    const sinConfirmar = await pedirTransaccion(
      `/api/transacciones/${borrador.id}/registrar-paso`,
      cuerpoDePaso('presupuesto_solicitado', '2026-09-02'),
    )
    const sinCotizar = await pedirError(
      '/api/transacciones/6/registrar-paso',
      cuerpoDePaso('presupuesto_solicitado', '2026-06-10'),
    )
    const sinActivas = await pedirError(
      '/api/transacciones/7/registrar-paso',
      cuerpoDePaso('presupuesto_solicitado', '2026-06-10'),
    )
    const detalle = await pedirTransaccion('/api/transacciones/6')

    expect(sinConfirmar.respuesta.status).toBe(200)
    expect(sinConfirmar.cuerpo.proceso.pasoActual).toBe('presupuesto_solicitado')
    expect(sinCotizar.cuerpo.code).toBe('solicitudes_sin_cotizar')
    expect(sinActivas.cuerpo.code).toBe('sin_solicitudes_activas')
    expect(detalle.cuerpo.proceso.motivoBloqueo?.codigo).toBe('solicitudes_sin_cotizar')
    expect(detalle.cuerpo.proceso.siguientesPermitidos).toEqual([])
  })
})

describe('PATCH /transacciones/:id con el proceso iniciado', () => {
  it('rechaza una modalidad que no admite los pasos registrados', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/api/transacciones/1',
      conCuerpo('PATCH', { modalidad: 'directo' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo.code).toBe('modalidad_incompatible_con_proceso')
    expect(cuerpo.field).toBe('modalidad')
    expect(cuerpo.error).toContain('(Publicada, Evaluada)')
  })

  it('permite cambiar a una modalidad que admite los pasos registrados', async () => {
    const conPublicacion = await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { modalidad: 'privada' }),
    )
    const haciaPublicacion = await pedirTransaccion(
      '/api/transacciones/3',
      conCuerpo('PATCH', { modalidad: 'publica' }),
    )

    expect(conPublicacion.respuesta.status).toBe(200)
    expect(conPublicacion.cuerpo.modalidad).toBe('privada')
    expect(haciaPublicacion.respuesta.status).toBe(200)
    expect(
      haciaPublicacion.cuerpo.proceso.siguientesPermitidos.map((siguiente) => siguiente.paso),
    ).toEqual(['publicada'])
  })
})

function cuerpoDeDeshacer(paso: string, observacion = 'Se registró por error.') {
  return conCuerpo('POST', { paso, observacion })
}

describe('POST /transacciones/:id/deshacer-paso', () => {
  it('elimina el ultimo paso, deriva el estado y vuelve a ofrecer ese paso', async () => {
    const { respuesta, cuerpo } = await pedirTransaccion(
      '/api/transacciones/3/deshacer-paso',
      cuerpoDeDeshacer('aprobada'),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo.estado).toBe('analista_asignado')
    expect(cuerpo.proceso.registrados.map((registrado) => registrado.paso)).toEqual([
      'presupuesto_solicitado',
      'presupuesto_asignado',
      'enviada_a_adquisiciones',
      'analista_asignado',
    ])
    expect(cuerpo.proceso.siguientesPermitidos.map((siguiente) => siguiente.paso)).toEqual([
      'aprobada',
      'aprobada_con_observaciones',
    ])
  })

  it('exige la observacion, que el paso sea el ultimo y que existan pasos', async () => {
    const sinObservacion = await pedirError(
      '/api/transacciones/3/deshacer-paso',
      conCuerpo('POST', { paso: 'aprobada' }),
    )
    const noEsElUltimo = await pedirError(
      '/api/transacciones/3/deshacer-paso',
      cuerpoDeDeshacer('analista_asignado'),
    )
    const sinPasos = await pedirError(
      '/api/transacciones/5/deshacer-paso',
      cuerpoDeDeshacer('presupuesto_solicitado'),
    )

    expect(sinObservacion.respuesta.status).toBe(400)
    expect(sinObservacion.cuerpo.code).toBe('cuerpo_invalido')
    expect(sinObservacion.cuerpo.field).toBe('observacion')
    expect(noEsElUltimo.respuesta.status).toBe(409)
    expect(noEsElUltimo.cuerpo.code).toBe('paso_no_es_el_ultimo')
    expect(noEsElUltimo.cuerpo.field).toBe('paso')
    expect(sinPasos.respuesta.status).toBe(409)
    expect(sinPasos.cuerpo.code).toBe('proceso_no_iniciado')
  })

  it('deshace los pasos de presupuesto hasta dejar el proceso sin iniciar', async () => {
    const ruta = '/api/transacciones/5'
    const inicial = await pedirTransaccion(ruta)

    await pedirTransaccion(
      `${ruta}/registrar-paso`,
      cuerpoDePaso('presupuesto_solicitado', '2026-06-09'),
    )
    await pedirTransaccion(
      `${ruta}/registrar-paso`,
      cuerpoDePaso('presupuesto_asignado', '2026-06-10'),
    )

    const sinAsignado = await pedirTransaccion(
      `${ruta}/deshacer-paso`,
      cuerpoDeDeshacer('presupuesto_asignado'),
    )
    const sinIniciar = await pedirTransaccion(
      `${ruta}/deshacer-paso`,
      cuerpoDeDeshacer('presupuesto_solicitado'),
    )

    expect(sinAsignado.cuerpo.estado).toBe('presupuesto_solicitado')
    expect(sinAsignado.cuerpo.proceso.pasoActual).toBe('presupuesto_solicitado')
    expect(sinIniciar.cuerpo.estado).toBe(inicial.cuerpo.estado)
    expect(sinIniciar.cuerpo.proceso.pasoActual).toBeNull()
    expect(sinIniciar.cuerpo.proceso.siguientesPermitidos.map((item) => item.paso)).toEqual([
      'presupuesto_solicitado',
    ])
  })

  it('permite pasar a una modalidad sin publicacion al deshacer Evaluada y Publicada', async () => {
    const rechazada = await pedirError(
      '/api/transacciones/1',
      conCuerpo('PATCH', { modalidad: 'directo' }),
    )

    await pedirTransaccion('/api/transacciones/1/deshacer-paso', cuerpoDeDeshacer('evaluada'))
    await pedirTransaccion('/api/transacciones/1/deshacer-paso', cuerpoDeDeshacer('publicada'))

    const aceptada = await pedirTransaccion(
      '/api/transacciones/1',
      conCuerpo('PATCH', { modalidad: 'directo' }),
    )

    expect(rechazada.cuerpo.code).toBe('modalidad_incompatible_con_proceso')
    expect(aceptada.respuesta.status).toBe(200)
    expect(aceptada.cuerpo.modalidad).toBe('directo')
    expect(aceptada.cuerpo.proceso.pasoActual).toBe('aprobada')
    expect(aceptada.cuerpo.proceso.siguientesPermitidos).toEqual([])
  })
})
