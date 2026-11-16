import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { anotar, observacionObligatoriaSchema, observacionSchema } from '@/mocks/handlers/bitacora'
import { autorizarTransacciones, puedeVerTransaccion } from '@/mocks/handlers/autorizacion'
import { derivarTransaccion } from '@/mocks/handlers/transacciones.derivacion'
import { validarMontos } from '@/mocks/handlers/ordenesDeCompra.validacion'
import {
  localizarOrdenDeCompra,
  obtenerTransacciones,
  siguienteIdMontoOrdenDeCompra,
  siguienteIdOrdenDeCompra,
} from '@/mocks/handlers/transacciones.estado'
import {
  montosOrdenDeCompraSchema,
  ordenDeCompraCreacionSchema,
  ordenDeCompraEdicionSchema,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'
import type { EstadoOrdenDeCompra } from '@/features/transacciones/types/transaccion.types'
import { toCivilDate } from '@/utils/date'

interface Transicion {
  desde: EstadoOrdenDeCompra[]
  hacia: EstadoOrdenDeCompra
}

function esFechaFutura(fecha: string): boolean {
  return fecha > toCivilDate(new Date())
}

function responderFechaFutura(): Response {
  return responderError(
    'La fecha de emisión no puede ser posterior a hoy',
    400,
    'fecha_futura',
    'fechaEmision',
  )
}

function tieneFacturas(transaccion: TransaccionAlmacenada, ordenId: number): boolean {
  const orden = transaccion.ordenesDeCompra.find((item) => item.id === ordenId)

  if (!orden) {
    return false
  }

  const identificadores = orden.montos.map((monto) => monto.id)

  return transaccion.facturas.some((factura) =>
    factura.montos.some((monto) => identificadores.includes(monto.montoOrdenCompraId)),
  )
}

function crearHandlerTransicion(verbo: string, transicion: Transicion) {
  return http.post(
    `${API_BASE_URL}/api/ordenes-de-compra/:id/${verbo}`,
    async ({ params, request }) => {
      const autorizacion = autorizarTransacciones()
      if (autorizacion.rechazo !== null) return autorizacion.rechazo

      const ubicacion = localizarOrdenDeCompra(Number(params.id))

      if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
        return responderError('Orden de compra no encontrada', 404, 'orden_inexistente')
      }

      const { transaccion, orden } = ubicacion

      if (transaccion.confirmadaEn === null) {
        return responderError('La transacción no está confirmada', 409, 'transaccion_no_confirmada')
      }

      if (!transicion.desde.includes(orden.estado)) {
        return responderError('Transición no permitida', 409, 'transicion_ilegal', 'estado')
      }

      const esquema =
        transicion.hacia === 'cancelada' ? observacionObligatoriaSchema : observacionSchema
      const resultado = esquema.safeParse((await leerCuerpo(request)) ?? {})

      if (!resultado.success) {
        return responderCuerpoInvalido(resultado.error)
      }

      orden.estado = transicion.hacia

      anotar(
        transaccion.id,
        `Orden ${orden.codigo}: ${transicion.hacia}`,
        resultado.data.observacion,
      )

      return HttpResponse.json(derivarTransaccion(transaccion))
    },
  )
}

export const ordenesDeCompraHandlers = [
  http.post(
    `${API_BASE_URL}/api/transacciones/:id/ordenes-de-compra`,
    async ({ params, request }) => {
      const autorizacion = autorizarTransacciones()
      if (autorizacion.rechazo !== null) return autorizacion.rechazo

      const transaccion = obtenerTransacciones().find((item) => item.id === Number(params.id))

      if (!transaccion || !puedeVerTransaccion(autorizacion.usuario, transaccion.id)) {
        return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
      }

      const resultado = ordenDeCompraCreacionSchema.safeParse(await leerCuerpo(request))

      if (!resultado.success) {
        return responderCuerpoInvalido(resultado.error)
      }

      const datos = resultado.data

      if (esFechaFutura(datos.fechaEmision)) {
        return responderFechaFutura()
      }

      if (transaccion.ordenesDeCompra.some((orden) => orden.codigo === datos.codigo)) {
        return responderError(
          'El código ya existe en la transacción',
          409,
          'codigo_duplicado',
          'codigo',
        )
      }

      const invalido = validarMontos(transaccion, datos.montos)

      if (invalido) {
        return invalido
      }

      transaccion.ordenesDeCompra.push({
        id: siguienteIdOrdenDeCompra(),
        codigo: datos.codigo,
        fechaEmision: datos.fechaEmision,
        estado: 'enviada_a_proveedor',
        montos: datos.montos.map((monto) => ({
          id: siguienteIdMontoOrdenDeCompra(),
          solicitudId: monto.solicitudId,
          anio: monto.anio,
          monto: monto.monto,
        })),
      })

      anotar(transaccion.id, `Orden ${datos.codigo} creada`, datos.observacion)

      return HttpResponse.json(derivarTransaccion(transaccion), { status: 201 })
    },
  ),

  http.patch(`${API_BASE_URL}/api/ordenes-de-compra/:id`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarOrdenDeCompra(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Orden de compra no encontrada', 404, 'orden_inexistente')
    }

    const { transaccion, orden } = ubicacion

    if (orden.estado === 'cancelada') {
      return responderError('La orden está cancelada', 409, 'orden_cancelada')
    }

    const resultado = ordenDeCompraEdicionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (datos.fechaEmision !== undefined && esFechaFutura(datos.fechaEmision)) {
      return responderFechaFutura()
    }

    const duplicado = transaccion.ordenesDeCompra.some(
      (item) => item.id !== orden.id && item.codigo === datos.codigo,
    )

    if (duplicado) {
      return responderError(
        'El código ya existe en la transacción',
        409,
        'codigo_duplicado',
        'codigo',
      )
    }

    const codigoAnterior = orden.codigo
    const cambiaCodigo = datos.codigo !== codigoAnterior
    const cambiaFecha =
      datos.fechaEmision !== undefined && datos.fechaEmision !== orden.fechaEmision

    orden.codigo = datos.codigo

    if (datos.fechaEmision !== undefined) {
      orden.fechaEmision = datos.fechaEmision
    }

    if (cambiaCodigo && cambiaFecha) {
      anotar(
        transaccion.id,
        `Orden ${codigoAnterior} renombrada a ${datos.codigo} y su fecha de emisión modificada`,
        datos.observacion,
      )
    } else if (cambiaCodigo) {
      anotar(
        transaccion.id,
        `Orden ${codigoAnterior} renombrada a ${datos.codigo}`,
        datos.observacion,
      )
    } else if (cambiaFecha) {
      anotar(
        transaccion.id,
        `Fecha de emisión de la orden ${datos.codigo} modificada`,
        datos.observacion,
      )
    }

    return HttpResponse.json(derivarTransaccion(transaccion))
  }),

  http.put(`${API_BASE_URL}/api/ordenes-de-compra/:id/montos`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarOrdenDeCompra(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Orden de compra no encontrada', 404, 'orden_inexistente')
    }

    const { transaccion, orden } = ubicacion

    if (orden.estado === 'cancelada') {
      return responderError('La orden está cancelada', 409, 'orden_cancelada')
    }

    if (tieneFacturas(transaccion, orden.id)) {
      return responderError('La orden tiene montos facturados', 409, 'orden_con_facturas')
    }

    const resultado = montosOrdenDeCompraSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data
    const invalido = validarMontos(transaccion, datos.montos)

    if (invalido) {
      return invalido
    }

    orden.montos = datos.montos.map((monto) => ({
      id: siguienteIdMontoOrdenDeCompra(),
      solicitudId: monto.solicitudId,
      anio: monto.anio,
      monto: monto.monto,
    }))

    anotar(transaccion.id, `Montos de la orden ${orden.codigo} reemplazados`, datos.observacion)

    return HttpResponse.json(derivarTransaccion(transaccion))
  }),

  http.delete(`${API_BASE_URL}/api/ordenes-de-compra/:id`, ({ params }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarOrdenDeCompra(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Orden de compra no encontrada', 404, 'orden_inexistente')
    }

    const { transaccion, orden } = ubicacion

    if (transaccion.confirmadaEn !== null) {
      return responderError('La transacción ya fue confirmada', 409, 'transaccion_confirmada')
    }

    if (tieneFacturas(transaccion, orden.id)) {
      return responderError('La orden tiene montos facturados', 409, 'orden_con_facturas')
    }

    transaccion.ordenesDeCompra = transaccion.ordenesDeCompra.filter((item) => item.id !== orden.id)

    anotar(transaccion.id, `Orden ${orden.codigo} eliminada`)

    return new HttpResponse(null, { status: 204 })
  }),

  crearHandlerTransicion('aceptar', { desde: ['enviada_a_proveedor'], hacia: 'aceptada' }),
  crearHandlerTransicion('recepcionar', { desde: ['aceptada'], hacia: 'recepcion_conforme' }),
  crearHandlerTransicion('cancelar', {
    desde: ['enviada_a_proveedor', 'aceptada'],
    hacia: 'cancelada',
  }),
]
