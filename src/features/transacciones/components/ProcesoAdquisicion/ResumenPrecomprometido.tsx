import { useId } from 'react'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import { formatCLP } from '@/utils/currency'

export function ResumenPrecomprometido({ transaccion }: { transaccion: Transaccion }) {
  const idTitulo = useId()
  const activas = transaccion.solicitudes.filter((solicitud) => solicitud.estado !== 'rechazada')

  return (
    <section aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
        Resumen de lo precomprometido
      </h3>
      <p className="mt-1 text-sm text-mercury-600">
        El proceso de adquisición está completo. Estos son los montos precomprometidos por año de
        cada solicitud activa.
      </p>

      <ul className="mt-3 divide-y divide-mercury-100 rounded-xl border border-mercury-200">
        {activas.map((solicitud) => (
          <li key={solicitud.id} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="min-w-0">
                <p className="text-sm font-medium text-mercury-900">{solicitud.unidad.nombre}</p>
                <p className="text-xs text-mercury-500">
                  Solicitud {solicitud.id} ·{' '}
                  {solicitud.unidad.sedes.map((sede) => sede.label).join(', ')}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-mercury-900">
                {solicitud.montoCotizacion === null
                  ? 'Sin cotización'
                  : formatCLP(solicitud.montoCotizacion)}
              </span>
            </div>
            {solicitud.precompromisos.length > 0 && (
              <dl className="mt-2 flex flex-col gap-1">
                {solicitud.precompromisos.map((precompromiso) => (
                  <div
                    key={precompromiso.anio}
                    className="flex justify-between gap-4 text-xs text-mercury-600"
                  >
                    <dt>Año {precompromiso.anio}</dt>
                    <dd className="tabular-nums">{formatCLP(precompromiso.monto)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      <dl className="mt-3 flex items-baseline justify-between gap-4 border-t border-mercury-200 pt-3">
        <dt className="text-sm font-medium text-mercury-700">Total precomprometido</dt>
        <dd className="text-xl font-semibold tabular-nums text-mercury-900">
          {formatCLP(transaccion.montoCotizado)}
        </dd>
      </dl>
    </section>
  )
}
