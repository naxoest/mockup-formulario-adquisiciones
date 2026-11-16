import type {
  FacturaAlmacenada,
  MontoFacturaAlmacenado,
  MontoOrdenDeCompraAlmacenado,
  OrdenDeCompraAlmacenada,
  PasoRegistradoAlmacenado,
  PrecompromisoAlmacenado,
  SolicitudAlmacenada,
  TransaccionAlmacenada,
} from '@/mocks/data/transacciones.mock'
import { transaccionesMock } from '@/mocks/data/transacciones.mock'
import { eventosHistorialMock } from '@/mocks/data/historialTransaccion.mock'
import { generarHistoriales, incorporarPasos } from '@/mocks/handlers/historial.generacion'
import { monitoreoMock, type RegistroMonitoreoAlmacenado } from '@/mocks/data/monitoreo.mock'
import { asignacionesMock, type AsignacionAlmacenada } from '@/mocks/data/asignaciones.mock'
import type { EventoHistorial } from '@/features/transacciones/types/historial.types'

interface Contadores {
  transaccion: number
  solicitud: number
  ordenDeCompra: number
  montoOrdenDeCompra: number
  factura: number
  montoFactura: number
}

function clonarPrecompromiso(precompromiso: PrecompromisoAlmacenado): PrecompromisoAlmacenado {
  return {
    anio: precompromiso.anio,
    monto: precompromiso.monto,
  }
}

function clonarSolicitud(solicitud: SolicitudAlmacenada): SolicitudAlmacenada {
  return {
    id: solicitud.id,
    unidadId: solicitud.unidadId,
    tipoSolicitud: solicitud.tipoSolicitud,
    codigoSaserviSabienes: solicitud.codigoSaserviSabienes,
    financiamiento: solicitud.financiamiento,
    estado: solicitud.estado,
    estadoEvaluacion: solicitud.estadoEvaluacion,
    precompromisos: solicitud.precompromisos.map(clonarPrecompromiso),
  }
}

function clonarMontoOrdenDeCompra(
  monto: MontoOrdenDeCompraAlmacenado,
): MontoOrdenDeCompraAlmacenado {
  return {
    id: monto.id,
    solicitudId: monto.solicitudId,
    anio: monto.anio,
    monto: monto.monto,
  }
}

function clonarOrdenDeCompra(orden: OrdenDeCompraAlmacenada): OrdenDeCompraAlmacenada {
  return {
    id: orden.id,
    codigo: orden.codigo,
    fechaEmision: orden.fechaEmision,
    estado: orden.estado,
    montos: orden.montos.map(clonarMontoOrdenDeCompra),
  }
}

function clonarMontoFactura(monto: MontoFacturaAlmacenado): MontoFacturaAlmacenado {
  return {
    id: monto.id,
    montoOrdenCompraId: monto.montoOrdenCompraId,
    monto: monto.monto,
  }
}

function clonarFactura(factura: FacturaAlmacenada): FacturaAlmacenada {
  return {
    id: factura.id,
    folio: factura.folio,
    estado: factura.estado,
    fechaEmision: factura.fechaEmision,
    montos: factura.montos.map(clonarMontoFactura),
  }
}

function clonarPaso(paso: PasoRegistradoAlmacenado): PasoRegistradoAlmacenado {
  return {
    paso: paso.paso,
    fecha: paso.fecha,
    observacion: paso.observacion,
    registradoEn: paso.registradoEn,
    registradoPor: paso.registradoPor,
  }
}

function clonarTransaccion(transaccion: TransaccionAlmacenada): TransaccionAlmacenada {
  return {
    id: transaccion.id,
    nombre: transaccion.nombre,
    linkCarpetaAntecedentes: transaccion.linkCarpetaAntecedentes,
    fecha: transaccion.fecha,
    modalidad: transaccion.modalidad,
    creadaEn: transaccion.creadaEn,
    confirmadaEn: transaccion.confirmadaEn,
    pasos: transaccion.pasos.map(clonarPaso),
    solicitudes: transaccion.solicitudes.map(clonarSolicitud),
    ordenesDeCompra: transaccion.ordenesDeCompra.map(clonarOrdenDeCompra),
    facturas: transaccion.facturas.map(clonarFactura),
  }
}

function clonarTransacciones(origen: TransaccionAlmacenada[]): TransaccionAlmacenada[] {
  return origen.map(clonarTransaccion)
}

function maximo(valores: number[]): number {
  return valores.reduce((mayor, valor) => (valor > mayor ? valor : mayor), 0)
}

function calcularContadores(origen: TransaccionAlmacenada[]): Contadores {
  const solicitudes = origen.flatMap((transaccion) => transaccion.solicitudes)
  const ordenes = origen.flatMap((transaccion) => transaccion.ordenesDeCompra)
  const montosOrden = ordenes.flatMap((orden) => orden.montos)
  const facturas = origen.flatMap((transaccion) => transaccion.facturas)
  const montosFactura = facturas.flatMap((factura) => factura.montos)

  return {
    transaccion: maximo(origen.map((transaccion) => transaccion.id)),
    solicitud: maximo(solicitudes.map((solicitud) => solicitud.id)),
    ordenDeCompra: maximo(ordenes.map((orden) => orden.id)),
    montoOrdenDeCompra: maximo(montosOrden.map((monto) => monto.id)),
    factura: maximo(facturas.map((factura) => factura.id)),
    montoFactura: maximo(montosFactura.map((monto) => monto.id)),
  }
}

function clonarEventos(origen: Map<number, EventoHistorial[]>): Map<number, EventoHistorial[]> {
  return new Map(Array.from(origen, ([id, eventos]) => [id, [...eventos]]))
}

function clonarFecha(fecha: Date | null): Date | null {
  return fecha === null ? null : new Date(fecha.getTime())
}

function clonarRegistroMonitoreo(
  registro: RegistroMonitoreoAlmacenado,
): RegistroMonitoreoAlmacenado {
  return {
    transaccionId: registro.transaccionId,
    factores: registro.factores === null ? null : { ...registro.factores },
    ultimoMovimiento: clonarFecha(registro.ultimoMovimiento),
    proximaAccion: registro.proximaAccion,
    fechaProximaRevision: clonarFecha(registro.fechaProximaRevision),
    bloqueadorPrincipal: registro.bloqueadorPrincipal,
    escalarAJefatura: registro.escalarAJefatura,
    cerrado: registro.cerrado,
    observaciones: registro.observaciones,
  }
}

function clonarAsignacion(asignacion: AsignacionAlmacenada): AsignacionAlmacenada {
  return {
    transaccionId: asignacion.transaccionId,
    run: asignacion.run,
    participacion: asignacion.participacion,
  }
}

const eventosSemilla: Map<number, EventoHistorial[]> = new Map([
  ...incorporarPasos(eventosHistorialMock),
  ...generarHistoriales(eventosHistorialMock),
])

let transacciones: TransaccionAlmacenada[] = clonarTransacciones(transaccionesMock)
let contadores: Contadores = calcularContadores(transaccionesMock)
let eventos: Map<number, EventoHistorial[]> = clonarEventos(eventosSemilla)
let monitoreo: RegistroMonitoreoAlmacenado[] = monitoreoMock.map(clonarRegistroMonitoreo)
let asignaciones: AsignacionAlmacenada[] = asignacionesMock.map(clonarAsignacion)
let secuenciaEvento = 0

export function restablecerTransacciones(): void {
  transacciones = clonarTransacciones(transaccionesMock)
  contadores = calcularContadores(transaccionesMock)
  eventos = clonarEventos(eventosSemilla)
  monitoreo = monitoreoMock.map(clonarRegistroMonitoreo)
  asignaciones = asignacionesMock.map(clonarAsignacion)
  secuenciaEvento = 0
}

export function obtenerEventos(transaccionId: number): EventoHistorial[] | undefined {
  return eventos.get(transaccionId)
}

export function registrarEvento(transaccionId: number, evento: EventoHistorial): void {
  const actuales = eventos.get(transaccionId)

  if (actuales) {
    actuales.push(evento)
    return
  }

  eventos.set(transaccionId, [evento])
}

export function siguienteIdEvento(): string {
  secuenciaEvento += 1
  return `bitacora-${secuenciaEvento}`
}

export function obtenerTransacciones(): TransaccionAlmacenada[] {
  return transacciones
}

export function obtenerMonitoreo(): RegistroMonitoreoAlmacenado[] {
  return monitoreo
}

export function obtenerAsignaciones(): AsignacionAlmacenada[] {
  return asignaciones
}

export function reemplazarAsignaciones(
  transaccionId: number,
  nuevas: AsignacionAlmacenada[],
): void {
  asignaciones = [...asignaciones.filter((item) => item.transaccionId !== transaccionId), ...nuevas]
}

export function reemplazarRegistroMonitoreo(registro: RegistroMonitoreoAlmacenado): void {
  monitoreo = monitoreo.map((actual) =>
    actual.transaccionId === registro.transaccionId ? registro : actual,
  )
}

export interface UbicacionSolicitud {
  transaccion: TransaccionAlmacenada
  solicitud: SolicitudAlmacenada
}

export function localizarSolicitud(id: number): UbicacionSolicitud | null {
  for (const transaccion of transacciones) {
    const solicitud = transaccion.solicitudes.find((item) => item.id === id)

    if (solicitud) {
      return { transaccion, solicitud }
    }
  }

  return null
}

export interface UbicacionOrdenDeCompra {
  transaccion: TransaccionAlmacenada
  orden: OrdenDeCompraAlmacenada
}

export function localizarOrdenDeCompra(id: number): UbicacionOrdenDeCompra | null {
  for (const transaccion of transacciones) {
    const orden = transaccion.ordenesDeCompra.find((item) => item.id === id)

    if (orden) {
      return { transaccion, orden }
    }
  }

  return null
}

export interface UbicacionFactura {
  transaccion: TransaccionAlmacenada
  factura: FacturaAlmacenada
}

export function localizarFactura(id: number): UbicacionFactura | null {
  for (const transaccion of transacciones) {
    const factura = transaccion.facturas.find((item) => item.id === id)

    if (factura) {
      return { transaccion, factura }
    }
  }

  return null
}

export function siguienteIdTransaccion(): number {
  contadores.transaccion += 1
  return contadores.transaccion
}

export function siguienteIdSolicitud(): number {
  contadores.solicitud += 1
  return contadores.solicitud
}

export function siguienteIdOrdenDeCompra(): number {
  contadores.ordenDeCompra += 1
  return contadores.ordenDeCompra
}

export function siguienteIdMontoOrdenDeCompra(): number {
  contadores.montoOrdenDeCompra += 1
  return contadores.montoOrdenDeCompra
}

export function siguienteIdFactura(): number {
  contadores.factura += 1
  return contadores.factura
}

export function siguienteIdMontoFactura(): number {
  contadores.montoFactura += 1
  return contadores.montoFactura
}
