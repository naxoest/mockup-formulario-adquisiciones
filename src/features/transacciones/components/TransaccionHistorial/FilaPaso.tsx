import { ListChecks, Undo2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatShortDate, fromCivilDate } from '@/utils/date'
import type { PasoHistorial } from '../../types/historial.types'
import { formatearFechaEvento } from './TransaccionHistorial.utils'

export function FilaPaso({ paso, esUltimo }: { paso: PasoHistorial; esUltimo: boolean }) {
  const deshecho = paso.accion === 'deshecho'

  return (
    <li className={cn('relative px-5 py-4', !esUltimo && 'border-b border-mercury-100')}>
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
            'absolute left-0 top-1 flex size-6 -translate-x-[0.4375rem] items-center justify-center rounded-full border ring-4 ring-white',
            deshecho
              ? 'border-mercury-300 bg-white text-mercury-500'
              : 'border-primary-200 bg-primary-50 text-primary-700',
          )}
        >
          {deshecho ? (
            <Undo2 aria-hidden="true" strokeWidth={2} className="size-3" />
          ) : (
            <ListChecks aria-hidden="true" strokeWidth={2} className="size-3" />
          )}
        </span>

        <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-mercury-500">
          Proceso de adquisición
        </p>

        <h4 className="mt-0.5 text-[0.9375rem] font-bold text-mercury-900">{paso.titulo}</h4>

        {paso.accion === 'registrado' && (
          <p className="mt-1 text-xs text-mercury-600">
            Fecha del hecho: {formatShortDate(fromCivilDate(paso.fechaHecho))}
          </p>
        )}

        {paso.observacion !== null && (
          <p className="mt-1 text-xs leading-relaxed text-mercury-600">{paso.observacion}</p>
        )}

        <p className="mt-1 text-xs text-mercury-500">
          {formatearFechaEvento(paso.fecha)} · {paso.autor}
        </p>
      </div>
    </li>
  )
}
