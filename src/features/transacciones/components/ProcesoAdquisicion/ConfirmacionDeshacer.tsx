import { useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Form'
import { TextArea } from '@/components/ui/TextArea'
import { ApiError } from '@/lib/apiClient'
import { zodResolver } from '@/lib/zodResolver'
import {
  deshacerPasoFormSchema,
  type DeshacerPasoValues,
} from '@/features/transacciones/schemas/deshacerPaso.schema'
import type { PasoRegistrado } from '@/features/transacciones/types/transaccion.types'

interface ConfirmacionDeshacerProps {
  ultimo: PasoRegistrado
  onCancelar: () => void
  onConfirmar: (observacion: string) => Promise<void>
}

export function ConfirmacionDeshacer({
  ultimo,
  onCancelar,
  onConfirmar,
}: ConfirmacionDeshacerProps) {
  const idTitulo = useId()

  const form = useForm<DeshacerPasoValues>({
    resolver: zodResolver(deshacerPasoFormSchema),
    defaultValues: { observacion: '' },
  })

  const confirmar = form.handleSubmit(async ({ observacion }) => {
    try {
      await onConfirmar(observacion.trim())
    } catch (error) {
      if (error instanceof ApiError && error.field === 'observacion') {
        form.setError('observacion', { message: error.message })
        return
      }

      toast.error(error instanceof Error ? error.message : 'No se pudo deshacer el paso')
    }
  })

  return (
    <FormProvider {...form}>
      <section
        aria-labelledby={idTitulo}
        className="flex flex-col gap-4 rounded-xl border border-mercury-200 p-4"
      >
        <div>
          <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
            Deshacer el paso «{ultimo.etiqueta}»
          </h3>
          <p className="mt-1 text-sm text-mercury-600">
            Se eliminará este paso y el proceso volverá a quedar pendiente en él. La acción quedará
            registrada en el historial junto con el motivo.
          </p>
        </div>

        <Field name="observacion" label="Motivo" required>
          <TextArea rows={2} maxLength={200} showCounter />
        </Field>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={form.formState.isSubmitting}
            onClick={() => void confirmar()}
          >
            Deshacer paso
          </Button>
        </div>
      </section>
    </FormProvider>
  )
}
