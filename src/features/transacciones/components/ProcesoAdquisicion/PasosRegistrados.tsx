import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import type { PasoRegistrado } from '@/features/transacciones/types/transaccion.types'
import { formatShortDate, fromCivilDate } from '@/utils/date'

interface PasosRegistradosProps {
  registrados: PasoRegistrado[]
  onDeshacer?: () => void
}

export function PasosRegistrados({ registrados, onDeshacer }: PasosRegistradosProps) {
  const idTitulo = useId()

  if (registrados.length === 0) {
    return null
  }

  return (
    <section aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="text-sm font-semibold text-mercury-900">
        Pasos registrados
      </h3>
      <ol className="mt-2 divide-y divide-mercury-100 rounded-xl border border-mercury-200">
        {registrados.map((registrado, posicion) => (
          <li key={registrado.paso} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium text-mercury-900">{registrado.etiqueta}</span>
                <span className="text-xs text-mercury-600">
                  Fecha del hecho: {formatShortDate(fromCivilDate(registrado.fecha))}
                </span>
              </div>
              {registrado.observacion !== null && (
                <p className="mt-1 text-xs leading-relaxed text-mercury-600">
                  {registrado.observacion}
                </p>
              )}
              <p className="mt-1 text-xs text-mercury-500">Registrado por {registrado.autor}</p>
            </div>
            {onDeshacer !== undefined && posicion === registrados.length - 1 && (
              <Button type="button" variant="ghost" onClick={onDeshacer}>
                Deshacer
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
