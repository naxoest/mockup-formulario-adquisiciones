import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { NumberInput } from '@/components/ui/NumberInput'
import { formatCLP } from '@/utils/currency'
import { cn } from '@/utils/cn'
import type { TransaccionFormState } from '../../types/transaccion.types'
import { facturadoSinGuardar, type MontoDeOrden } from './TransaccionWizard.sincronizacion'

export function LineasFactura({
  index,
  facturables,
}: {
  index: number
  facturables: MontoDeOrden[]
}) {
  const { control } = useFormContext<TransaccionFormState>()
  const nombreArreglo = `facturas.${index}.montos` as const

  const { fields, append, remove } = useFieldArray({ control, name: nombreArreglo })
  const lineas = useWatch({ control, name: nombreArreglo })
  const facturas = useWatch({ control, name: 'facturas' })

  const total = (lineas ?? []).reduce((suma, linea) => suma + (linea?.monto ?? 0), 0)
  const sinCupo = fields.length >= facturables.length

  const opcionesPara = (posicion: number): ComboboxOption[] =>
    facturables.map((facturable) => ({
      value: String(facturable.id),
      label: `${facturable.codigoOrden} · Solicitud ${facturable.solicitudId} · ${facturable.anio}`,
      description: `Monto de la orden ${formatCLP(facturable.monto)} · Facturado ${formatCLP(facturable.facturado)}`,
      disabled: (lineas ?? []).some(
        (linea, otra) => otra !== posicion && linea?.montoOrdenCompraId === String(facturable.id),
      ),
    }))

  const handleAgregar = () => {
    append({ montoOrdenCompraId: '', monto: null })
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-mercury-300 px-4 py-6 text-center text-sm text-mercury-500">
          {facturables.length === 0
            ? 'No hay órdenes de compra vigentes para facturar.'
            : 'Aún no ha agregado líneas a esta factura.'}
        </p>
      ) : (
        <div>
          {fields.map((linea, posicion) => {
            const seleccion = lineas?.[posicion]?.montoOrdenCompraId ?? ''
            const facturable = facturables.find((item) => String(item.id) === seleccion)
            const facturadoTotal = facturable
              ? facturable.facturado + facturadoSinGuardar(facturas, facturable.id)
              : 0
            const exceso = facturable ? facturadoTotal - facturable.monto : 0

            return (
              <div
                key={linea.id}
                className="flex items-start gap-3 border-t border-mercury-200 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 sm:flex-1">
                    <Field<TransaccionFormState>
                      name={`facturas.${index}.montos.${posicion}.montoOrdenCompraId`}
                      label="Monto de orden facturado"
                      required
                    >
                      <Combobox
                        options={opcionesPara(posicion)}
                        placeholder="Seleccione el monto de orden"
                      />
                    </Field>
                  </div>
                  <div className="w-full sm:w-56 sm:shrink-0">
                    <Field<TransaccionFormState>
                      name={`facturas.${index}.montos.${posicion}.monto`}
                      label="Monto facturado"
                      required
                    >
                      <NumberInput
                        min={0}
                        decimals={0}
                        prefix="$"
                        showStepper={false}
                        disabled={!facturable}
                      />
                    </Field>
                    {facturable && (
                      <div className="mt-1.5 space-y-0.5 text-xs tabular-nums">
                        <p className="text-mercury-500">
                          Monto de la orden {formatCLP(facturable.monto)} · Facturado en total{' '}
                          {formatCLP(facturadoTotal)}
                        </p>
                        {exceso > 0 && (
                          <p className="font-medium text-scarlet-700">
                            Excede el monto de la orden en {formatCLP(exceso)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Quitar la línea ${posicion + 1}`}
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

      <div className="flex flex-col gap-3 border-t border-mercury-200 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Button type="button" variant="secondary" onClick={handleAgregar} disabled={sinCupo}>
          <Plus aria-hidden="true" className="size-4" />
          Agregar línea
        </Button>
        <span className="flex flex-col items-start gap-0.5 sm:items-end">
          <span className="text-xs uppercase tracking-wide text-mercury-400">
            Total de la factura
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
