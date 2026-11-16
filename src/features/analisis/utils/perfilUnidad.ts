import type {
  FilaDetalleUnidad,
  RegistroDetalleUnidad,
} from '@/features/analisis/types/perfilUnidad.types'
import type { SelectOption } from '@/types/select'

export const CLAVES_FILTRO_DETALLE_UNIDAD = ['tipo', 'modalidad'] as const

export type ClaveFiltroDetalleUnidad = (typeof CLAVES_FILTRO_DETALLE_UNIDAD)[number]

const codigos: Record<ClaveFiltroDetalleUnidad, (fila: FilaDetalleUnidad) => string> = {
  tipo: (fila) => fila.tipoCodigo,
  modalidad: (fila) => fila.modalidadCodigo,
}

const etiquetas: Record<ClaveFiltroDetalleUnidad, (fila: FilaDetalleUnidad) => string> = {
  tipo: (fila) => fila.tipo,
  modalidad: (fila) => fila.modalidad,
}

const FORMATO_DIA_SEMANA = new Intl.DateTimeFormat('es-CL', { weekday: 'long', timeZone: 'UTC' })

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export interface PartesFecha {
  diaSemana: string
  fecha: string
}

function esClaveFiltro(clave: string): clave is ClaveFiltroDetalleUnidad {
  return (CLAVES_FILTRO_DETALLE_UNIDAD as readonly string[]).includes(clave)
}

export function construirFilasDetalleUnidad(
  registros: RegistroDetalleUnidad[],
): FilaDetalleUnidad[] {
  return registros.map((registro) => ({
    id: registro.id,
    transaccionId: registro.transaccionId,
    fecha: registro.fecha,
    tipo: registro.tipo.label,
    tipoCodigo: registro.tipo.value,
    modalidad: registro.modalidad.label,
    modalidadCodigo: registro.modalidad.value,
    ordenDeCompra: registro.ordenDeCompra.codigo,
    ordenCancelada: registro.ordenDeCompra.estado === 'cancelada',
    monto: registro.monto,
    estado: registro.estadoSolicitud?.label ?? null,
    estadoCodigo: registro.estadoSolicitud?.value ?? null,
    evaluacion: registro.estadoEvaluacion?.label ?? null,
    observaciones: registro.observaciones,
  }))
}

export function filtrarDetalleUnidad(
  filas: FilaDetalleUnidad[],
  valores: Record<string, string[]>,
): FilaDetalleUnidad[] {
  const activos = Object.entries(valores).filter(
    (entrada): entrada is [ClaveFiltroDetalleUnidad, string[]] =>
      esClaveFiltro(entrada[0]) && entrada[1].length > 0,
  )

  if (activos.length === 0) return filas

  return filas.filter((fila) =>
    activos.every(([clave, seleccionados]) => seleccionados.includes(codigos[clave](fila))),
  )
}

export function opcionesFiltroDetalle(
  filas: FilaDetalleUnidad[],
  clave: ClaveFiltroDetalleUnidad,
): SelectOption[] {
  const opciones = new Map<string, string>()

  for (const fila of filas) {
    opciones.set(codigos[clave](fila), etiquetas[clave](fila))
  }

  return [...opciones.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es-CL'))
}

export function partesFecha(fechaCivil: string): PartesFecha {
  const instante = new Date(`${fechaCivil}T00:00:00Z`)

  if (Number.isNaN(instante.getTime())) {
    return { diaSemana: '', fecha: fechaCivil }
  }

  const diaSemana = FORMATO_DIA_SEMANA.format(instante)
  const partes = FORMATO_FECHA.formatToParts(instante)
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value.replace('.', '') ?? ''

  return {
    diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
    fecha: `${valor('day')} ${valor('month')} ${valor('year')}`,
  }
}

export function nombreArchivoPerfilUnidad(unidadId: number, fecha: Date): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `perfil-unidad-${unidadId}-${anio}-${mes}-${dia}.pdf`
}
