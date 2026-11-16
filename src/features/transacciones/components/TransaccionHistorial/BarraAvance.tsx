import { useId } from 'react'
import { cn } from '@/utils/cn'
import type { AvanceTransaccion } from '../../types/historial.types'
import { indiceEtapaActual } from './TransaccionHistorial.utils'

export function BarraAvance({ avance }: { avance: AvanceTransaccion }) {
  const idTitulo = useId()
  const indiceActual = indiceEtapaActual(avance)

  return (
    <section aria-labelledby={idTitulo}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3
          id={idTitulo}
          className="text-[0.6875rem] font-bold uppercase tracking-wider text-mercury-500"
        >
          Avance de la transacción
        </h3>
        <p className="text-xs text-mercury-600">
          {indiceActual >= 0 && (
            <span>{`Etapa ${indiceActual + 1} de ${avance.etapas.length} · `}</span>
          )}
          <span className="font-semibold text-mercury-800">{avance.actual}</span>
        </p>
      </div>

      <ol className="mt-2 flex gap-1">
        {avance.etapas.map((etapa, indice) => (
          <li
            key={etapa}
            aria-current={indice === indiceActual ? 'step' : undefined}
            className="flex flex-1 flex-col gap-1.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                'h-1 rounded-full',
                indiceActual >= 0 && indice <= indiceActual ? 'bg-primary-700' : 'bg-mercury-300',
              )}
            />
            <span
              className={cn(
                'sr-only text-[0.625rem] leading-tight sm:not-sr-only',
                indice === indiceActual
                  ? 'font-bold text-primary-800'
                  : indiceActual >= 0 && indice < indiceActual
                    ? 'text-mercury-600'
                    : 'text-mercury-500',
              )}
            >
              {indice === indiceActual ? `${etapa} (actual)` : etapa}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
