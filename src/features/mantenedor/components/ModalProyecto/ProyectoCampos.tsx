import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { CR_MAXIMO, type ProyectoFormValues } from '@/features/mantenedor/schemas/proyecto.schema'

export function ProyectoCampos() {
  return (
    <>
      <Field<ProyectoFormValues> name="nombre" label="Nombre" required>
        <Input />
      </Field>

      <Field<ProyectoFormValues> name="cr" label="CR" required>
        <NumberInput min={1} max={CR_MAXIMO} thousandSeparator={false} showStepper={false} />
      </Field>
    </>
  )
}
