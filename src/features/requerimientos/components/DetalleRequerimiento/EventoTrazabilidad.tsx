import { User } from 'lucide-react'
import { Instante, SinDato } from '@/features/requerimientos/components/Valores'
import type {
  CambioRequerimiento,
  EventoRequerimiento,
  OrigenEvento,
  TipoEventoRequerimiento,
} from '@/features/requerimientos/types/evento.types'
import {
  ETIQUETAS_CAMPO,
  textoValorCambio,
  type LadoCambio,
} from '@/features/requerimientos/utils/trazabilidad'
import { cn } from '@/utils/cn'

const presentacionEvento: Record<
  TipoEventoRequerimiento,
  { titulo: string; tituloCambios: string; clasesMarcador: string }
> = {
  creacion: {
    titulo: 'Requerimiento creado',
    tituloCambios: 'Valores iniciales',
    clasesMarcador: 'bg-jade-500 ring-jade-200',
  },
  actualizacion: {
    titulo: 'Requerimiento actualizado',
    tituloCambios: 'Cambios',
    clasesMarcador: 'bg-primary-500 ring-primary-200',
  },
  restauracion: {
    titulo: 'Requerimiento restaurado',
    tituloCambios: 'Cambios',
    clasesMarcador: 'bg-saffron-700 ring-saffron-300',
  },
  eliminacion: {
    titulo: 'Requerimiento eliminado',
    tituloCambios: 'Cambios',
    clasesMarcador: 'bg-scarlet-600 ring-scarlet-200',
  },
}

function textoOrigen({ importacionId, fila, nombreArchivo }: OrigenEvento): string {
  if (fila === null) {
    return `Origen: importación #${importacionId}, archivo ${nombreArchivo}. El ítem no figuraba en el archivo.`
  }

  return `Origen: importación #${importacionId}, fila ${fila}, archivo ${nombreArchivo}`
}

function ValorCambio({ cambio, lado }: { cambio: CambioRequerimiento; lado: LadoCambio }) {
  const texto = textoValorCambio(cambio, lado)

  if (texto === null) {
    return <SinDato />
  }

  return <span className="break-words">{texto}</span>
}

export function EventoTrazabilidad({ evento }: { evento: EventoRequerimiento }) {
  const presentacion = presentacionEvento[evento.tipo]

  return (
    <li className="relative pl-6">
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-white ring-1',
          presentacion.clasesMarcador,
        )}
      />

      <p className="text-sm font-semibold text-mercury-900">{presentacion.titulo}</p>

      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-mercury-600">
        <Instante valor={evento.fecha} />
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <User aria-hidden="true" className="size-3.5" />
          {evento.autor}
        </span>
      </p>

      <p className="mt-1 text-xs text-mercury-600">{textoOrigen(evento.origen)}</p>

      {evento.cambios.length > 0 && (
        <div className="mt-2 rounded-lg bg-mercury-50 p-3 text-xs text-mercury-700">
          <p className="mb-1 font-semibold text-mercury-800">{presentacion.tituloCambios}</p>
          <ul className="flex flex-col gap-1">
            {evento.cambios.map((cambio) => (
              <li key={cambio.campo}>
                <span className="font-semibold">{ETIQUETAS_CAMPO[cambio.campo]}:</span>{' '}
                {evento.tipo === 'creacion' ? (
                  <ValorCambio cambio={cambio} lado="nuevo" />
                ) : (
                  <>
                    <ValorCambio cambio={cambio} lado="anterior" />
                    <span aria-hidden="true"> → </span>
                    <span className="sr-only"> cambió a </span>
                    <span className="font-semibold text-mercury-900">
                      <ValorCambio cambio={cambio} lado="nuevo" />
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}
