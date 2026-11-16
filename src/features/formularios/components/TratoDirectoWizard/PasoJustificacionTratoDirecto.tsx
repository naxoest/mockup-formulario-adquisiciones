import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { Combobox } from '@/components/ui/Combobox'
import { FieldArray } from '@/components/ui/FieldArray'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import type { TratoDirectoFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { OPCIONES_DIRECCION_DESPACHO } from '@/features/formularios/utils/catalogosFormulario'
import {
  TOPE_CAUSAL_7B_UTM,
  calcularMontoUtm,
  calcularTotalesCotizacionTratoDirecto,
} from '@/features/formularios/utils/reglasLicitacion'
import { formatCLP } from '@/utils/currency'

export function PasoJustificacionTratoDirecto() {
  const { control, setValue } = useFormContext<TratoDirectoFormValues>()
  const lineasWatch = useWatch({ control, name: 'lineasCotizacion' })
  const afectoIva = useWatch({ control, name: 'afectoIva' })
  const causal = useWatch({ control, name: 'causal' })
  const esServicio = useWatch({ control, name: 'condicionesCompra.esServicio' })
  const requiereGarantia = useWatch({ control, name: 'condicionesCompra.requiereGarantia' })
  const aplicaDespacho = useWatch({ control, name: 'condicionesCompra.aplicaDireccionDespacho' })
  const direccionCodigo = useWatch({ control, name: 'condicionesCompra.direccionDespachoCodigo' })

  const totales = calcularTotalesCotizacionTratoDirecto(lineasWatch ?? [], afectoIva ?? true)
  const montoUtm = calcularMontoUtm(totales.total)

  useEffect(() => {
    if (totales.total > 0) {
      setValue('montoEstimadoClp', totales.total, { shouldValidate: false })
    }
  }, [totales.total, setValue])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            5. En atención a lo requerido se realizó(ron) la(s) siguiente(s) cotización(es):
          </h3>
          <p className="text-xs text-mercury-500">
            (*) Considerar 1 cuadro por proveedor. Cada ítem cotizado debe ir en una línea
            diferente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TratoDirectoFormValues>
            name="proveedorNombre"
            label="(*) RAZÓN SOCIAL PROVEEDOR"
            required
          >
            <Input placeholder="Ej. EMPRESA EL MERCURIO S A P" />
          </Field>

          <Field<TratoDirectoFormValues> name="proveedorRut" label="RUT PROVEEDOR" required>
            <Input placeholder="Ej. 90.193.000-7" />
          </Field>
        </div>

        <FieldArray<TratoDirectoFormValues>
          name="lineasCotizacion"
          addLabel="Insertar más líneas de cotización"
          emptyState="Agregue al menos una línea con cantidad, detalle y precio unitario neto."
          defaultItem={() => ({
            cantidad: 1,
            detalle: '',
            precioUnitarioNeto: null,
          })}
          renderSummary={({ index }) => {
            const linea = lineasWatch?.[index]
            const subtotal = Math.round((linea?.cantidad ?? 0) * (linea?.precioUnitarioNeto ?? 0))
            return (
              <span className="text-sm font-medium text-mercury-800">
                CANT. {linea?.cantidad ?? 0} · {linea?.detalle?.trim() || `Línea #${index + 1}`} —{' '}
                <strong>{formatCLP(subtotal)} neto</strong>
              </span>
            )
          }}
          renderDetail={({ index }) => {
            const linea = lineasWatch?.[index]
            const subtotal = Math.round((linea?.cantidad ?? 0) * (linea?.precioUnitarioNeto ?? 0))
            return (
              <div className="grid items-end gap-4 sm:grid-cols-6">
                <Field<TratoDirectoFormValues>
                  name={`lineasCotizacion.${index}.cantidad`}
                  label="CANT."
                  required
                >
                  <NumberInput min={1} />
                </Field>

                <div className="sm:col-span-3">
                  <Field<TratoDirectoFormValues>
                    name={`lineasCotizacion.${index}.detalle`}
                    label="DETALLE"
                    required
                  >
                    <Input placeholder="Indicar nombre de lo requerido" />
                  </Field>
                </div>

                <Field<TratoDirectoFormValues>
                  name={`lineasCotizacion.${index}.precioUnitarioNeto`}
                  label="PRECIO UNITARIO NETO"
                  required
                >
                  <NumberInput min={1} prefix="$" showStepper={false} />
                </Field>

                <div className="rounded-lg border border-mercury-200 bg-mercury-50 px-3 py-2 text-right">
                  <p className="text-[11px] font-medium text-mercury-500">PRECIO TOTAL NETO</p>
                  <p className="text-sm font-bold tabular-nums text-mercury-900">
                    {formatCLP(subtotal)}
                  </p>
                </div>
              </div>
            )
          }}
        />

        <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Field<TratoDirectoFormValues> name="afectoIva" label="Afecto a IVA" hideLabel>
              <Checkbox
                label="Cotización afecta a IVA (19%)"
                description="Desmarque únicamente si la factura o servicio es exento de IVA."
              />
            </Field>

            <div className="space-y-1 text-right text-sm tabular-nums">
              <p className="text-mercury-700">
                NETO: <strong className="ml-2">{formatCLP(totales.neto)}</strong>
              </p>
              <p className="text-mercury-700">
                IVA (19%): <strong className="ml-2">{formatCLP(totales.iva)}</strong>
              </p>
              <p className="text-base font-bold text-mercury-900">
                TOTAL: <span className="ml-2 text-primary-700">{formatCLP(totales.total)}</span>{' '}
                <span className="text-xs font-semibold text-mercury-600">
                  ({montoUtm.toLocaleString('es-CL')} UTM)
                </span>
              </p>
            </div>
          </div>

          {causal === 'costo_desproporcionado_7b' && montoUtm > TOPE_CAUSAL_7B_UTM && (
            <p role="alert" className="mt-2 text-xs font-semibold text-scarlet-600">
              Atención: La causal 7b permite un máximo de {TOPE_CAUSAL_7B_UTM} UTM y el total actual
              equivale a {montoUtm.toLocaleString('es-CL')} UTM.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            Condiciones de la compra (*) Posterior a la aceptación de la orden de compra
          </h3>
        </div>

        <Field<TratoDirectoFormValues>
          name="condicionesCompra.plazoEntregaDiasHabiles"
          label="(*) Plazo de entrega (indicar plazo de entrega en días hábiles)"
          required
        >
          <NumberInput min={1} suffix="días hábiles" />
        </Field>

        <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
          <Field<TratoDirectoFormValues>
            name="condicionesCompra.esServicio"
            label="En caso de Servicios"
            hideLabel
          >
            <Checkbox
              label="(*) En caso de Servicios: Indicar fecha de inicio y fecha de término"
              description="Marque si la contratación corresponde a un servicio periódico o con vigencia definida."
            />
          </Field>

          {esServicio && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field<TratoDirectoFormValues>
                name="condicionesCompra.fechaInicioServicio"
                label="Fecha de inicio"
                required
              >
                <Input placeholder="Ej. Agosto 2025" />
              </Field>

              <Field<TratoDirectoFormValues>
                name="condicionesCompra.fechaTerminoServicio"
                label="Fecha de término"
                required
              >
                <Input placeholder="Ej. Agosto 2026" />
              </Field>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
            <Field<TratoDirectoFormValues>
              name="condicionesCompra.requiereGarantia"
              label="Garantía del bien o servicio"
              hideLabel
            >
              <Checkbox label="Requiere garantía del bien o servicio (desmarcar si ☒ No requiere garantía)" />
            </Field>

            {requiereGarantia && (
              <Field<TratoDirectoFormValues>
                name="condicionesCompra.mesesGarantia"
                label="Indicar garantía (meses)"
                required
              >
                <NumberInput min={1} suffix="meses" />
              </Field>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
            <Field<TratoDirectoFormValues>
              name="condicionesCompra.aplicaDireccionDespacho"
              label="Dirección de despacho o servicio"
              hideLabel
            >
              <Checkbox label="Aplica dirección física de despacho o servicio (desmarcar si ☒ No aplica)" />
            </Field>

            {aplicaDespacho && (
              <div className="space-y-3">
                <Field<TratoDirectoFormValues>
                  name="condicionesCompra.direccionDespachoCodigo"
                  label="Elegir dirección"
                  required
                >
                  <Combobox options={OPCIONES_DIRECCION_DESPACHO} />
                </Field>

                {direccionCodigo === 'otra' && (
                  <Field<TratoDirectoFormValues>
                    name="condicionesCompra.direccionDespachoOtra"
                    label="Indicar dirección"
                    required
                  >
                    <Input placeholder="Calle, número y campus" />
                  </Field>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
