import { useQuery } from '@tanstack/react-query'
import { useWatch } from 'react-hook-form'
import { Lock, MapPin } from 'lucide-react'
import type { PrecompromisoForm, TransaccionFormState } from '../../types/transaccion.types'
import { sumarPrecompromisos } from '../../utils/montos'
import { unidadesSolicitantesQueryOptions } from '../../api/unidadesSolicitantes'
import { tiposSolicitanteQueryOptions, tiposSolicitudQueryOptions } from '../../api/listas'
import { Badge } from '@/components/ui/Badge'
import { formatCLP } from '@/utils/currency'
import { cn } from '@/utils/cn'
import { presentacionPorTipo } from './TransaccionWizard.utils'

export function SolicitanteSummary({
  index,
  hasError,
  mostrarCotizacion = false,
  motivoBloqueo = null,
}: {
  index: number
  hasError: boolean
  mostrarCotizacion?: boolean
  motivoBloqueo?: string | null
}) {
  const tipoSolicitante = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.tipo`,
  }) as string | undefined

  const nombreSolicitante = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.nombre`,
  }) as string | undefined

  const cr = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.cr`,
  }) as number | undefined

  const precompromisos = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.precompromisos`,
  }) as PrecompromisoForm[] | undefined

  const tipoSolicitud = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.tipoSolicitud`,
  }) as string | undefined

  const codigoSaserviSabienes = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.codigoSaserviSabienes`,
  }) as string | undefined

  const montoCotizacion = sumarPrecompromisos(precompromisos)

  const id = useWatch<TransaccionFormState>({
    name: `solicitantes.${index}.id`,
  }) as number | null | undefined

  const { data: unidades } = useQuery({
    ...unidadesSolicitantesQueryOptions(tipoSolicitante ?? '', '', ''),
    enabled: !!tipoSolicitante,
  })

  const { data: tipos } = useQuery(tiposSolicitanteQueryOptions)
  const { data: tiposSolicitud } = useQuery(tiposSolicitudQueryOptions)

  const unidad = unidades?.find((item) => item.value === nombreSolicitante)
  const etiquetaUnidad = nombreSolicitante ? (unidad?.nombre ?? nombreSolicitante) : undefined
  const etiquetaSedes = unidad?.etiquetaSedes

  const etiquetaTipo = tipoSolicitante
    ? (tipos?.find((item) => item.value === tipoSolicitante)?.label ?? tipoSolicitante)
    : undefined

  const etiquetaTipoSolicitud =
    tiposSolicitud?.find((item) => item.value === tipoSolicitud)?.label ?? tipoSolicitud
  const etiquetaCodigo =
    tipoSolicitud && codigoSaserviSabienes
      ? `${etiquetaTipoSolicitud} ${codigoSaserviSabienes}`
      : undefined

  const presentacion = tipoSolicitante ? presentacionPorTipo[tipoSolicitante] : undefined
  const IconoTipo = presentacion?.icono
  const hayMetadatos =
    !!etiquetaSedes || !!cr || id != null || !!etiquetaCodigo || (!presentacion && !!etiquetaTipo)

  return (
    <span className="flex w-full min-w-0 items-start gap-3 sm:items-center">
      {presentacion && IconoTipo && (
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            presentacion.clases,
          )}
        >
          <IconoTipo aria-hidden="true" className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'truncate text-base',
                etiquetaUnidad ? 'font-semibold text-mercury-900' : 'text-mercury-400',
              )}
            >
              {etiquetaUnidad ?? 'Sin unidad seleccionada'}
            </span>
            {hasError && (
              <Badge variant="error" size="sm" dot>
                Incompleto
              </Badge>
            )}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-mercury-500">
            {!hayMetadatos && <span className="text-mercury-400">Sin datos</span>}
            {!presentacion && etiquetaTipo && <span className="shrink-0">{etiquetaTipo}</span>}
            {etiquetaSedes && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-mercury-400" />
                <span className="truncate">{etiquetaSedes}</span>
              </span>
            )}
            {!!cr && <span className="shrink-0 tabular-nums">CR {cr}</span>}
            {id != null && <span className="shrink-0 tabular-nums">ID {id}</span>}
            {etiquetaCodigo && (
              <span className="min-w-0 truncate tabular-nums">{etiquetaCodigo}</span>
            )}
          </span>
          {motivoBloqueo && (
            <span className="flex min-w-0 items-start gap-1 text-xs text-mercury-500">
              <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-mercury-400" />
              <span>{motivoBloqueo}</span>
            </span>
          )}
        </span>
        {mostrarCotizacion && (
          <span className="flex shrink-0 flex-row items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
            <span
              className={cn(
                'text-xs uppercase tracking-wide',
                montoCotizacion !== null ? 'text-mercury-400' : 'text-saffron-600',
              )}
            >
              {montoCotizacion !== null ? 'Cotización' : 'Falta cotización'}
            </span>
            <span
              className={cn(
                'text-base font-semibold tabular-nums',
                montoCotizacion !== null ? 'text-mercury-900' : 'text-saffron-600',
              )}
            >
              {montoCotizacion !== null ? formatCLP(montoCotizacion) : '—'}
            </span>
          </span>
        )}
      </span>
    </span>
  )
}
