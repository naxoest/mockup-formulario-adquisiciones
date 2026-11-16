import { useId } from 'react'
import { Check, Clock } from 'lucide-react'
import type { SituacionActual } from '../../types/historial.types'

export function PanelSituacion({ situacion }: { situacion: SituacionActual }) {
  const idTitulo = useId()

  return (
    <section
      aria-labelledby={idTitulo}
      className="rounded-xl border border-primary-200 bg-primary-50 p-5"
    >
      <h3
        id={idTitulo}
        className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary-600"
      >
        Situación actual
      </h3>

      <p className="mt-1.5 flex items-center gap-2 text-lg font-bold text-primary-800">
        <Check aria-hidden="true" strokeWidth={3} className="size-4 shrink-0" />
        {situacion.estado}
      </p>

      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mercury-700">
        {situacion.explicacion}
      </p>

      {situacion.pendientes.length > 0 && (
        <div className="mt-4 border-t border-primary-200 pt-4">
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-mercury-600">
            Pendiente
          </p>
          <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-mercury-700">
            {situacion.pendientes.map((pendiente) => (
              <li key={pendiente.id} className="flex gap-2">
                <Clock aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-mercury-600" />
                <span>{pendiente.descripcion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
