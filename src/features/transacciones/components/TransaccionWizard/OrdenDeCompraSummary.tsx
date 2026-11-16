import { useFormContext, useWatch } from 'react-hook-form'
import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatCLP } from '@/utils/currency'
import { formatShortDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { TransaccionFormState } from '../../types/transaccion.types'
import { calcularMontoOrdenDeCompra } from '../../utils/montos'

export function OrdenDeCompraSummary({ index, hasError }: { index: number; hasError: boolean }) {
  const { control } = useFormContext<TransaccionFormState>()

  const codigo = useWatch({ control, name: `ordenesDeCompra.${index}.codigo` })
  const solicitantes = useWatch({ control, name: `ordenesDeCompra.${index}.solicitantes` })
  const fechaEmision = useWatch({ control, name: `ordenesDeCompra.${index}.fechaEmision` })

  const total = calcularMontoOrdenDeCompra(solicitantes)
  const cantidad = solicitantes?.length ?? 0
  const etiqueta = codigo?.trim()

  return (
    <span className="flex w-full min-w-0 items-start gap-3 sm:items-center">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          etiqueta ? 'bg-espresso-100 text-espresso-700' : 'bg-mercury-50 text-mercury-400',
        )}
      >
        <ClipboardList aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'truncate text-base',
                etiqueta ? 'font-mono font-semibold text-mercury-900' : 'text-mercury-400',
              )}
            >
              {etiqueta ?? 'Sin código'}
            </span>
            {hasError && (
              <Badge variant="error" size="sm" dot>
                Incompleto
              </Badge>
            )}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
            <span
              className={cn(
                'flex min-w-0 items-center gap-1',
                cantidad === 0 ? 'text-mercury-400' : 'text-mercury-500',
              )}
            >
              <Users aria-hidden="true" className="size-3.5 shrink-0 text-mercury-400" />
              <span className="truncate">
                {cantidad === 0
                  ? 'Sin solicitudes'
                  : cantidad === 1
                    ? '1 solicitud'
                    : `${cantidad} solicitudes`}
              </span>
            </span>
            <span
              className={cn(
                'flex shrink-0 items-center gap-1',
                fechaEmision ? 'text-mercury-500' : 'text-mercury-400',
              )}
            >
              <CalendarDays aria-hidden="true" className="size-3.5 shrink-0 text-mercury-400" />
              <span className="tabular-nums">
                {fechaEmision ? formatShortDate(fechaEmision) : 'Sin fecha de emisión'}
              </span>
            </span>
          </span>
        </span>
        <span className="flex shrink-0 flex-row items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
          <span className="text-xs uppercase tracking-wide text-mercury-400">Total</span>
          <span
            className={cn(
              'text-base font-semibold tabular-nums',
              total > 0 ? 'text-mercury-900' : 'text-mercury-400',
            )}
          >
            {formatCLP(total)}
          </span>
        </span>
      </span>
    </span>
  )
}
