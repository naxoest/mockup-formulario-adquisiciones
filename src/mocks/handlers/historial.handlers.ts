import { delay, http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { obtenerEventos, obtenerTransacciones } from '@/mocks/handlers/transacciones.estado'
import { derivarTransaccion } from '@/mocks/handlers/transacciones.derivacion'
import { analistasDe, principalDe } from '@/mocks/handlers/analistas.derivacion'
import { autorizarTransacciones, puedeVerTransaccion } from '@/mocks/handlers/autorizacion'
import { estadoTransaccionOptions, modalidadOptions } from '@/mocks/data/listas.mock'
import { formatCLP } from '@/utils/currency'
import type {
  HistorialTransaccion,
  PendienteSituacion,
} from '@/features/transacciones/types/historial.types'
import type {
  EstadoTransaccion,
  Transaccion,
} from '@/features/transacciones/types/transaccion.types'

const explicacionPorEstado: Record<EstadoTransaccion, string> = {
  en_cotizacion: 'Hay solicitudes vigentes que aún no tienen monto cotizado.',
  cotizada: 'Todas las solicitudes vigentes tienen monto cotizado y pueden pasar a adquisiciones.',
  presupuesto_solicitado: 'Se solicitó el presupuesto de la transacción y se espera su asignación.',
  presupuesto_asignado:
    'El presupuesto de la transacción está asignado y se espera su envío a adquisiciones.',
  enviada_a_adquisiciones:
    'La transacción está en adquisiciones a la espera de que se asigne un analista.',
  analista_asignado: 'Hay un analista de adquisiciones a cargo y el proceso espera su aprobación.',
  aprobada: 'El proceso de compra está aprobado.',
  aprobada_con_observaciones:
    'El proceso de compra fue aprobado con observaciones que deben subsanarse.',
  subsanada: 'Las observaciones de la aprobación fueron subsanadas.',
  publicada: 'El proceso de compra está publicado y espera la evaluación de las ofertas.',
  evaluada: 'Las ofertas del proceso de compra fueron evaluadas.',
  facturada: 'Todo lo comprometido fue facturado y las facturas están aceptadas.',
  cerrada: 'La transacción concluyó su tramitación.',
  rechazada: 'Todas las solicitudes de la transacción fueron rechazadas.',
}

function etiqueta(valor: string | null, opciones: { value: string; label: string }[]): string {
  if (valor === null) {
    return 'Sin definir'
  }
  return opciones.find((opcion) => opcion.value === valor)?.label ?? valor
}

function pendientesDe(transaccion: Transaccion): PendienteSituacion[] {
  const pendientes: PendienteSituacion[] = []

  if (principalDe(transaccion.id) === null) {
    pendientes.push({
      id: 'pend-analista',
      descripcion: 'Que se asigne un analista principal.',
    })
  }
  const activas = transaccion.solicitudes.filter((solicitud) => solicitud.estado !== 'rechazada')

  const sinCotizar = activas.filter((solicitud) => solicitud.montoCotizacion === null)
  if (sinCotizar.length > 0) {
    pendientes.push({
      id: 'pend-cotizacion',
      descripcion: `Que se registre el monto cotizado de ${sinCotizar.length} solicitud${sinCotizar.length === 1 ? '' : 'es'}.`,
    })
  }

  const vigentes = transaccion.ordenesDeCompra.filter((orden) => orden.estado !== 'cancelada')
  const montosOrden = vigentes.flatMap((orden) => orden.montos)

  const sinOrden = activas.filter(
    (solicitud) => !montosOrden.some((monto) => monto.solicitudId === solicitud.id),
  )
  if (sinOrden.length > 0) {
    pendientes.push({
      id: 'pend-orden',
      descripcion: `Que se emita orden de compra por ${sinOrden.length} solicitud${sinOrden.length === 1 ? '' : 'es'}.`,
    })
  }

  for (const orden of vigentes) {
    if (orden.estado === 'enviada_a_proveedor') {
      pendientes.push({
        id: `pend-acepta-${orden.id}`,
        descripcion: `Que el proveedor acepte la orden ${orden.codigo}.`,
      })
    }
  }

  const facturados = transaccion.facturas
    .filter((factura) => factura.estado !== 'rechazada')
    .flatMap((factura) => factura.montos)

  for (const orden of vigentes) {
    const cubierta = orden.montos.every((monto) =>
      facturados.some((facturado) => facturado.montoOrdenCompraId === monto.id),
    )
    if (!cubierta && orden.estado !== 'enviada_a_proveedor') {
      pendientes.push({
        id: `pend-factura-${orden.id}`,
        descripcion: `Que el proveedor facture la orden ${orden.codigo}.`,
      })
    }
  }

  for (const factura of transaccion.facturas) {
    if (factura.estado === 'pendiente') {
      pendientes.push({
        id: `pend-acepta-fac-${factura.id}`,
        descripcion: `Que se acepte la factura ${factura.folio}.`,
      })
    }
  }

  return pendientes
}

function construirHistorial(transaccion: Transaccion): HistorialTransaccion {
  const rechazadas = transaccion.solicitudes.filter((solicitud) => solicitud.estado === 'rechazada')
  const montoRechazado = rechazadas.reduce(
    (total, solicitud) => total + (solicitud.montoCotizacion ?? 0),
    0,
  )
  const activas = transaccion.solicitudes.length - rechazadas.length
  const porFacturar = transaccion.montoComprometido - transaccion.montoFacturado
  const diferencia = transaccion.montoCotizado - transaccion.montoComprometido

  const etapas = [
    etiqueta('en_cotizacion', estadoTransaccionOptions),
    etiqueta('cotizada', estadoTransaccionOptions),
    ...transaccion.proceso.pasosAplicables.map((aplicable) => aplicable.etiqueta),
    etiqueta('facturada', estadoTransaccionOptions),
    etiqueta('cerrada', estadoTransaccionOptions),
  ]

  return {
    cabecera: {
      codigo: `#${transaccion.id}`,
      nombre: transaccion.nombre,
      linkCarpetaAntecedentes: transaccion.linkCarpetaAntecedentes,
      modalidad: etiqueta(transaccion.modalidad, modalidadOptions),

      totalSolicitudes: transaccion.solicitudes.length,
      totalOrdenes: transaccion.ordenesDeCompra.length,
      totalFacturas: transaccion.facturas.length,
      fechaApertura: transaccion.creadaEn,
      analistas: analistasDe(transaccion.id),
    },
    situacion: {
      estado: etiqueta(transaccion.estado, estadoTransaccionOptions),
      explicacion:
        transaccion.estado === null
          ? 'La transacción todavía no ha sido confirmada.'
          : explicacionPorEstado[transaccion.estado],
      pendientes: pendientesDe(transaccion),
    },
    montos: {
      cotizadoVigente: {
        valor: transaccion.montoCotizado,
        nota:
          rechazadas.length > 0
            ? `Suma de las ${activas} solicitudes que siguen su curso. No incluye ${formatCLP(montoRechazado)} de las rechazadas.`
            : `Suma de las ${activas} solicitudes que siguen su curso.`,
      },
      comprometido: {
        valor: transaccion.montoComprometido,
        nota:
          diferencia === 0
            ? 'Coincide con lo cotizado.'
            : diferencia > 0
              ? `${formatCLP(diferencia)} menos que lo cotizado.`
              : `${formatCLP(Math.abs(diferencia))} más que lo cotizado.`,
      },
      facturado: {
        valor: transaccion.montoFacturado,
        nota:
          porFacturar > 0
            ? `Falta facturar ${formatCLP(porFacturar)}.`
            : porFacturar < 0
              ? `${formatCLP(Math.abs(porFacturar))} más que lo comprometido.`
              : 'No queda monto por facturar.',
      },
    },
    avance: {
      etapas,
      actual: etiqueta(transaccion.estado, estadoTransaccionOptions),
    },
    eventos: obtenerEventos(transaccion.id) ?? [],
  }
}

export const historialHandlers = [
  http.get(`${API_BASE_URL}/api/transacciones/:id/historial`, async ({ params }) => {
    await delay()

    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const id = Number(params.id)
    const almacenada = obtenerTransacciones().find((item) => item.id === id)

    if (
      !almacenada ||
      obtenerEventos(id) === undefined ||
      !puedeVerTransaccion(autorizacion.usuario, id)
    ) {
      return HttpResponse.json(
        { error: 'La transacción no tiene historial registrado' },
        { status: 404 },
      )
    }

    return HttpResponse.json(construirHistorial(derivarTransaccion(almacenada)))
  }),
]
