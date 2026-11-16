import { useFormContext, useWatch } from 'react-hook-form'
import { Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatCLP } from '@/utils/currency'
import { formatShortDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { TransaccionFormState } from '../../types/transaccion.types'

export function FacturaSummary({ index, hasError }: { index: number; hasError: boolean }) {
  const { control } = useFormContext<TransaccionFormState>()

  const folio = useWatch({ control, name: `facturas.${index}.folio` })
  const fechaEmision = useWatch({ control, name: `facturas.${index}.fechaEmision` })
  const montos = useWatch({ control, name: `facturas.${index}.montos` })

  const total = (montos ?? []).reduce((suma, linea) => suma + (linea?.monto ?? 0), 0)
  const cantidad = montos?.length ?? 0

  return (
    <span className="flex w-full min-w-0 items-start gap-3 sm:items-center">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          folio ? 'bg-lagoon-100 text-lagoon-700' : 'bg-mercury-50 text-mercury-400',
        )}
      >
        <Receipt aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'truncate text-base',
                folio ? 'font-mono font-semibold text-mercury-900' : 'text-mercury-400',
              )}
            >
              {folio ? `Número ${folio}` : 'Sin número'}
            </span>
            {hasError && (
              <Badge variant="error" size="sm" dot>
                Incompleto
              </Badge>
            )}
          </span>
          <span className="truncate text-xs text-mercury-500">
            {fechaEmision ? formatShortDate(fechaEmision) : 'Sin fecha de emisión'}
            {' · '}
            {cantidad === 0 ? 'Sin líneas' : cantidad === 1 ? '1 línea' : `${cantidad} líneas`}
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
