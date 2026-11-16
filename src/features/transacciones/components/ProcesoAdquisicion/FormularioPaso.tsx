import { useId } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Form'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { RegistroPasoValues } from '@/features/transacciones/schemas/registroPaso.schema'
import type { ProcesoAdquisicion } from '@/features/transacciones/types/transaccion.types'
import { fromCivilDate } from '@/utils/date'

interface FormularioPasoProps {
  proceso: ProcesoAdquisicion
  form: UseFormReturn<RegistroPasoValues>
}

export function FormularioPaso({ proceso, form }: FormularioPasoProps) {
  const idTitulo = useId()
  const siguientes = proceso.siguientesPermitidos
  const unico = siguientes.length === 1 ? siguientes[0] : null
  const previo = proceso.registrados.at(-1)

  const pasoElegido = useWatch({ control: form.control, name: 'paso' })
  const requiereObservacion = siguientes.some(
    (siguiente) => siguiente.paso === pasoElegido && siguiente.requiereObservacion,
  )

  return (
    <FormProvider {...form}>
      <section
        aria-labelledby={idTitulo}
        className="flex flex-col gap-4 rounded-xl border border-mercury-200 p-4"
      >
        <div>
          <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
            Siguiente paso
          </h3>
          {unico !== null && (
            <p className="mt-1 text-sm font-medium text-primary-800">{unico.etiqueta}</p>
          )}
        </div>

        {unico === null && (
          <Field name="paso" label="Resultado del paso" required>
            <RadioGroup
              options={siguientes.map((siguiente) => ({
                value: siguiente.paso,
                label: siguiente.etiqueta,
              }))}
            />
          </Field>
        )}

        <Field
          name="fecha"
          label="Fecha del hecho"
          description="Fecha en que ocurrió el hecho. No puede ser posterior a hoy ni anterior a la del paso previo."
          required
        >
          <DatePicker
            minDate={previo === undefined ? undefined : fromCivilDate(previo.fecha)}
            maxDate={new Date()}
            placeholder="Seleccione una fecha"
          />
        </Field>

        <Field
          name="observacion"
          label="Observación"
          description={
            requiereObservacion ? 'El resultado seleccionado requiere una observación.' : undefined
          }
          required={requiereObservacion}
          optional
        >
          <TextArea rows={2} maxLength={200} showCounter />
        </Field>
      </section>
    </FormProvider>
  )
}
