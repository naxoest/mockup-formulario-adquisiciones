import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Building2, GraduationCap, MapPin, Wallet } from 'lucide-react'
import { formatCLP } from '@/utils/currency'
import { formatShortDate, fromCivilDate } from '@/utils/date'
import { Loading } from '@/components/ui/Loading'
import { transaccionQueryOptions } from '@/features/transacciones/api/transacciones'
import {
  financiamientosQueryOptions,
  tiposSolicitudQueryOptions,
} from '@/features/transacciones/api/listas'

const tipoConfig: Record<string, { bg: string; icon: React.ReactNode; hoverBg: string }> = {
  unidad: {
    bg: 'bg-primary-100 text-primary-700',
    hoverBg: 'hover:bg-primary-50',
    icon: <Building2 className="size-5" />,
  },
  carrera: {
    bg: 'bg-jade-100 text-jade-700',
    hoverBg: 'hover:bg-jade-50',
    icon: <GraduationCap className="size-5" />,
  },
  _default: {
    bg: 'bg-mercury-100 text-mercury-600',
    hoverBg: 'hover:bg-mercury-50',
    icon: <AlertCircle className="size-5" />,
  },
}

export function TransaccionUnidadesPanel({ transaccionId }: { transaccionId: number }) {
  const { data, isPending, isError } = useQuery(transaccionQueryOptions(transaccionId))
  const financiamientos = useQuery(financiamientosQueryOptions)
  const tiposSolicitud = useQuery(tiposSolicitudQueryOptions)

  if (isPending) {
    return <Loading variant="container" />
  }

  if (isError || !data) {
    return <div className="text-sm text-scarlet-600">No se pudo cargar el detalle.</div>
  }

  if (data.solicitudes.length === 0) {
    return <div className="text-sm text-mercury-500">Sin unidades asociadas.</div>
  }

  return (
    <div className="@container">
      <div className="grid gap-3 @2xl:grid-cols-2">
        {data.solicitudes.map((solicitud) => {
          const cfg = tipoConfig[solicitud.unidad.tipo] ?? tipoConfig._default
          const ordenesDeLaUnidad = data.ordenesDeCompra
            .map((oc) => ({
              codigo: oc.codigo,
              fechaEmision: oc.fechaEmision,
              montos: oc.montos
                .filter((monto) => monto.solicitudId === solicitud.id)
                .sort((a, b) => a.anio - b.anio),
            }))
            .filter((orden) => orden.montos.length > 0)
          const etiquetaFinanciamiento =
            solicitud.financiamiento === null
              ? null
              : (financiamientos.data?.find((opcion) => opcion.value === solicitud.financiamiento)
                  ?.label ?? solicitud.financiamiento)
          const etiquetaTipoSolicitud =
            tiposSolicitud.data?.find((opcion) => opcion.value === solicitud.tipoSolicitud)
              ?.label ?? solicitud.tipoSolicitud
          return (
            <div
              key={solicitud.id}
              className={cn(
                'flex flex-wrap items-center gap-3 rounded-lg border border-mercury-200 bg-white p-3 transition-colors duration-150',
                cfg.hoverBg,
              )}
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  cfg.bg,
                )}
              >
                {cfg.icon}
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <div className="truncate text-sm font-semibold text-mercury-900">
                  {solicitud.unidad.nombre || '—'}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      tipoConfig._default.bg,
                    )}
                  >
                    CR: {solicitud.unidad.cr || '—'}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cfg.bg)}>
                    {solicitud.unidad.tipo
                      ? solicitud.unidad.tipo.charAt(0).toUpperCase() +
                        solicitud.unidad.tipo.slice(1)
                      : '—'}
                  </span>
                  <span className="flex min-w-0 items-center gap-1 text-xs text-mercury-500">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">
                      {solicitud.unidad.sedes.map((sede) => sede.label).join(', ')}
                    </span>
                  </span>
                  {solicitud.codigoSaserviSabienes !== null && (
                    <span className="min-w-0 truncate text-xs text-mercury-500 tabular-nums">
                      {etiquetaTipoSolicitud} {solicitud.codigoSaserviSabienes}
                    </span>
                  )}
                  <span className="flex min-w-0 items-center gap-1 text-xs text-mercury-500">
                    <Wallet className="size-3 shrink-0" />
                    <span className="truncate">
                      {etiquetaFinanciamiento === null
                        ? 'Sin financiamiento'
                        : `Financiamiento: ${etiquetaFinanciamiento}`}
                    </span>
                  </span>
                  <span className="flex min-w-0 items-center gap-1 text-xs text-mercury-500">
                    <Wallet className="size-3 shrink-0" />
                    <span className="truncate">
                      {etiquetaFinanciamiento === null
                        ? 'Sin financiamiento'
                        : `Financiamiento: ${etiquetaFinanciamiento}`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="ml-auto shrink-0 space-y-1 text-right">
                <div>
                  <div className="text-xs text-mercury-400">Cotización</div>
                  <div className="text-sm font-bold text-mercury-900">
                    {solicitud.montoCotizacion !== null
                      ? formatCLP(solicitud.montoCotizacion)
                      : '—'}
                  </div>
                  {solicitud.precompromisos.map((precompromiso) => (
                    <div key={precompromiso.anio} className="text-xs tabular-nums text-mercury-500">
                      {precompromiso.anio}: {formatCLP(precompromiso.monto)}
                    </div>
                  ))}
                </div>
                {ordenesDeLaUnidad.map((orden) => (
                  <div key={orden.codigo}>
                    <div className="max-w-30 truncate text-[10px] text-mercury-400">
                      {orden.codigo}
                    </div>
                    <div className="text-[10px] tabular-nums text-mercury-400">
                      {formatShortDate(fromCivilDate(orden.fechaEmision))}
                    </div>
                    {orden.montos.map((monto) => (
                      <div
                        key={monto.id}
                        className="text-xs font-semibold tabular-nums text-mercury-700"
                      >
                        {monto.anio}: {formatCLP(monto.monto)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
