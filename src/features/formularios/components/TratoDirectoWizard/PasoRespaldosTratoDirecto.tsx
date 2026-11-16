import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { FieldArray } from '@/components/ui/FieldArray'
import { FileUpload } from '@/components/ui/FileUpload'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import type { TratoDirectoFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { OPCIONES_DOCUMENTOS_ADICIONALES_TD } from '@/features/formularios/utils/catalogosFormulario'

export function PasoRespaldosTratoDirecto() {
  const { control, setValue } = useFormContext<TratoDirectoFormValues>()
  const mismoJefeCr = useWatch({ control, name: 'coordinadorEsMismoJefeCr' })
  const jefeCrNombre = useWatch({ control, name: 'jefeCrNombre' })
  const jefeCrCargo = useWatch({ control, name: 'jefeCrCargo' })
  const incumplimientosWatch = useWatch({ control, name: 'otrosIncumplimientos' })
  const documentosAdicionales = useWatch({ control, name: 'documentosAdicionales' })

  useEffect(() => {
    if (mismoJefeCr) {
      setValue('coordinador.nombreCompleto', jefeCrNombre ?? '', { shouldValidate: false })
      setValue('coordinador.cargo', jefeCrCargo ?? '', { shouldValidate: false })
    }
  }, [mismoJefeCr, jefeCrNombre, jefeCrCargo, setValue])

  const incluyeOtroDocumento = (documentosAdicionales ?? []).includes('otro')

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            10. Imputación al Centro de Responsabilidad (CR) y 6. Coordinador de la Contratación
          </h3>
          <p className="text-xs text-mercury-500">
            La persona designada como coordinador ejercerá las funciones de supervisar el
            cumplimiento, dar visto bueno y recepción conforme, tramitar pagos/sanciones y notificar
            incumplimientos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field<TratoDirectoFormValues>
            name="coordinador.crCodigo"
            label="10. La compra será imputada al CR"
            required
          >
            <NumberInput min={1} thousandSeparator={false} showStepper={false} placeholder="60" />
          </Field>

          <div className="sm:col-span-2">
            <Field<TratoDirectoFormValues>
              name="coordinador.crNombre"
              label="Nombre del CR"
              required
            >
              <Input placeholder="Ej. Dirección de Bibliotecas" />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TratoDirectoFormValues> name="jefeCrNombre" label="Nombre del Jefe de CR" required>
            <Input placeholder="Ej. Sergio Arce Molina" />
          </Field>

          <Field<TratoDirectoFormValues> name="jefeCrCargo" label="Cargo del Jefe de CR" required>
            <Input placeholder="Ej. Director Dirección de Bibliotecas" />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
          <Field<TratoDirectoFormValues>
            name="coordinadorEsMismoJefeCr"
            label="Coordinador es Jefe de CR"
            hideLabel
          >
            <Checkbox
              label="El coordinador o responsable de la contratación corresponde al mismo Jefe del Centro de Responsabilidad"
              description="Nota oficial: En el caso que sea distinto, ambos deben firmar la presente solicitud."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field<TratoDirectoFormValues>
              name="coordinador.nombreCompleto"
              label="6. Nombre del coordinador o responsable de la contratación"
              required
            >
              <Input disabled={mismoJefeCr} placeholder="Indicar nombre" />
            </Field>

            <Field<TratoDirectoFormValues>
              name="coordinador.cargo"
              label="Cargo del coordinador o responsable de la contratación"
              required
            >
              <Input disabled={mismoJefeCr} placeholder="Indicar cargo" />
            </Field>

            <Field<TratoDirectoFormValues>
              name="coordinador.run"
              label="Rut del coordinador o responsable de la contratación"
              required
            >
              <Input placeholder="Ej. 8.350.752-7" />
            </Field>

            <Field<TratoDirectoFormValues>
              name="coordinador.correo"
              label="Correo electrónico institucional"
              required
            >
              <Input type="email" placeholder="nombre@ulagos.cl" />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            7. Multas y 7.1. Otras situaciones de incumplimiento
          </h3>
          <p className="text-xs text-mercury-500">
            Se aplicará una multa de un 0,5% diario del valor total neto solicitado con un tope de
            20 días corridos o hábiles (hasta el 10% del valor total del contrato afecto al
            retraso).
          </p>
        </div>

        <FieldArray<TratoDirectoFormValues>
          name="otrosIncumplimientos"
          addLabel="7.1. Agregar otra situación de incumplimiento"
          emptyState="Sin otras situaciones adicionales al plazo de entrega (opcional)."
          defaultItem={() => ({
            tipoIncumplimiento: '',
            sancionAplicar: '',
          })}
          renderSummary={({ index }) => {
            const item = incumplimientosWatch?.[index]
            return (
              <span className="text-sm font-medium text-mercury-800">
                {item?.tipoIncumplimiento?.trim() || `Situación adicional #${index + 1}`}
              </span>
            )
          }}
          renderDetail={({ index }) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field<TratoDirectoFormValues>
                name={`otrosIncumplimientos.${index}.tipoIncumplimiento`}
                label="Tipo de Incumplimiento"
                required
              >
                <Input placeholder="Indicar otro tipo de incumplimiento distinto al plazo de entrega" />
              </Field>

              <Field<TratoDirectoFormValues>
                name={`otrosIncumplimientos.${index}.sancionAplicar`}
                label="Sanción a aplicar"
                required
              >
                <Input placeholder="Multa, amonestación, etc." />
              </Field>
            </div>
          )}
        />
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            8. Término anticipado del contrato y 9. Compromisos de la unidad que suscribe
          </h3>
        </div>

        <div className="space-y-3 rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <Field<TratoDirectoFormValues>
            name="disposiciones.aceptaTerminoAnticipadoArt130"
            label="8. Término anticipado del contrato"
            hideLabel
          >
            <Checkbox
              label="8. Acepta cláusula de Término Anticipado del Contrato (Art. 130 D.S. N° 661 de 2024, Reglamento Ley 19.886)"
              description="La Universidad pondrá término anticipado en los casos del Art. 130 o por fuerza mayor/caso fortuito sin derecho a indemnización."
            />
          </Field>

          <div className="border-t border-mercury-200 pt-3">
            <Field<TratoDirectoFormValues>
              name="compromisoEstandarSimpleOc"
              label="9.a Estándar simple y objetiva especificación"
              hideLabel
            >
              <Checkbox label='9.a. Que el bien y/o servicio a contratar es "estándar de simple y objetiva especificación", solicitando se formalice con la emisión y aceptación de la Orden de Compra en Mercado Público' />
            </Field>
          </div>

          <div className="border-t border-mercury-200 pt-3">
            <Field<TratoDirectoFormValues>
              name="compromisoNoFragmentacion"
              label="9.b Prohibición de fragmentación"
              hideLabel
            >
              <Checkbox label="9.b. No estar fragmentando la compra con el propósito de variar el procedimiento de contratación" />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            11. Lo indicado se acredita con los siguientes documentos adjuntos:
          </h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field<TratoDirectoFormValues>
            name="archivoCotizacion"
            label="☒ Cotización de proveedor (Obligatorio)"
            required
          >
            <FileUpload categories={['document']} maxFiles={1} />
          </Field>

          <Field<TratoDirectoFormValues>
            name="archivoDeclaracionJurada"
            label="☒ Declaración jurada del proveedor (Obligatorio)"
            required
          >
            <FileUpload categories={['document']} maxFiles={1} />
          </Field>
        </div>

        <div className="rounded-xl border border-mercury-200 p-4">
          <Field<TratoDirectoFormValues>
            name="documentosAdicionales"
            label="Otros documentos de acreditación adjuntados (según corresponda)"
            optional
          >
            <CheckboxGroup options={OPCIONES_DOCUMENTOS_ADICIONALES_TD} />
          </Field>

          {incluyeOtroDocumento && (
            <div className="mt-3">
              <Field<TratoDirectoFormValues>
                name="otroDocumentoAdicionalDetalle"
                label="Otro: Indicar documento adjuntado"
                required
              >
                <Input placeholder="Especifique el documento adicional adjuntado" />
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
