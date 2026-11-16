import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { NumberInput } from '@/components/ui/NumberInput'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'
import { periodosPresupuestariosQueryOptions } from '../../api/listas'
import type { SolicitudDisponible, TransaccionFormState } from '../../types/transaccion.types'
import type { ConciliacionAnual, ConciliacionSolicitud } from '../../utils/conciliacion'
import { precompromisosCompletos } from '../../utils/montos'
import { BarraConciliacion } from './BarraConciliacion'
import { aporteDeOrden, resumenDeConciliacion, textoOtrasOrdenes } from './BarraConciliacion.utils'
import { mensajeDeArreglo } from './TransaccionWizard.utils'

function ConciliacionDelAnio({
  anual,
  indiceOrden,
}: {
  anual: ConciliacionAnual
  indiceOrden: number
}) {
  const resumen = resumenDeConciliacion(anual)
  const otrasOrdenes = textoOtrasOrdenes(anual, indiceOrden)

  return (
    <div className="mt-2">
      <BarraConciliacion
        precomprometido={anual.precomprometido}
        comprometido={anual.comprometido}
        estado={anual.estado}
        aporte={aporteDeOrden(anual, indiceOrden)}
      />
      <div className="mt-1.5">
        <div className="flex items-baseline justify-between gap-3 text-xs leading-relaxed">
          <span className="truncate text-mercury-500">Comprometido</span>
          <span className="shrink-0 font-semibold tabular-nums text-mercury-900">
            {resumen.comprometido}
          </span>
        </div>
        {resumen.cotizado && (
          <div className="flex items-baseline justify-between gap-3 text-xs leading-relaxed">
            <span className="truncate text-mercury-500">Cotizado</span>
            <span className="shrink-0 font-semibold tabular-nums text-mercury-900">
              {resumen.cotizado}
            </span>
          </div>
        )}
        <div
          className={cn(
            'mt-1 flex items-baseline justify-between gap-3 border-t border-mercury-200 pt-1 text-xs leading-relaxed',
            resumen.clase,
          )}
        >
          <span className="truncate font-semibold">{resumen.etiqueta}</span>
          <span className="shrink-0 font-bold tabular-nums">{resumen.valor}</span>
        </div>
      </div>
      {otrasOrdenes && <p className="mt-1 text-xs tabular-nums text-mercury-400">{otrasOrdenes}</p>}
    </div>
  )
}

export function MontosAnualesOrdenDeCompra({
  indiceOrden,
  posicion,
  solicitud,
  conciliacion,
}: {
  indiceOrden: number
  posicion: number
  solicitud: SolicitudDisponible | undefined
  conciliacion: ConciliacionSolicitud | undefined
}) {
  const { control, getFieldState } = useFormContext<TransaccionFormState>()

  const nombreArreglo = `ordenesDeCompra.${indiceOrden}.solicitantes.${posicion}.montos` as const

  const { fields, append, remove } = useFieldArray({ control, name: nombreArreglo })

  const filas = useWatch({ control, name: nombreArreglo })

  const formState = useFormState({ control })
  const errorArreglo = mensajeDeArreglo(getFieldState(nombreArreglo, formState).error)

  const periodosQuery = useQuery(periodosPresupuestariosQueryOptions)
  const periodos = periodosQuery.data ?? []

  const precomprometidoPorAnio = new Map(
    precompromisosCompletos(solicitud?.precompromisos).map((precompromiso) => [
      precompromiso.anio,
      precompromiso.monto,
    ]),
  )

  const conciliacionPorAnio = new Map(
    (conciliacion?.anios ?? []).map((anual) => [anual.anio, anual]),
  )

  const sinSolicitud = solicitud === undefined
  const sinCupo = sinSolicitud || periodosQuery.isPending || fields.length >= periodos.length

  const opcionesPara = (fila: number): ComboboxOption[] => {
    const ocupados = new Set(
      (filas ?? [])
        .filter(
          (otra, indice) => indice !== fila && typeof otra?.anio === 'string' && otra.anio !== '',
        )
        .map((otra) => otra.anio),
    )

    const opciones: ComboboxOption[] = periodos.map((periodo) => {
      const valor = String(periodo.anio)
      const precomprometido = precomprometidoPorAnio.get(valor)

      return {
        value: valor,
        label: periodo.label,
        description:
          precomprometido === undefined
            ? 'Sin precompromiso'
            : `Precomprometido ${formatCLP(precomprometido)}`,
        disabled: ocupados.has(valor),
      }
    })

    const actual = filas?.[fila]?.anio

    if (
      typeof actual === 'string' &&
      actual !== '' &&
      !opciones.some((opcion) => opcion.value === actual)
    ) {
      opciones.push({ value: actual, label: actual })
    }

    return opciones
  }

  return (
    <div className="space-y-2 border-l-2 border-mercury-200 pl-3">
      {fields.length > 0 && (
        <div className="hidden items-end gap-3 sm:flex">
          <span className="w-44 shrink-0 text-xs uppercase tracking-wide text-mercury-500">
            Año <span className="text-scarlet-600">*</span>
          </span>
          <span className="min-w-0 flex-1 text-xs uppercase tracking-wide text-mercury-500">
            Monto de la orden <span className="text-scarlet-600">*</span>
          </span>
          <span className="w-10 shrink-0" aria-hidden="true" />
        </div>
      )}

      {fields.map((campo, fila) => {
        const anio = filas?.[fila]?.anio ?? null
        const anual = anio ? conciliacionPorAnio.get(anio) : undefined

        return (
          <div
            key={campo.id}
            className="flex items-start gap-3 border-t border-mercury-100 pt-2 first:border-t-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
              <div className="w-full sm:w-44 sm:shrink-0">
                <Field<TransaccionFormState>
                  name={`ordenesDeCompra.${indiceOrden}.solicitantes.${posicion}.montos.${fila}.anio`}
                  label="Año"
                  labelClassName="sm:sr-only"
                  required
                >
                  <Combobox
                    options={opcionesPara(fila)}
                    loading={periodosQuery.isPending}
                    placeholder="Seleccione un año"
                    disabled={sinSolicitud}
                  />
                </Field>
              </div>
              <div className="min-w-0 sm:flex-1">
                <Field<TransaccionFormState>
                  name={`ordenesDeCompra.${indiceOrden}.solicitantes.${posicion}.montos.${fila}.monto`}
                  label="Monto de la orden"
                  labelClassName="sm:sr-only"
                  required
                >
                  <NumberInput
                    min={0}
                    decimals={0}
                    prefix="$"
                    showStepper={false}
                    disabled={!anio}
                  />
                </Field>
                {anual && <ConciliacionDelAnio anual={anual} indiceOrden={indiceOrden} />}
              </div>
            </div>

            <button
              type="button"
              aria-label={`Quitar el año de la fila ${fila + 1}`}
              onClick={() => remove(fila)}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-mercury-400 transition-colors hover:bg-scarlet-50 hover:text-scarlet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-scarlet-500 sm:mt-1.5"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        )
      })}

      {errorArreglo && (
        <p role="alert" className="text-xs text-scarlet-600">
          {errorArreglo}
        </p>
      )}

      {periodosQuery.isError && (
        <p role="alert" className="text-xs text-scarlet-600">
          No se pudo cargar el catálogo de años presupuestarios.
        </p>
      )}

      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ anio: null, monto: null })}
          disabled={sinCupo}
        >
          <Plus aria-hidden="true" className="size-4" />
          Agregar año
        </Button>
      </div>
    </div>
  )
}
