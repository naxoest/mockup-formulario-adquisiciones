import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { financiamientoOptions, tipoSolicitudOptions } from '@/mocks/data/listas.mock'
import { buscarUnidadSolicitante } from '@/mocks/handlers/unidadesSolicitantes.estado'
import { existeEnCatalogo } from '@/mocks/handlers/catalogos'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { anotar, observacionObligatoriaSchema, observacionSchema } from '@/mocks/handlers/bitacora'
import { autorizarTransacciones, puedeVerTransaccion } from '@/mocks/handlers/autorizacion'
import { derivarTransaccion } from '@/mocks/handlers/transacciones.derivacion'
import { validarPrecompromisos } from '@/mocks/handlers/precompromisos.validacion'
import {
  localizarSolicitud,
  obtenerTransacciones,
  siguienteIdSolicitud,
} from '@/mocks/handlers/transacciones.estado'
import {
  solicitudCreacionDirectaSchema,
  solicitudEdicionSchema,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'
import type { EstadoSolicitud } from '@/features/transacciones/types/transaccion.types'

interface Transicion {
  desde: EstadoSolicitud[]
  hacia: EstadoSolicitud
}

function participaEnOrden(transaccion: TransaccionAlmacenada, solicitudId: number): boolean {
  return transaccion.ordenesDeCompra.some((orden) =>
    orden.montos.some((monto) => monto.solicitudId === solicitudId),
  )
}

function financiamientoInexistente(financiamiento: string | null | undefined): boolean {
  return (
    financiamiento !== null &&
    financiamiento !== undefined &&
    !existeEnCatalogo(financiamiento, financiamientoOptions)
  )
}

function crearHandlerTransicion(verbo: string, transicion: Transicion) {
  return http.post(`${API_BASE_URL}/api/solicitudes/:id/${verbo}`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarSolicitud(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Solicitud no encontrada', 404, 'solicitud_inexistente')
    }

    const { transaccion, solicitud } = ubicacion

    if (transaccion.confirmadaEn === null) {
      return responderError('La transacción no está confirmada', 409, 'transaccion_no_confirmada')
    }

    if (solicitud.estado === null || !transicion.desde.includes(solicitud.estado)) {
      return responderError('Transición no permitida', 409, 'transicion_ilegal', 'estado')
    }

    if (transicion.hacia === 'rechazada' && participaEnOrden(transaccion, solicitud.id)) {
      return responderError(
        'La solicitud participa en una orden de compra',
        409,
        'solicitud_en_orden',
      )
    }

    const esquema =
      transicion.hacia === 'rechazada' ? observacionObligatoriaSchema : observacionSchema
    const resultado = esquema.safeParse((await leerCuerpo(request)) ?? {})

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    solicitud.estado = transicion.hacia

    anotar(
      transaccion.id,
      `Solicitud ${solicitud.id}: ${transicion.hacia}`,
      resultado.data.observacion,
    )

    return HttpResponse.json(derivarTransaccion(transaccion))
  })
}

export const solicitudesHandlers = [
  http.post(`${API_BASE_URL}/api/transacciones/:id/solicitudes`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const transaccion = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!transaccion || !puedeVerTransaccion(autorizacion.usuario, transaccion.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const resultado = solicitudCreacionDirectaSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (!existeEnCatalogo(datos.tipoSolicitud, tipoSolicitudOptions)) {
      return responderError(
        'El tipo de solicitud no existe',
        400,
        'tipo_solicitud_inexistente',
        'tipoSolicitud',
      )
    }

    const unidad = buscarUnidadSolicitante(datos.unidadId)

    if (unidad === undefined) {
      return responderError(
        'La unidad solicitante no existe',
        400,
        'unidad_inexistente',
        'unidadId',
      )
    }

    if (!unidad.activo) {
      return responderError('La carrera o unidad está inactiva', 409, 'unidad_inactiva', 'unidadId')
    }

    if (financiamientoInexistente(datos.financiamiento)) {
      return responderError(
        'El financiamiento no existe',
        400,
        'financiamiento_inexistente',
        'financiamiento',
      )
    }

    const precompromisos = datos.precompromisos ?? []
    const rechazoPrecompromisos = validarPrecompromisos(precompromisos, '')

    if (rechazoPrecompromisos !== null) {
      return rechazoPrecompromisos
    }

    const idSolicitud = siguienteIdSolicitud()

    transaccion.solicitudes.push({
      id: idSolicitud,
      unidadId: datos.unidadId,
      tipoSolicitud: datos.tipoSolicitud,
      codigoSaserviSabienes: datos.codigoSaserviSabienes ?? null,
      financiamiento: datos.financiamiento ?? null,
      estado: transaccion.confirmadaEn === null ? null : 'enviada',
      estadoEvaluacion: null,
      precompromisos: precompromisos.map((precompromiso) => ({
        anio: precompromiso.anio,
        monto: precompromiso.monto,
      })),
    })

    anotar(transaccion.id, `Solicitud ${idSolicitud} agregada`, datos.observacion)

    return HttpResponse.json(derivarTransaccion(transaccion), { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/api/solicitudes/:id`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarSolicitud(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Solicitud no encontrada', 404, 'solicitud_inexistente')
    }

    const resultado = solicitudEdicionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (financiamientoInexistente(datos.financiamiento)) {
      return responderError(
        'El financiamiento no existe',
        400,
        'financiamiento_inexistente',
        'financiamiento',
      )
    }

    if (datos.precompromisos !== undefined) {
      const rechazoPrecompromisos = validarPrecompromisos(datos.precompromisos, '')

      if (rechazoPrecompromisos !== null) {
        return rechazoPrecompromisos
      }

      ubicacion.solicitud.precompromisos = datos.precompromisos.map((precompromiso) => ({
        anio: precompromiso.anio,
        monto: precompromiso.monto,
      }))
    }

    if (datos.estadoEvaluacion !== undefined) {
      ubicacion.solicitud.estadoEvaluacion = datos.estadoEvaluacion
    }

    if (datos.financiamiento !== undefined) {
      ubicacion.solicitud.financiamiento = datos.financiamiento
    }

    if (datos.codigoSaserviSabienes !== undefined) {
      ubicacion.solicitud.codigoSaserviSabienes = datos.codigoSaserviSabienes
    }

    anotar(
      ubicacion.transaccion.id,
      `Solicitud ${ubicacion.solicitud.id} modificada`,
      datos.observacion,
    )

    return HttpResponse.json(derivarTransaccion(ubicacion.transaccion))
  }),

  http.delete(`${API_BASE_URL}/api/solicitudes/:id`, ({ params }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarSolicitud(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Solicitud no encontrada', 404, 'solicitud_inexistente')
    }

    const { transaccion, solicitud } = ubicacion

    if (participaEnOrden(transaccion, solicitud.id)) {
      return responderError(
        'La solicitud participa en una orden de compra',
        409,
        'solicitud_en_orden',
      )
    }

    if (transaccion.confirmadaEn !== null) {
      const activasRestantes = transaccion.solicitudes.filter(
        (item) => item.id !== solicitud.id && item.estado !== 'rechazada',
      )

      if (activasRestantes.length === 0) {
        return responderError(
          'La transacción quedaría sin solicitudes activas',
          409,
          'sin_solicitudes_activas',
        )
      }
    }

    transaccion.solicitudes = transaccion.solicitudes.filter((item) => item.id !== solicitud.id)

    anotar(transaccion.id, `Solicitud ${solicitud.id} eliminada`)

    return new HttpResponse(null, { status: 204 })
  }),

  crearHandlerTransicion('asignar', { desde: ['enviada'], hacia: 'asignado' }),
  crearHandlerTransicion('iniciar-proceso', { desde: ['asignado'], hacia: 'en_proceso' }),
  crearHandlerTransicion('completar', { desde: ['en_proceso'], hacia: 'completada' }),
  crearHandlerTransicion('rechazar', {
    desde: ['enviada', 'asignado', 'en_proceso'],
    hacia: 'rechazada',
  }),
]
