import type { NuevaImportacionRequest } from '@/features/requerimientos/schemas/importacionRequest.schema'
import { calcularHuella } from '@/features/requerimientos/utils/huella'

export type PreparacionImportacion =
  | {
      valida: true
      solicitud: NuevaImportacionRequest
      avisos: string[]
    }
  | {
      valida: false
      error: string
    }

export async function prepararImportacion(
  archivo: File,
  solicitanteId: number,
): Promise<PreparacionImportacion> {
  const [{ leerPlanilla }, contenido] = await Promise.all([
    import('@/features/requerimientos/utils/planilla'),
    archivo.arrayBuffer(),
  ])
  const lectura = leerPlanilla(contenido)

  if (!lectura.valida) {
    return { valida: false, error: lectura.error }
  }

  const huella = await calcularHuella(contenido)

  return {
    valida: true,
    avisos: lectura.avisos,
    solicitud: {
      solicitanteId,
      archivo: { nombre: archivo.name, tamano: archivo.size, huella },
      filas: lectura.filas,
    },
  }
}
