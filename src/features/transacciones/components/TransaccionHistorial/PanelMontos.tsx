import { useId } from 'react'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'
import type { MontoComparado, MontosComparados } from '../../types/historial.types'
import { proporcionDeMonto } from './TransaccionHistorial.utils'

function Columna({
  etiqueta,
  monto,
  base,
  clasesBarra,
}: {
  etiqueta: string
  monto: MontoComparado
  base: number | null
  clasesBarra?: string
}) {
  const proporcion = base === null ? null : proporcionDeMonto(monto.valor, base)

  return (
    <div>
      <dt className="text-[0.6875rem] font-bold uppercase tracking-wider text-mercury-500">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-xl font-bold tabular-nums text-mercury-900">
        {formatCLP(monto.valor)}
      </dd>
      <p className="mt-1 text-xs leading-relaxed text-mercury-600">{monto.nota}</p>

      {proporcion === null ? (
        <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-mercury-300" />
      ) : (
        <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-mercury-200">
          <div
            className={cn(
              'h-full rounded-full',
              proporcion.excede ? 'bg-scarlet-600' : clasesBarra,
            )}
            style={{ width: `${proporcion.ancho.toFixed(1)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function PanelMontos({ montos }: { montos: MontosComparados }) {
  const idTitulo = useId()

  return (
    <section
      aria-labelledby={idTitulo}
      className="rounded-xl border border-mercury-200 bg-white p-5"
    >
      <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
        Comparación de montos
      </h3>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mercury-600">
        Se muestra la comparación entre el monto precomprometido, comprometido y facurado.
      </p>

      <dl className="mt-5 grid gap-5 sm:grid-cols-3">
        <Columna etiqueta="Cotizado vigente" monto={montos.cotizadoVigente} base={null} />
        <Columna
          etiqueta="Comprometido en órdenes"
          monto={montos.comprometido}
          base={montos.cotizadoVigente.valor}
          clasesBarra="bg-abyss-700"
        />
        <Columna
          etiqueta="Facturado"
          monto={montos.facturado}
          base={montos.comprometido.valor}
          clasesBarra="bg-jade-700"
        />
      </dl>
    </section>
  )
}
