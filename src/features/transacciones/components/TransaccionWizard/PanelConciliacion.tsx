import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'
import type { SolicitudDisponible } from '../../types/transaccion.types'
import {
  totalDeSolicitud,
  type ConciliacionSolicitud,
  type ConciliacionTransaccion,
} from '../../utils/conciliacion'
import { BarraConciliacion } from './BarraConciliacion'
import {
  avisosPorAnio,
  resumenDeConciliacion,
  resumenTotal,
  textoAnios,
} from './BarraConciliacion.utils'
import { detalleSolicitud, etiquetaSolicitud, presentacionPorTipo } from './TransaccionWizard.utils'

const MAXIMO_VISIBLE = 3

function estaExcedida(fila: ConciliacionSolicitud): boolean {
  return (
    totalDeSolicitud(fila).estado === 'sobreCotizacion' ||
    fila.anios.some((anual) => anual.estado === 'sobreCotizacion')
  )
}

export function PanelConciliacion({
  conciliacion,
  solicitudes,
}: {
  conciliacion: ConciliacionTransaccion
  solicitudes: SolicitudDisponible[]
}) {
  const [expandido, setExpandido] = useState(false)

  if (conciliacion.porSolicitud.length === 0 && conciliacion.comprometidoSinSolicitud === 0) {
    return null
  }

  const porClave = new Map(solicitudes.map((solicitud) => [solicitud.claveFormulario, solicitud]))
  const total = resumenTotal(conciliacion.precomprometidoTotal, conciliacion.comprometidoTotal)

  const hayRecorte = conciliacion.porSolicitud.length > MAXIMO_VISIBLE
  const visibles =
    hayRecorte && !expandido
      ? conciliacion.porSolicitud.slice(0, MAXIMO_VISIBLE)
      : conciliacion.porSolicitud
  const ocultas = conciliacion.porSolicitud.slice(visibles.length)

  const excedidas = ocultas.filter((fila) => estaExcedida(fila)).length
  const sinComprometer = ocultas.filter(
    (fila) => totalDeSolicitud(fila).estado === 'sinComprometer',
  ).length
  const avisos = [
    excedidas > 0 ? (excedidas === 1 ? '1 excedida' : `${excedidas} excedidas`) : null,
    sinComprometer > 0 ? `${sinComprometer} sin comprometer` : null,
  ].filter((aviso): aviso is string => aviso !== null)

  return (
    <div className="overflow-hidden rounded-lg border border-mercury-300">
      <div className="grid grid-cols-1 bg-mercury-50 sm:grid-cols-3">
        <div className="border-b border-mercury-200 px-4 py-3 sm:border-b-0">
          <span className="block text-xs uppercase tracking-wide text-mercury-500">
            Precomprometido
          </span>
          <span className="mt-0.5 block text-xl font-semibold tabular-nums text-mercury-900">
            {formatCLP(conciliacion.precomprometidoTotal)}
          </span>
          <span className="mt-0.5 block text-xs text-mercury-400">suma de las cotizaciones</span>
        </div>
        <div className="border-b border-mercury-200 px-4 py-3 sm:border-b-0 sm:border-l sm:border-l-mercury-200">
          <span className="block text-xs uppercase tracking-wide text-mercury-500">
            Comprometido
          </span>
          <span className="mt-0.5 block text-xl font-semibold tabular-nums text-mercury-900">
            {formatCLP(conciliacion.comprometidoTotal)}
          </span>
          <span className="mt-0.5 block text-xs text-mercury-400">
            suma de las órdenes de compra
          </span>
        </div>
        <div className="px-4 py-3 sm:border-l sm:border-l-mercury-200">
          <span className="block text-xs uppercase tracking-wide text-mercury-500">
            {total.etiqueta}
          </span>
          <span className={cn('mt-0.5 block text-xl font-semibold tabular-nums', total.clase)}>
            {total.valor}
          </span>
          <span className="mt-0.5 block text-xs text-mercury-400">
            diferencia entre ambos montos
          </span>
        </div>
      </div>

      {conciliacion.porSolicitud.length > 0 && (
        <div className="border-t border-mercury-200 px-4 py-1">
          <ul>
            {visibles.map((fila) => {
              const solicitud = porClave.get(fila.claveFormulario)
              const presentacion = solicitud ? presentacionPorTipo[solicitud.tipo] : undefined
              const IconoTipo = presentacion?.icono
              const totales = totalDeSolicitud(fila)
              const resumen = resumenDeConciliacion(totales)
              const anios = textoAnios(fila)
              const avisosAnuales = avisosPorAnio(fila)

              return (
                <li
                  key={fila.claveFormulario}
                  className="flex items-center gap-3 border-t border-mercury-100 py-3 first:border-t-0"
                >
                  {presentacion && IconoTipo ? (
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        presentacion.clases,
                      )}
                    >
                      <IconoTipo aria-hidden="true" className="size-4" />
                    </span>
                  ) : (
                    <span className="size-8 shrink-0" aria-hidden="true" />
                  )}

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={cn(
                        'truncate text-sm font-medium',
                        solicitud?.unidad ? 'text-mercury-900' : 'text-mercury-500',
                      )}
                    >
                      {solicitud ? etiquetaSolicitud(solicitud) : 'Solicitud eliminada'}
                    </span>
                    <span className="truncate text-xs tabular-nums text-mercury-500">
                      {solicitud ? detalleSolicitud(solicitud) : 'Sin datos de la unidad'}
                    </span>
                    {anios && (
                      <span className="text-xs tabular-nums text-mercury-500">{anios}</span>
                    )}
                    <BarraConciliacion
                      precomprometido={totales.precomprometido}
                      comprometido={totales.comprometido}
                      estado={totales.estado}
                    />
                    {avisosAnuales.map((aviso) => (
                      <span key={aviso.anio} className={cn('text-xs tabular-nums', aviso.clase)}>
                        {aviso.texto}
                      </span>
                    ))}
                  </span>

                  <span className="flex w-48 shrink-0 flex-col">
                    <span className="flex items-baseline justify-between gap-3 text-xs leading-relaxed">
                      <span className="truncate text-mercury-500">Comprometido</span>
                      <span className="shrink-0 font-semibold tabular-nums text-mercury-900">
                        {resumen.comprometido}
                      </span>
                    </span>
                    {resumen.cotizado && (
                      <span className="flex items-baseline justify-between gap-3 text-xs leading-relaxed">
                        <span className="truncate text-mercury-500">Cotizado</span>
                        <span className="shrink-0 font-semibold tabular-nums text-mercury-900">
                          {resumen.cotizado}
                        </span>
                      </span>
                    )}
                    <span
                      className={cn(
                        'mt-1 flex items-baseline justify-between gap-3 border-t border-mercury-200 pt-1 text-xs leading-relaxed',
                        resumen.clase,
                      )}
                    >
                      <span className="truncate font-semibold">{resumen.etiqueta}</span>
                      <span className="shrink-0 font-bold tabular-nums">{resumen.valor}</span>
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>

          {hayRecorte && (
            <div className="flex flex-wrap items-center gap-3 border-t border-mercury-200 py-3">
              <button
                type="button"
                onClick={() => setExpandido((previo) => !previo)}
                className="flex items-center gap-2 rounded-lg border border-mercury-300 px-3 py-1.5 text-xs text-mercury-700 transition-colors hover:bg-mercury-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-4 transition-transform duration-200',
                    expandido && 'rotate-180',
                  )}
                />
                {expandido
                  ? 'Ver menos'
                  : ocultas.length === 1
                    ? 'Ver la solicitud restante'
                    : `Ver las ${ocultas.length} solicitudes restantes`}
              </button>
              {!expandido && avisos.length > 0 && (
                <span className="text-xs text-mercury-500">{avisos.join(' · ')}</span>
              )}
            </div>
          )}
        </div>
      )}

      {conciliacion.comprometidoSinSolicitud > 0 && (
        <p className="border-t border-mercury-200 bg-saffron-50 px-4 py-2.5 text-xs tabular-nums text-saffron-700">
          {formatCLP(conciliacion.comprometidoSinSolicitud)} comprometidos en líneas cuya solicitud
          ya no existe. Están incluidos en el total y no tienen cotización con la cual compararse.
        </p>
      )}
    </div>
  )
}
