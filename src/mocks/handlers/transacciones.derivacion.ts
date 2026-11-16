import type {
  EstadoTransaccion,
  Factura,
  OrdenDeCompra,
  PasoProceso,
  Precompromiso,
  Solicitud,
  Transaccion,
  UnidadSolicitante,
} from '@/features/transacciones/types/transaccion.types'
import type {
  PrecompromisoAlmacenado,
  TransaccionAlmacenada,
} from '@/mocks/data/transacciones.mock'
import { opcionesDeSedes } from '@/mocks/data/unidadesSolicitantes.mock'
import { pasoActualDe, procesoDe } from '@/mocks/handlers/transacciones.proceso'
import { buscarUnidadSolicitante } from '@/mocks/handlers/unidadesSolicitantes.estado'

const UNIDAD_DESCONOCIDA: UnidadSolicitante = {
  id: 0,
  cr: 0,
  nombre: 'Unidad desconocida',
  sedes: [{ value: 'desconocido', label: 'Campus desconocido' }],
  tipo: 'desconocido',
}

export function resolverUnidad(unidadId: number): UnidadSolicitante {
  const unidad = buscarUnidadSolicitante(unidadId)

  if (!unidad) {
    return UNIDAD_DESCONOCIDA
  }

  return {
    id: unidad.id,
    cr: unidad.cr,
    nombre: unidad.nombre,
    sedes: opcionesDeSedes(unidad.sedes),
    tipo: unidad.tipo,
  }
}

function sumar(valores: number[]): number {
  return valores.reduce((total, valor) => total + valor, 0)
}

export function montoCotizacionDe(precompromisos: PrecompromisoAlmacenado[]): number | null {
  if (precompromisos.length === 0) {
    return null
  }

  return sumar(precompromisos.map((precompromiso) => precompromiso.monto))
}

function precompromisosOrdenados(precompromisos: PrecompromisoAlmacenado[]): Precompromiso[] {
  return precompromisos
    .map((precompromiso) => ({ anio: precompromiso.anio, monto: precompromiso.monto }))
    .sort((a, b) => a.anio - b.anio)
}

interface PartesDerivadas {
  solicitudes: Solicitud[]
  ordenesDeCompra: OrdenDeCompra[]
  facturas: Factura[]
}

function derivarEstado(
  partes: PartesDerivadas,
  pasoActual: PasoProceso | null,
): EstadoTransaccion | null {
  const { solicitudes, ordenesDeCompra, facturas } = partes

  if (solicitudes.length === 0) {
    return null
  }

  if (solicitudes.every((solicitud) => solicitud.estado === 'rechazada')) {
    return 'rechazada'
  }

  const activas = solicitudes.filter((solicitud) => solicitud.estado !== 'rechazada')
  const ordenesVigentes = ordenesDeCompra.filter((orden) => orden.estado !== 'cancelada')

  const montosOrden = ordenesVigentes.flatMap((orden) => orden.montos)
  const montosFacturados = facturas
    .filter((factura) => factura.estado !== 'rechazada')
    .flatMap((factura) => factura.montos)

  const todoFacturado =
    montosOrden.length > 0 &&
    montosOrden.every((montoOrden) =>
      montosFacturados.some((montoFactura) => montoFactura.montoOrdenCompraId === montoOrden.id),
    )

  const todasFacturasAceptadas =
    facturas.length > 0 && facturas.every((factura) => factura.estado === 'aceptada')

  if (todoFacturado && todasFacturasAceptadas) {
    return 'facturada'
  }

  if (pasoActual !== null) {
    return pasoActual
  }

  const conCotizacion = activas.filter((solicitud) => solicitud.montoCotizacion !== null)

  if (activas.length > 0 && conCotizacion.length === activas.length) {
    return 'cotizada'
  }

  return 'en_cotizacion'
}

function derivarPartes(almacenada: TransaccionAlmacenada): PartesDerivadas {
  const solicitudes: Solicitud[] = almacenada.solicitudes.map((solicitud) => ({
    id: solicitud.id,
    estado: solicitud.estado,
    estadoEvaluacion: solicitud.estadoEvaluacion,
    tipoSolicitud: solicitud.tipoSolicitud,
    codigoSaserviSabienes: solicitud.codigoSaserviSabienes,
    financiamiento: solicitud.financiamiento,
    montoCotizacion: montoCotizacionDe(solicitud.precompromisos),
    precompromisos: precompromisosOrdenados(solicitud.precompromisos),
    unidad: resolverUnidad(solicitud.unidadId),
  }))

  const ordenesDeCompra: OrdenDeCompra[] = almacenada.ordenesDeCompra.map((orden) => ({
    id: orden.id,
    codigo: orden.codigo,
    fechaEmision: orden.fechaEmision,
    estado: orden.estado,
    monto: sumar(orden.montos.map((monto) => monto.monto)),
    montos: orden.montos.map((monto) => ({
      id: monto.id,
      solicitudId: monto.solicitudId,
      anio: monto.anio,
      monto: monto.monto,
    })),
  }))

  const facturas: Factura[] = almacenada.facturas.map((factura) => ({
    id: factura.id,
    folio: factura.folio,
    estado: factura.estado,
    fechaEmision: factura.fechaEmision,
    monto: sumar(factura.montos.map((monto) => monto.monto)),
    montos: factura.montos.map((monto) => ({
      id: monto.id,
      montoOrdenCompraId: monto.montoOrdenCompraId,
      monto: monto.monto,
    })),
  }))

  return { solicitudes, ordenesDeCompra, facturas }
}

export function estadoDe(almacenada: TransaccionAlmacenada): EstadoTransaccion | null {
  if (almacenada.confirmadaEn === null) {
    return null
  }

  return derivarEstado(derivarPartes(almacenada), pasoActualDe(almacenada.pasos))
}

export function derivarTransaccion(almacenada: TransaccionAlmacenada): Transaccion {
  const partes = derivarPartes(almacenada)
  const { solicitudes, ordenesDeCompra, facturas } = partes

  const montoCotizado = sumar(
    solicitudes
      .filter((solicitud) => solicitud.estado !== 'rechazada')
      .map((solicitud) => solicitud.montoCotizacion ?? 0),
  )

  const montoComprometido = sumar(
    ordenesDeCompra.filter((orden) => orden.estado !== 'cancelada').map((orden) => orden.monto),
  )

  const montoFacturado = sumar(
    facturas.filter((factura) => factura.estado !== 'rechazada').map((factura) => factura.monto),
  )

  return {
    id: almacenada.id,
    nombre: almacenada.nombre,
    linkCarpetaAntecedentes: almacenada.linkCarpetaAntecedentes,
    fecha: almacenada.fecha,
    modalidad: almacenada.modalidad,
    estado:
      almacenada.confirmadaEn === null
        ? null
        : derivarEstado(partes, pasoActualDe(almacenada.pasos)),
    montoCotizado,
    montoComprometido,
    montoFacturado,
    creadaEn: almacenada.creadaEn,
    confirmadaEn: almacenada.confirmadaEn,
    solicitudes,
    ordenesDeCompra,
    facturas,
    proceso: procesoDe(almacenada),
  }
}
