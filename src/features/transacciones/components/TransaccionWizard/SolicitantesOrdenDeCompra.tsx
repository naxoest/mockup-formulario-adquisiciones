import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'
import type { SolicitudDisponible, TransaccionFormState } from '../../types/transaccion.types'
import type { ConciliacionTransaccion } from '../../utils/conciliacion'
import { calcularMontoOrdenDeCompra, sumarPrecompromisos } from '../../utils/montos'
import { MontosAnualesOrdenDeCompra } from './MontosAnualesOrdenDeCompra'
import { etiquetaSolicitud, mensajeDeArreglo, presentacionPorTipo } from './TransaccionWizard.utils'

function descripcionDe(solicitud: SolicitudDisponible): string {
  const montoCotizacion = sumarPrecompromisos(solicitud.precompromisos)

  return [
    solicitud.sedes || null,
    solicitud.etiquetaTipoSolicitud || null,
    solicitud.cr ? `CR ${solicitud.cr}` : null,
    solicitud.id != null ? `ID ${solicitud.id}` : 'Sin guardar',
    montoCotizacion !== null ? `Cotización ${formatCLP(montoCotizacion)}` : null,
  ]
    .filter((detalle): detalle is string => detalle !== null)
    .join(' · ')
}

export function SolicitantesOrdenDeCompra({
  index,
  solicitudes,
  conciliacion,
}: {
  index: number
  solicitudes: SolicitudDisponible[]
  conciliacion: ConciliacionTransaccion
}) {
  const { control, getFieldState } = useFormContext<TransaccionFormState>()

  const nombreArreglo = `ordenesDeCompra.${index}.solicitantes` as const

  const { fields, append, remove } = useFieldArray({
    control,
    name: nombreArreglo,
  })

  const formState = useFormState({ control })
  const errorArreglo = mensajeDeArreglo(getFieldState(nombreArreglo, formState).error)

  const lineas = useWatch({ control, name: nombreArreglo })
  const total = calcularMontoOrdenDeCompra(lineas)

  const porClave = new Map(solicitudes.map((solicitud) => [solicitud.claveFormulario, solicitud]))

  const conciliacionPorClave = new Map(
    conciliacion.porSolicitud.map((fila) => [fila.claveFormulario, fila]),
  )

  const sinCupo = fields.length >= solicitudes.length

  const opcionesPara = (posicion: number): ComboboxOption[] =>
    solicitudes.map((solicitud) => ({
      value: solicitud.claveFormulario,
      label: etiquetaSolicitud(solicitud),
      description: descripcionDe(solicitud),
      disabled: (lineas ?? []).some(
        (linea, otra) => otra !== posicion && linea?.claveFormulario === solicitud.claveFormulario,
      ),
    }))

  const handleAgregar = () => {
    append({ claveFormulario: '', montos: [{ anio: null, monto: null }] })
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mercury-300 px-4 py-6 text-center text-sm text-mercury-500">
          Aún no ha agregado solicitudes a esta orden.
        </p>
      ) : (
        <div>
          <span className="inline-flex items-center gap-1 block text-sm font-medium text-mercury-700">
            Lista de solicitudes pertenecientes a la orden de compra
          </span>
          <p className="text-xs text-mercury-500 pt-1.5">
            Ingrese cada una de las solicitudes pertenecientes a esta orden de compra y reparta su
            monto por año presupuestario. Puede seleccionar entre las solicitudes ingresadas en el
            paso 1. Nota: en caso de ser necesario, se puede ingresar una solicitud en diferentes
            ordenes de compra.
          </p>
          <div className="hidden items-end gap-3 pb-1 sm:flex">
            <span className="size-8 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-xs uppercase tracking-wide text-mercury-500">
              Solicitud <span className="text-scarlet-600">*</span>
            </span>
            <span className="w-10 shrink-0" aria-hidden="true" />
          </div>
          {fields.map((linea, posicion) => {
            const clave = lineas?.[posicion]?.claveFormulario ?? ''
            const solicitud = clave ? porClave.get(clave) : undefined
            const presentacion = solicitud ? presentacionPorTipo[solicitud.tipo] : undefined
            const IconoTipo = presentacion?.icono

            return (
              <div
                key={linea.id}
                className="flex items-start gap-3 border-t border-mercury-200 py-3"
              >
                <span className="flex h-10 shrink-0 items-center sm:mt-1.5">
                  {presentacion && IconoTipo ? (
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        presentacion.clases,
                      )}
                    >
                      <IconoTipo aria-hidden="true" className="size-4" />
                    </span>
                  ) : (
                    <span className="size-8" aria-hidden="true" />
                  )}
                </span>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <Field<TransaccionFormState>
                      name={`ordenesDeCompra.${index}.solicitantes.${posicion}.claveFormulario`}
                      label="Solicitud"
                      labelClassName="sm:sr-only"
                      required
                    >
                      <Combobox
                        options={opcionesPara(posicion)}
                        placeholder="Seleccione una solicitud"
                      />
                    </Field>
                    {solicitud && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mercury-500">
                        {solicitud.etiquetaTipoSolicitud && (
                          <Badge
                            variant={solicitud.tipoSolicitud === 'SASERVI' ? 'info' : 'neutral'}
                            size="sm"
                          >
                            {solicitud.etiquetaTipoSolicitud}
                          </Badge>
                        )}
                        {solicitud.sedes && (
                          <span className="flex min-w-0 items-center gap-1">
                            <MapPin
                              aria-hidden="true"
                              className="size-3.5 shrink-0 text-mercury-400"
                            />
                            <span className="truncate">{solicitud.sedes}</span>
                          </span>
                        )}
                        {!!solicitud.cr && <span className="tabular-nums">CR {solicitud.cr}</span>}
                        <span
                          className={cn(
                            'font-mono tabular-nums',
                            solicitud.id == null && 'font-sans text-mercury-400',
                          )}
                        >
                          {solicitud.id != null ? `ID ${solicitud.id}` : 'Sin guardar'}
                        </span>
                      </div>
                    )}
                  </div>

                  <MontosAnualesOrdenDeCompra
                    indiceOrden={index}
                    posicion={posicion}
                    solicitud={solicitud}
                    conciliacion={clave ? conciliacionPorClave.get(clave) : undefined}
                  />
                </div>

                <button
                  type="button"
                  aria-label={`Quitar la solicitud de la fila ${posicion + 1}`}
                  onClick={() => remove(posicion)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-mercury-400 transition-colors hover:bg-scarlet-50 hover:text-scarlet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-scarlet-500 sm:mt-1.5"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {errorArreglo && (
        <p role="alert" className="text-xs text-scarlet-600">
          {errorArreglo}
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-mercury-200 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <Button type="button" variant="secondary" onClick={handleAgregar} disabled={sinCupo}>
            <Plus aria-hidden="true" className="size-4" />
            Agregar solicitud
          </Button>
        </div>
        <span className="flex flex-col items-start gap-0.5 sm:items-end">
          <span className="text-xs uppercase tracking-wide text-mercury-400">
            Total de la orden
          </span>
          <span
            className={cn(
              'text-xl font-semibold tabular-nums',
              total > 0 ? 'text-mercury-900' : 'text-mercury-400',
            )}
          >
            {formatCLP(total)}
          </span>
        </span>
      </div>
    </div>
  )
}
