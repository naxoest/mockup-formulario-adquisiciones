import {
  Building,
  Check,
  Circle,
  CircleDot,
  Clock,
  FileText,
  Package,
  Receipt,
  X,
  type LucideIcon,
} from 'lucide-react'
import type {
  AvanceTransaccion,
  CabeceraHistorial,
  EventoEntidad,
  EventoHistorial,
  TipoEntidadHistorial,
  TonoEvento,
} from '../../types/historial.types'

export interface PresentacionTono {
  Icono: LucideIcon
  trazo: number
  clasesMarcador: string
  clasesEstado: string
}

export const presentacionPorTono: Record<TonoEvento, PresentacionTono> = {
  registrado: {
    Icono: Circle,
    trazo: 2,
    clasesMarcador: 'border border-mercury-300 bg-white text-mercury-500',
    clasesEstado: 'border-mercury-300 bg-mercury-50 text-mercury-800',
  },
  enCurso: {
    Icono: CircleDot,
    trazo: 2,
    clasesMarcador: 'border border-abyss-200 bg-abyss-50 text-abyss-800',
    clasesEstado: 'border-abyss-200 bg-abyss-50 text-abyss-800',
  },
  logrado: {
    Icono: Check,
    trazo: 3,
    clasesMarcador: 'border border-jade-200 bg-jade-50 text-jade-800',
    clasesEstado: 'border-jade-200 bg-jade-50 text-jade-800',
  },
  espera: {
    Icono: Clock,
    trazo: 2,
    clasesMarcador: 'border border-saffron-200 bg-saffron-50 text-saffron-800',
    clasesEstado: 'border-saffron-200 bg-saffron-50 text-saffron-800',
  },
  detenido: {
    Icono: X,
    trazo: 2.5,
    clasesMarcador: 'border border-scarlet-200 bg-scarlet-50 text-scarlet-800',
    clasesEstado: 'border-scarlet-200 bg-scarlet-50 text-scarlet-800',
  },
}

export interface PresentacionEntidad {
  Icono: LucideIcon
  etiqueta: string
  etiquetaRelacionadas: string
  etiquetaGrupo: string
}

export const presentacionEntidad: Record<TipoEntidadHistorial, PresentacionEntidad> = {
  solicitud: {
    Icono: FileText,
    etiqueta: 'Solicitud',
    etiquetaRelacionadas: 'Relacionada con',
    etiquetaGrupo: 'Solicitudes',
  },
  ordenDeCompra: {
    Icono: Package,
    etiqueta: 'Orden de compra',
    etiquetaRelacionadas: 'Agrupa',
    etiquetaGrupo: 'Órdenes',
  },
  factura: {
    Icono: Receipt,
    etiqueta: 'Factura',
    etiquetaRelacionadas: 'Cobra la',
    etiquetaGrupo: 'Facturas',
  },
}

export const IconoUnidad: LucideIcon = Building

const ZONA_HORARIA = 'America/Santiago'

const formateadorFechaHora = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: ZONA_HORARIA,
})

const formateadorFecha = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: ZONA_HORARIA,
})

export function formatearFechaEvento(fecha: string): string {
  return formateadorFechaHora.format(new Date(fecha))
}

export function formatearFecha(fecha: string): string {
  return formateadorFecha.format(new Date(fecha))
}

function pluralizar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

export function descripcionContenido(cabecera: CabeceraHistorial): string {
  return [
    pluralizar(cabecera.totalSolicitudes, 'solicitud', 'solicitudes'),
    pluralizar(cabecera.totalOrdenes, 'orden', 'órdenes'),
    pluralizar(cabecera.totalFacturas, 'factura', 'facturas'),
  ].join(', ')
}

export interface ProporcionBarra {
  ancho: number
  excede: boolean
}

export function proporcionDeMonto(valor: number, base: number): ProporcionBarra {
  if (base <= 0) {
    return { ancho: valor > 0 ? 100 : 0, excede: valor > 0 }
  }
  const bruto = (valor / base) * 100
  return { ancho: Math.min(100, Math.max(0, bruto)), excede: bruto > 100 }
}

export function indiceEtapaActual(avance: AvanceTransaccion): number {
  return avance.etapas.indexOf(avance.actual)
}

export interface EntidadFiltrable {
  tipo: TipoEntidadHistorial
  llave: string
  codigo: string
  descriptor: string | null
}

export function llaveEntidad(referencia: { tipo: TipoEntidadHistorial; id: number }): string {
  return `${referencia.tipo}-${referencia.id}`
}

export interface GrupoFiltro {
  tipo: TipoEntidadHistorial
  etiqueta: string
  entidades: EntidadFiltrable[]
}

const ORDEN_GRUPOS: TipoEntidadHistorial[] = ['solicitud', 'ordenDeCompra', 'factura']

function descriptorDeEvento(evento: EventoEntidad): string | null {
  if (evento.entidad.tipo === 'solicitud') {
    return evento.contexto.unidad ? evento.contexto.unidad.nombre : null
  }
  if (evento.entidad.tipo === 'ordenDeCompra') {
    return evento.contexto.proveedor ?? null
  }
  return null
}

export function gruposDeFiltro(eventos: EventoHistorial[]): GrupoFiltro[] {
  const porLlave = new Map<string, EntidadFiltrable>()

  for (const evento of eventos) {
    if (evento.clase !== 'evento') {
      continue
    }
    const llave = llaveEntidad(evento.entidad)
    if (porLlave.has(llave)) {
      continue
    }
    porLlave.set(llave, {
      tipo: evento.entidad.tipo,
      llave,
      codigo: evento.entidad.codigo,
      descriptor: descriptorDeEvento(evento),
    })
  }

  const entidades = Array.from(porLlave.values())

  return ORDEN_GRUPOS.map((tipo) => ({
    tipo,
    etiqueta: presentacionEntidad[tipo].etiquetaGrupo,
    entidades: entidades.filter((entidad) => entidad.tipo === tipo),
  })).filter((grupo) => grupo.entidades.length > 0)
}

export function filtrarEventos(
  eventos: EventoHistorial[],
  seleccion: ReadonlySet<string>,
): EventoHistorial[] {
  if (seleccion.size === 0) {
    return eventos
  }
  return eventos.filter(
    (evento) => evento.clase !== 'evento' || seleccion.has(llaveEntidad(evento.entidad)),
  )
}

export function contarEventos(eventos: EventoHistorial[]): number {
  return eventos.filter((evento) => evento.clase === 'evento').length
}

export function idHitoActual(eventos: EventoHistorial[]): string | null {
  let ultimo: string | null = null
  for (const evento of eventos) {
    if (evento.clase === 'hito') {
      ultimo = evento.id
    }
  }
  return ultimo
}

export function codigosSeleccionados(
  grupos: GrupoFiltro[],
  seleccion: ReadonlySet<string>,
): string[] {
  const codigos: string[] = []
  for (const grupo of grupos) {
    for (const entidad of grupo.entidades) {
      if (seleccion.has(entidad.llave)) {
        codigos.push(entidad.codigo)
      }
    }
  }
  return codigos
}

export function resumenDeFiltro(
  totalEventos: number,
  eventosPropios: number,
  codigos: string[],
): string {
  if (codigos.length === 0) {
    return totalEventos === 1
      ? 'Mostrando el único evento de la transacción.'
      : `Mostrando los ${totalEventos} eventos de la transacción.`
  }
  const plural = eventosPropios === 1 ? 'evento' : 'eventos'
  return `Mostrando ${eventosPropios} ${plural} de ${codigos.join(', ')}, más los avances de la transacción como referencia.`
}
