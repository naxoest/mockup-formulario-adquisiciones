import type {
  ProyectoFormValues,
  ProyectoRequest,
} from '@/features/mantenedor/schemas/proyecto.schema'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

const CAMPOS_PROYECTO = ['cr', 'nombre'] as const

type CampoProyecto = (typeof CAMPOS_PROYECTO)[number]

const AVISO_REGISTRO_NUEVO =
  'Si el CR cambió oficialmente y debe conservarse el dato anterior, no guarde este cambio: registre un nuevo proyecto y desactive este.'

export function esCampoProyecto(campo: string): campo is CampoProyecto {
  return (CAMPOS_PROYECTO as readonly string[]).includes(campo)
}

export function construirValoresFormularioProyecto(proyecto?: Proyecto): ProyectoFormValues {
  return {
    cr: proyecto?.cr ?? null,
    nombre: proyecto?.nombre ?? '',
  }
}

function describirCantidad(cantidad: number, singular: string, plural: string): string | null {
  if (cantidad === 0) {
    return null
  }

  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

export function construirAvisoDeCambiosProyecto(
  proyecto: Proyecto,
  peticion: ProyectoRequest,
): string | null {
  const solicitudes = describirCantidad(proyecto.solicitudes, 'solicitud', 'solicitudes')

  const cambiaCr = peticion.cr !== proyecto.cr

  if (solicitudes === null || !cambiaCr) {
    return null
  }

  const aviso = `Este proyecto tiene ${solicitudes}. Al guardar, el CR cambiará de ${proyecto.cr} a ${peticion.cr}. Todas esas solicitudes mostrarán los datos nuevos.`

  return `${aviso} ${AVISO_REGISTRO_NUEVO}`
}
