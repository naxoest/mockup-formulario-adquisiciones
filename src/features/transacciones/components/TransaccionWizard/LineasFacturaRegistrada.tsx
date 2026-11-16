import { useFormContext, useWatch } from 'react-hook-form'
import { formatCLP } from '@/utils/currency'
import type { TransaccionFormState } from '../../types/transaccion.types'
import { facturadoSinGuardar, type MontoDeOrden } from './TransaccionWizard.sincronizacion'

export function LineasFacturaRegistrada({
  index,
  montosDeOrden,
}: {
  index: number
  montosDeOrden: MontoDeOrden[]
}) {
  const { control } = useFormContext<TransaccionFormState>()

  const lineas = useWatch({ control, name: `facturas.${index}.montos` })
  const facturas = useWatch({ control, name: 'facturas' })

  const total = (lineas ?? []).reduce((suma, linea) => suma + (linea?.monto ?? 0), 0)

  return (
    <div className="space-y-3">
      <p className="text-xs text-mercury-500">
        Las líneas de una factura registrada no se pueden modificar.
      </p>
      <ul aria-label="Líneas de la factura" className="border-t border-mercury-200">
        {(lineas ?? []).map((linea) => {
          const id = Number(linea.montoOrdenCompraId)
          const montoDeOrden = montosDeOrden.find((item) => item.id === id)
          const facturadoTotal = montoDeOrden
            ? montoDeOrden.facturado + facturadoSinGuardar(facturas, id)
            : 0
          const exceso = montoDeOrden ? facturadoTotal - montoDeOrden.monto : 0

          return (
            <li
              key={linea.montoOrdenCompraId}
              className="flex flex-col gap-1 border-b border-mercury-200 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-mercury-900">
                  {montoDeOrden
                    ? `${montoDeOrden.codigoOrden} · Solicitud ${montoDeOrden.solicitudId} · ${montoDeOrden.anio}`
                    : `Monto de orden ${linea.montoOrdenCompraId}`}
                </p>
                {montoDeOrden && (
                  <p className="text-xs tabular-nums text-mercury-500">
                    Monto de la orden {formatCLP(montoDeOrden.monto)} · Facturado en total{' '}
                    {formatCLP(facturadoTotal)}
                  </p>
                )}
                {exceso > 0 && (
                  <p className="text-xs font-medium tabular-nums text-scarlet-700">
                    Excede el monto de la orden en {formatCLP(exceso)}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-mercury-900">
                {formatCLP(linea.monto ?? 0)}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col items-start gap-0.5 sm:items-end">
        <span className="text-xs uppercase tracking-wide text-mercury-400">
          Total de la factura
        </span>
        <span className="text-xl font-semibold tabular-nums text-mercury-900">
          {formatCLP(total)}
        </span>
      </div>
    </div>
  )
}
