import { useId, useState } from 'react'
import { CircleAlert, Info } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { SinDato } from '@/features/requerimientos/components/Valores'
import { InsigniaEstadoImportacion } from '@/features/requerimientos/components/TablaImportaciones'
import type { CambioRequerimiento } from '@/features/requerimientos/types/evento.types'
import type {
  FilaRevision,
  ResultadoFila,
  RevisionImportacion,
} from '@/features/requerimientos/types/importacion.types'
import { formatearSolicitante } from '@/features/requerimientos/utils/formato'
import {
  ETIQUETA_IDENTIFICADOR,
  ETIQUETAS_CAMPO,
  textoValorCambio,
  type LadoCambio,
} from '@/features/requerimientos/utils/trazabilidad'
import { cn } from '@/utils/cn'

type FiltroRevision = ResultadoFila | 'todas'

const presentacionResultado: Record<
  ResultadoFila,
  { etiqueta: string; variant: BadgeProps['variant'] }
> = {
  nueva: { etiqueta: 'Nueva', variant: 'success' },
  restaurada: { etiqueta: 'Restaurada', variant: 'warning' },
  con_cambios: { etiqueta: 'Con cambios', variant: 'info' },
  sin_cambios: { etiqueta: 'Sin cambios', variant: 'neutral' },
  error: { etiqueta: 'Con errores', variant: 'error' },
}

interface PasoRevisionProps {
  revision: RevisionImportacion
  avisosLectura: string[]
}

function ValorCambio({ cambio, lado }: { cambio: CambioRequerimiento; lado: LadoCambio }) {
  const texto = textoValorCambio(cambio, lado)
  return texto === null ? <SinDato /> : <span className="break-words">{texto}</span>
}

function DetalleFila({ fila }: { fila: FilaRevision }) {
  if (fila.resultado === 'error') {
    return (
      <ul className="flex flex-col gap-0.5 text-scarlet-700">
        {fila.errores.map((error, indice) => (
          <li key={indice}>{error}</li>
        ))}
      </ul>
    )
  }

  if (fila.resultado === 'sin_cambios') {
    return <span className="text-mercury-500">Sin cambios</span>
  }

  if (fila.resultado === 'restaurada' && fila.cambios.length === 0) {
    return <span className="text-mercury-500">Se restaura sin cambios</span>
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {fila.cambios.map((cambio) => (
        <li key={cambio.campo}>
          <span className="font-medium">{ETIQUETAS_CAMPO[cambio.campo]}:</span>{' '}
          {fila.resultado === 'nueva' ? (
            <ValorCambio cambio={cambio} lado="nuevo" />
          ) : (
            <>
              <ValorCambio cambio={cambio} lado="anterior" />
              <span aria-hidden="true"> → </span>
              <span className="sr-only"> cambia a </span>
              <span className="font-semibold text-mercury-900">
                <ValorCambio cambio={cambio} lado="nuevo" />
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

function TarjetaResumen({
  nombre,
  valor,
  descripcion,
  clases,
}: {
  nombre: string
  valor: number
  descripcion: string
  clases: string
}) {
  return (
    <div className={cn('rounded-xl border px-4 py-3', clases)}>
      <p className="text-xs font-medium">{nombre}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
      <p className="mt-1 text-[11px] leading-snug opacity-80">{descripcion}</p>
    </div>
  )
}

export function PasoRevision({ revision, avisosLectura }: PasoRevisionProps) {
  const idEliminaciones = useId()
  const [filtro, setFiltro] = useState<FiltroRevision>(
    revision.filasConErrores > 0 ? 'error' : 'todas',
  )

  const avisos = [...avisosLectura, ...revision.avisos]
  const filas = revision.filas.filter((fila) => filtro === 'todas' || fila.resultado === filtro)

  const opcionesFiltro: { valor: FiltroRevision; nombre: string; cantidad: number }[] = [
    { valor: 'todas', nombre: 'Todas', cantidad: revision.filas.length },
    { valor: 'nueva', nombre: 'Nuevas', cantidad: revision.filasNuevas },
    { valor: 'restaurada', nombre: 'Restauradas', cantidad: revision.filasRestauradas },
    { valor: 'con_cambios', nombre: 'Con cambios', cantidad: revision.filasConCambios },
    { valor: 'sin_cambios', nombre: 'Sin cambios', cantidad: revision.filasSinCambios },
    { valor: 'error', nombre: 'Con errores', cantidad: revision.filasConErrores },
  ]

  return (
    <div className="flex flex-col gap-5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mercury-600">
        <span>
          Importación <span className="font-semibold text-mercury-900">#{revision.id}</span>
        </span>
        <InsigniaEstadoImportacion estado={revision.estado} />
        <span aria-hidden="true">·</span>
        <span>
          Archivo <span className="font-medium text-mercury-900">{revision.nombreArchivo}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>{formatearSolicitante(revision.solicitante)}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <TarjetaResumen
          nombre="Nuevas"
          valor={revision.filasNuevas}
          descripcion="Se registrarán como requerimientos nuevos."
          clases="border-jade-200 bg-jade-50 text-jade-800"
        />
        <TarjetaResumen
          nombre="Restauradas"
          valor={revision.filasRestauradas}
          descripcion="Requerimientos eliminados que vuelven a figurar en el archivo."
          clases="border-saffron-300 bg-saffron-50 text-saffron-800"
        />
        <TarjetaResumen
          nombre="Con cambios"
          valor={revision.filasConCambios}
          descripcion="Se actualizarán y quedará registro de cada cambio."
          clases="border-primary-200 bg-primary-50 text-primary-800"
        />
        <TarjetaResumen
          nombre="Sin cambios"
          valor={revision.filasSinCambios}
          descripcion="No se modificarán ni generarán eventos."
          clases="border-mercury-200 bg-mercury-50 text-mercury-700"
        />
        <TarjetaResumen
          nombre="Con errores"
          valor={revision.filasConErrores}
          descripcion="Impiden confirmar la importación."
          clases="border-scarlet-200 bg-scarlet-50 text-scarlet-800"
        />
        <TarjetaResumen
          nombre="Se eliminarán"
          valor={revision.requerimientosEliminados}
          descripcion="Vigentes cuyo ítem no figura en el archivo. Conservarán sus eventos."
          clases="border-scarlet-200 bg-white text-scarlet-800"
        />
      </div>

      {revision.filasConErrores > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-scarlet-200 bg-scarlet-50 p-4 text-sm text-scarlet-800"
        >
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-[18px] shrink-0 text-scarlet-600"
          />
          <p>
            La importación no puede confirmarse mientras existan filas con errores. Corrija la
            planilla y cárguela nuevamente.
          </p>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-saffron-300 bg-saffron-50 p-4 text-sm text-saffron-800">
          <Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-saffron-700" />
          <div>
            <p className="mb-1 font-semibold">Avisos</p>
            <ul className="list-inside list-disc space-y-1">
              {avisos.map((aviso, indice) => (
                <li key={indice}>{aviso}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {revision.eliminaciones.length > 0 && (
        <section aria-labelledby={idEliminaciones} className="flex flex-col gap-2">
          <h3 id={idEliminaciones} className="text-sm font-semibold text-mercury-900">
            Requerimientos que se eliminarán
          </h3>
          <p className="text-xs text-mercury-600">
            Están vigentes, pero su ítem no figura en el archivo. Al confirmar quedarán eliminados y
            conservarán sus eventos.
          </p>
          <div className="max-h-64 overflow-auto rounded-xl border border-mercury-200">
            <table className="min-w-full divide-y divide-mercury-200 text-sm">
              <caption className="sr-only">Requerimientos que se eliminarán al confirmar</caption>
              <thead className="bg-mercury-50 text-left text-xs font-semibold uppercase tracking-wide text-mercury-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    {ETIQUETA_IDENTIFICADOR}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Materiales
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mercury-100">
                {revision.eliminaciones.map((eliminacion) => (
                  <tr key={eliminacion.requerimientoId}>
                    <td translate="no" className="px-4 py-3 font-mono text-xs text-mercury-600">
                      {eliminacion.identificador}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mercury-600">
                      {eliminacion.requerimientoId}
                    </td>
                    <td className="px-4 py-3 font-medium text-mercury-900">
                      {eliminacion.materiales}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar filas por resultado">
        {opcionesFiltro.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={filtro === opcion.valor}
            onClick={() => setFiltro(opcion.valor)}
            className="rounded-full border border-mercury-300 bg-white px-3 py-1 text-xs font-medium text-mercury-700 hover:bg-mercury-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 aria-pressed:border-primary-600 aria-pressed:bg-primary-600 aria-pressed:text-white"
          >
            {`${opcion.nombre} (${opcion.cantidad})`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-mercury-200">
        <table className="min-w-full divide-y divide-mercury-200 text-sm">
          <caption className="sr-only">Resultado de la revisión por fila del archivo</caption>
          <thead className="bg-mercury-50 text-left text-xs font-semibold uppercase tracking-wide text-mercury-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Fila
              </th>
              <th scope="col" className="px-4 py-3">
                {ETIQUETA_IDENTIFICADOR}
              </th>
              <th scope="col" className="px-4 py-3">
                ID
              </th>
              <th scope="col" className="px-4 py-3">
                Resultado
              </th>
              <th scope="col" className="px-4 py-3">
                Materiales
              </th>
              <th scope="col" className="px-4 py-3">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mercury-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-mercury-500">
                  No hay filas con este resultado.
                </td>
              </tr>
            ) : (
              filas.map((fila) => {
                const presentacion = presentacionResultado[fila.resultado]

                return (
                  <tr key={fila.fila} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-mercury-600">{fila.fila}</td>
                    <td translate="no" className="px-4 py-3 font-mono text-xs text-mercury-600">
                      {fila.identificador}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mercury-600">
                      {fila.requerimientoId ?? <SinDato />}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={presentacion.variant} size="sm">
                        {presentacion.etiqueta}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-mercury-900">
                      {fila.materiales ?? <SinDato />}
                    </td>
                    <td className="px-4 py-3 text-xs text-mercury-700">
                      <DetalleFila fila={fila} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
