import { useId } from 'react'
import { InsigniaEstadoRequerimiento } from '@/features/requerimientos/components/InsigniaEstadoRequerimiento'
import type { OpcionEstadoRequerimiento } from '@/features/requerimientos/types/requerimiento.types'
import type { ConteoEstados } from '@/features/requerimientos/utils/filtrosRequerimiento'

const CLASES_TARJETA = 'rounded-xl border border-mercury-200 bg-white px-4 py-3'
const CLASES_CANTIDAD = 'mt-2 text-2xl font-semibold tabular-nums text-mercury-900'

export function PanelEstados({
  estados,
  conteo,
}: {
  estados: OpcionEstadoRequerimiento[]
  conteo: ConteoEstados
}) {
  const idTitulo = useId()

  return (
    <section aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className="sr-only">
        Cantidad de requerimientos por estado
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className={CLASES_TARJETA}>
          <dt className="text-xs font-semibold text-mercury-700">Total</dt>
          <dd className={CLASES_CANTIDAD}>{conteo.total}</dd>
        </div>
        {estados.map((estado) => (
          <div key={estado.value} className={CLASES_TARJETA}>
            <dt>
              <InsigniaEstadoRequerimiento estado={estado} />
            </dt>
            <dd className={CLASES_CANTIDAD}>{conteo.porEstado[estado.value]}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
