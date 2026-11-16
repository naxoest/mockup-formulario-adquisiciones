import type {
  UnidadSolicitanteFormValues,
  UnidadSolicitanteRequest,
} from '@/features/mantenedor/schemas/unidadSolicitante.schema'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'
import type { SelectOption } from '@/types/select'

const CAMPOS_UNIDAD = ['cr', 'nombre', 'tipo', 'sedes'] as const

type CampoUnidad = (typeof CAMPOS_UNIDAD)[number]

const AVISO_REGISTRO_NUEVO =
  'Si el CR o el tipo cambiaron oficialmente y debe conservarse el dato anterior, no guarde este cambio: registre una nueva carrera o unidad y desactive esta.'

export function esCampoUnidad(campo: string): campo is CampoUnidad {
  return (CAMPOS_UNIDAD as readonly string[]).includes(campo)
}

export function construirValoresFormulario(
  unidad?: UnidadSolicitante,
): UnidadSolicitanteFormValues {
  return {
    cr: unidad?.cr ?? null,
    nombre: unidad?.nombre ?? '',
    tipo: unidad?.tipo.value ?? '',
    sedes: unidad?.sedes.map((sede) => sede.value) ?? [],
  }
}

function etiquetaDe(opciones: SelectOption[], valor: string): string {
  return opciones.find((opcion) => opcion.value === valor)?.label ?? valor
}

function describirCantidad(cantidad: number, singular: string, plural: string): string | null {
  if (cantidad === 0) {
    return null
  }

  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

export function construirAvisoDeCambios(
  unidad: UnidadSolicitante,
  peticion: UnidadSolicitanteRequest,
  tipos: SelectOption[],
): string | null {
  const registros = [
    describirCantidad(unidad.solicitudes, 'solicitud', 'solicitudes'),
    describirCantidad(unidad.requerimientos, 'requerimiento', 'requerimientos'),
  ].filter((texto): texto is string => texto !== null)

  const cambiaCr = peticion.cr !== unidad.cr
  const cambiaTipo = peticion.tipo !== unidad.tipo.value
  const sedesQuitadas = unidad.sedes.filter((sede) => !peticion.sedes.includes(sede.value))

  const cambios = [
    ...(cambiaCr ? [`el CR cambiará de ${unidad.cr} a ${peticion.cr}`] : []),
    ...(cambiaTipo
      ? [`el tipo cambiará de ${unidad.tipo.label} a ${etiquetaDe(tipos, peticion.tipo)}`]
      : []),
    ...sedesQuitadas.map((sede) => `se quitará la sede ${sede.label}`),
  ]

  if (registros.length === 0 || cambios.length === 0) {
    return null
  }

  const aviso = `Este registro tiene ${registros.join(' y ')}. Al guardar, ${cambios.join(', ')}. Todos esos registros mostrarán los datos nuevos.`

  return cambiaCr || cambiaTipo ? `${aviso} ${AVISO_REGISTRO_NUEVO}` : aviso
}
