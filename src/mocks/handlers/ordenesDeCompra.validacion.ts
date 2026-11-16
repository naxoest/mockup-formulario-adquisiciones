import { responderError } from '@/mocks/handlers/respuestas'
import { periodoPresupuestarioOptions } from '@/mocks/data/listas.mock'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'

export interface MontoEntrante {
  solicitudId: number
  anio: number
  monto: number
}

export function validarMontos(
  transaccion: TransaccionAlmacenada,
  montos: MontoEntrante[],
): Response | null {
  const vistos = new Set<string>()

  for (const [indice, entrante] of montos.entries()) {
    const solicitud = transaccion.solicitudes.find((item) => item.id === entrante.solicitudId)

    if (!solicitud) {
      return responderError(
        'La solicitud no pertenece a la transacción',
        409,
        'solicitud_ajena',
        `montos.${indice}.solicitudId`,
      )
    }

    if (solicitud.estado === 'rechazada') {
      return responderError(
        'La solicitud está rechazada',
        409,
        'solicitud_rechazada',
        `montos.${indice}.solicitudId`,
      )
    }

    if (!periodoPresupuestarioOptions.some((periodo) => periodo.anio === entrante.anio)) {
      return responderError(
        'El año presupuestario no existe',
        400,
        'periodo_inexistente',
        `montos.${indice}.anio`,
      )
    }

    const clave = `${entrante.solicitudId}-${entrante.anio}`

    if (vistos.has(clave)) {
      return responderError(
        'La solicitud ya tiene un monto para ese año en la orden',
        409,
        'anio_duplicado',
        `montos.${indice}.anio`,
      )
    }

    vistos.add(clave)
  }

  return null
}
