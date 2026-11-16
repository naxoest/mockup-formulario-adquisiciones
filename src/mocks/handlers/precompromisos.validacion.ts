import { responderError } from '@/mocks/handlers/respuestas'
import { periodoPresupuestarioOptions } from '@/mocks/data/listas.mock'

export interface PrecompromisoEntrante {
  anio: number
  monto: number
}

export function validarPrecompromisos(
  precompromisos: PrecompromisoEntrante[],
  prefijo: string,
): Response | null {
  const vistos = new Set<number>()

  for (const [indice, entrante] of precompromisos.entries()) {
    const campo = `${prefijo}precompromisos.${indice}.anio`

    if (!periodoPresupuestarioOptions.some((periodo) => periodo.anio === entrante.anio)) {
      return responderError('El año presupuestario no existe', 400, 'periodo_inexistente', campo)
    }

    if (vistos.has(entrante.anio)) {
      return responderError(
        'El año presupuestario está repetido en la solicitud',
        409,
        'anio_duplicado',
        campo,
      )
    }

    vistos.add(entrante.anio)
  }

  return null
}
