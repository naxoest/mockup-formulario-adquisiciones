import { useId, useState } from 'react'
import type { EventoHistorial } from '../../types/historial.types'
import { FilaEvento } from './FilaEvento'
import { FilaHito } from './FilaHito'
import { FilaPaso } from './FilaPaso'
import { FilaRegistro } from './FilaRegistro'
import { FiltroEntidades } from './FiltroEntidades'
import {
  codigosSeleccionados,
  contarEventos,
  filtrarEventos,
  gruposDeFiltro,
  idHitoActual,
  resumenDeFiltro,
} from './TransaccionHistorial.utils'

export function LineaDeTiempo({ eventos }: { eventos: EventoHistorial[] }) {
  const idTitulo = useId()
  const [seleccion, setSeleccion] = useState<ReadonlySet<string>>(() => new Set<string>())

  const grupos = gruposDeFiltro(eventos)
  const visibles = filtrarEventos(eventos, seleccion)
  const hitoActual = idHitoActual(eventos)
  const codigos = codigosSeleccionados(grupos, seleccion)
  const eventosPropios = contarEventos(visibles)
  const sinResultados = seleccion.size > 0 && eventosPropios === 0

  const alternar = (clave: string) => {
    setSeleccion((previa) => {
      const siguiente = new Set(previa)
      if (siguiente.has(clave)) {
        siguiente.delete(clave)
      } else {
        siguiente.add(clave)
      }
      return siguiente
    })
  }

  const limpiar = () => {
    setSeleccion(new Set<string>())
  }

  return (
    <section aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
        Línea de tiempo
      </h3>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mercury-600">
        Se presenta una línea de tiempo con los eventos asociados a la transacción. Puede
        seleccionar solicitudes, órdenes de compra y facturas para ver solo sus eventos.
      </p>

      <FiltroEntidades
        grupos={grupos}
        seleccion={seleccion}
        onAlternar={alternar}
        onLimpiar={limpiar}
      />

      <p role="status" aria-live="polite" className="mt-3 text-xs text-mercury-600">
        {resumenDeFiltro(contarEventos(eventos), eventosPropios, codigos)}
      </p>

      <div className="mt-3 overflow-hidden rounded-xl border border-mercury-200 bg-white">
        <ol>
          {visibles.map((evento, indice) => {
            const esUltimo = !sinResultados && indice === visibles.length - 1

            if (evento.clase === 'hito') {
              return (
                <FilaHito
                  key={evento.id}
                  hito={evento}
                  esActual={evento.id === hitoActual}
                  esUltimo={esUltimo}
                />
              )
            }

            if (evento.clase === 'registro') {
              return <FilaRegistro key={evento.id} registro={evento} esUltimo={esUltimo} />
            }

            if (evento.clase === 'paso') {
              return <FilaPaso key={evento.id} paso={evento} esUltimo={esUltimo} />
            }

            return <FilaEvento key={evento.id} evento={evento} esUltimo={esUltimo} />
          })}
        </ol>

        {sinResultados && (
          <p className="border-t border-mercury-100 px-5 py-8 text-center text-sm text-mercury-600">
            No hay eventos registrados para lo que seleccionó.
          </p>
        )}
      </div>
    </section>
  )
}
