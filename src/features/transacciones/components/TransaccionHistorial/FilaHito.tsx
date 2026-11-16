import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { HitoTransaccion } from '../../types/historial.types'

export function FilaHito({
  hito,
  esActual,
  esUltimo,
}: {
  hito: HitoTransaccion
  esActual: boolean
  esUltimo: boolean
}) {
  return (
    <li
      aria-current={esActual ? 'step' : undefined}
      className={cn(
        'relative px-5 py-4',
        esActual ? 'bg-primary-50' : 'bg-mercury-100',
        !esUltimo && 'border-b border-mercury-100',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-[1.5625rem] top-0 w-px bg-mercury-300',
          esUltimo ? 'h-3' : 'h-full',
        )}
      />

      <div className="relative pl-8">
        <span
          className={cn(
            'absolute left-0 top-1 flex size-6 -translate-x-[0.4375rem] items-center justify-center rounded-full text-white ring-4',
            esActual ? 'bg-primary-700 ring-primary-50' : 'bg-primary-600 ring-mercury-100',
          )}
        >
          <Check aria-hidden="true" strokeWidth={3} className="size-3" />
        </span>

        <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary-700">
          {esActual ? 'Estado actual de la transacción' : 'La transacción avanzó'}
        </p>

        <h4
          className={cn(
            'mt-0.5 text-[0.9375rem] font-bold',
            esActual ? 'text-primary-900' : 'text-mercury-900',
          )}
        >
          {hito.estado}
        </h4>

        <p
          className={cn(
            'mt-1 text-xs leading-relaxed',
            esActual ? 'text-mercury-700' : 'text-mercury-600',
          )}
        >
          {hito.explicacion}
        </p>
      </div>
    </li>
  )
}
