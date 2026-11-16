import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { anotar, observacionObligatoriaSchema, observacionSchema } from '@/mocks/handlers/bitacora'
import { autorizarTransacciones, puedeVerTransaccion } from '@/mocks/handlers/autorizacion'
import { derivarTransaccion } from '@/mocks/handlers/transacciones.derivacion'
import { validarMontosFactura } from '@/mocks/handlers/facturas.validacion'
import {
  localizarFactura,
  obtenerTransacciones,
  siguienteIdFactura,
  siguienteIdMontoFactura,
} from '@/mocks/handlers/transacciones.estado'
import {
  facturaCreacionSchema,
  facturaEdicionSchema,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { EstadoFactura } from '@/features/transacciones/types/transaccion.types'

interface Transicion {
  desde: EstadoFactura[]
  hacia: EstadoFactura
}

function crearHandlerTransicion(verbo: string, transicion: Transicion) {
  return http.post(`${API_BASE_URL}/api/facturas/:id/${verbo}`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarFactura(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Factura no encontrada', 404, 'factura_inexistente')
    }

    const { transaccion, factura } = ubicacion

    if (!transicion.desde.includes(factura.estado)) {
      return responderError('Transición no permitida', 409, 'transicion_ilegal', 'estado')
    }

    const esquema =
      transicion.hacia === 'rechazada' ? observacionObligatoriaSchema : observacionSchema
    const resultado = esquema.safeParse((await leerCuerpo(request)) ?? {})

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    factura.estado = transicion.hacia

    anotar(
      transaccion.id,
      `Factura ${factura.folio}: ${transicion.hacia}`,
      resultado.data.observacion,
    )

    return HttpResponse.json(derivarTransaccion(transaccion))
  })
}

export const facturasHandlers = [
  http.post(`${API_BASE_URL}/api/transacciones/:id/facturas`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const transaccion = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!transaccion || !puedeVerTransaccion(autorizacion.usuario, transaccion.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const resultado = facturaCreacionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (transaccion.facturas.some((factura) => factura.folio === datos.folio)) {
      return responderError('El folio ya existe en la transacción', 409, 'folio_duplicado', 'folio')
    }

    const invalido = validarMontosFactura(transaccion, datos.montos)

    if (invalido) {
      return invalido
    }

    transaccion.facturas.push({
      id: siguienteIdFactura(),
      folio: datos.folio,
      estado: 'pendiente',
      fechaEmision: datos.fechaEmision,
      montos: datos.montos.map((monto) => ({
        id: siguienteIdMontoFactura(),
        montoOrdenCompraId: monto.montoOrdenCompraId,
        monto: monto.monto,
      })),
    })

    anotar(transaccion.id, `Factura ${datos.folio} registrada`, datos.observacion)

    return HttpResponse.json(derivarTransaccion(transaccion), { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/api/facturas/:id`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarFactura(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Factura no encontrada', 404, 'factura_inexistente')
    }

    const { transaccion, factura } = ubicacion

    if (transaccion.confirmadaEn !== null) {
      return responderError('La transacción ya fue confirmada', 409, 'transaccion_confirmada')
    }

    const resultado = facturaEdicionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    const duplicado = transaccion.facturas.some(
      (item) => item.id !== factura.id && item.folio === datos.folio,
    )

    if (duplicado) {
      return responderError('El folio ya existe en la transacción', 409, 'folio_duplicado', 'folio')
    }

    factura.folio = datos.folio
    factura.fechaEmision = datos.fechaEmision

    anotar(transaccion.id, `Factura ${factura.folio} modificada`, datos.observacion)

    return HttpResponse.json(derivarTransaccion(transaccion))
  }),

  http.delete(`${API_BASE_URL}/api/facturas/:id`, ({ params }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const ubicacion = localizarFactura(Number(params.id))

    if (!ubicacion || !puedeVerTransaccion(autorizacion.usuario, ubicacion.transaccion.id)) {
      return responderError('Factura no encontrada', 404, 'factura_inexistente')
    }

    const { transaccion, factura } = ubicacion

    if (transaccion.confirmadaEn !== null) {
      return responderError('La transacción ya fue confirmada', 409, 'transaccion_confirmada')
    }

    transaccion.facturas = transaccion.facturas.filter((item) => item.id !== factura.id)

    anotar(transaccion.id, `Factura ${factura.folio} eliminada`)

    return new HttpResponse(null, { status: 204 })
  }),

  crearHandlerTransicion('aceptar', { desde: ['pendiente'], hacia: 'aceptada' }),
  crearHandlerTransicion('rechazar', { desde: ['pendiente'], hacia: 'rechazada' }),
]
