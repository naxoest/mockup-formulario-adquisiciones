import { useFormContext, useWatch } from 'react-hook-form'
import { formatCLP } from '@/utils/currency'
import type { SolicitudDisponible, TransaccionFormState } from '../../types/transaccion.types'
import { calcularMontoOrdenDeCompra } from '../../utils/montos'
import { detalleSolicitud, etiquetaSolicitud } from './TransaccionWizard.utils'

export function LineasOrdenDeCompraBloqueadas({
  index,
  solicitudes,
}: {
  index: number
  solicitudes: SolicitudDisponible[]
}) {
  const { control } = useFormContext<TransaccionFormState>()

  const lineas = useWatch({ control, name: `ordenesDeCompra.${index}.solicitantes` })
  const total = calcularMontoOrdenDeCompra(lineas)
  const porClave = new Map(solicitudes.map((solicitud) => [solicitud.claveFormulario, solicitud]))

  return (
    <div className="space-y-3">
      <ul aria-label="Líneas de la orden de compra" className="border-t border-mercury-200">
        {(lineas ?? []).map((linea) => {
          const solicitud = porClave.get(linea.claveFormulario)

          return (
            <li key={linea.claveFormulario} className="border-b border-mercury-200 py-3">
              <p className="truncate text-sm font-medium text-mercury-900">
                {solicitud ? etiquetaSolicitud(solicitud) : 'Solicitud no encontrada'}
              </p>
              {solicitud && (
                <p className="text-xs tabular-nums text-mercury-500">
                  {detalleSolicitud(solicitud)}
                </p>
              )}
              <ul aria-label="Montos por año" className="mt-2 space-y-1">
                {linea.montos.map((fila, posicion) => (
                  <li
                    key={fila.anio ?? `sin-anio-${posicion}`}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="tabular-nums text-mercury-500">{fila.anio ?? '—'}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-mercury-900">
                      {formatCLP(fila.monto ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-col items-start gap-0.5 sm:items-end">
        <span className="text-xs uppercase tracking-wide text-mercury-400">Total de la orden</span>
        <span className="text-xl font-semibold tabular-nums text-mercury-900">
          {formatCLP(total)}
        </span>
      </div>
    </div>
  )
}
