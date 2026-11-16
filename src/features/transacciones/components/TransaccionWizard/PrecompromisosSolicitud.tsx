import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { NumberInput } from '@/components/ui/NumberInput'
import { periodosPresupuestariosQueryOptions } from '../../api/listas'
import type { TransaccionFormState } from '../../types/transaccion.types'

export function PrecompromisosSolicitud({ index }: { index: number }) {
  const { control } = useFormContext<TransaccionFormState>()

  const nombreArreglo = `solicitantes.${index}.precompromisos` as const

  const { fields, append, remove } = useFieldArray({ control, name: nombreArreglo })

  const filas = useWatch({ control, name: nombreArreglo })

  const periodosQuery = useQuery(periodosPresupuestariosQueryOptions)
  const periodos = periodosQuery.data ?? []

  const sinCupo = periodosQuery.isPending || fields.length >= periodos.length

  const opcionesPara = (posicion: number): ComboboxOption[] => {
    const ocupados = new Set(
      (filas ?? [])
        .filter(
          (fila, otra) => otra !== posicion && typeof fila?.anio === 'string' && fila.anio !== '',
        )
        .map((fila) => fila.anio),
    )

    const opciones: ComboboxOption[] = periodos.map((periodo) => {
      const valor = String(periodo.anio)
      return { value: valor, label: periodo.label, disabled: ocupados.has(valor) }
    })

    const actual = filas?.[posicion]?.anio

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
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mercury-300 px-4 py-6 text-center text-sm text-mercury-500">
          Esta solicitud aún no tiene montos registrados.
        </p>
      ) : (
        <div>
          <div className="hidden items-end gap-3 pb-1 sm:flex">
            <span className="w-44 shrink-0 text-xs uppercase tracking-wide text-mercury-500">
              Año <span className="text-scarlet-600">*</span>
            </span>
            <span className="min-w-0 flex-1 text-xs uppercase tracking-wide text-mercury-500">
              Monto <span className="text-scarlet-600">*</span>
            </span>
            <span className="w-10 shrink-0" aria-hidden="true" />
          </div>
          {fields.map((fila, posicion) => (
            <div key={fila.id} className="flex items-start gap-3 border-t border-mercury-200 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                <div className="w-full sm:w-44 sm:shrink-0">
                  <Field<TransaccionFormState>
                    name={`solicitantes.${index}.precompromisos.${posicion}.anio`}
                    label="Año"
                    labelClassName="sm:sr-only"
                    required
                  >
                    <Combobox
                      options={opcionesPara(posicion)}
                      loading={periodosQuery.isPending}
                      placeholder="Seleccione un año"
                    />
                  </Field>
                </div>
                <div className="min-w-0 sm:flex-1">
                  <Field<TransaccionFormState>
                    name={`solicitantes.${index}.precompromisos.${posicion}.monto`}
                    label="Monto"
                    labelClassName="sm:sr-only"
                    required
                  >
                    <NumberInput min={0} step={100} decimals={0} prefix="$" />
                  </Field>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Quitar el año de la fila ${posicion + 1}`}
                onClick={() => remove(posicion)}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-mercury-400 transition-colors hover:bg-scarlet-50 hover:text-scarlet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-scarlet-500 sm:mt-1.5"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </div>
          ))}
        </div>
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
