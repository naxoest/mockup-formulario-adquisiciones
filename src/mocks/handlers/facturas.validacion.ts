import { responderError } from '@/mocks/handlers/respuestas'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'

export interface MontoFacturaEntrante {
  montoOrdenCompraId: number
  monto: number
}

export function validarMontosFactura(
  transaccion: TransaccionAlmacenada,
  montos: MontoFacturaEntrante[],
): Response | null {
  const vistos = new Set<number>()

  for (const [indice, entrante] of montos.entries()) {
    const campo = `montos.${indice}.montoOrdenCompraId`

    const orden = transaccion.ordenesDeCompra.find((item) =>
      item.montos.some((monto) => monto.id === entrante.montoOrdenCompraId),
    )

    if (!orden) {
      return responderError(
        'El monto de orden no pertenece a la transacción',
        409,
        'monto_orden_ajeno',
        campo,
      )
    }

    if (orden.estado === 'cancelada') {
      return responderError('La orden de compra está cancelada', 409, 'orden_cancelada', campo)
    }

    if (vistos.has(entrante.montoOrdenCompraId)) {
      return responderError(
        'El monto de orden aparece más de una vez en la factura',
        409,
        'monto_orden_duplicado',
        campo,
      )
    }

    vistos.add(entrante.montoOrdenCompraId)
  }

  return null
}
