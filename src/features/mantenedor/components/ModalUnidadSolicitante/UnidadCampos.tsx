import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import {
  CR_MAXIMO,
  type UnidadSolicitanteFormValues,
} from '@/features/mantenedor/schemas/unidadSolicitante.schema'
import type { SelectOption } from '@/types/select'

interface UnidadCamposProps {
  tipos: SelectOption[]
  sedes: SelectOption[]
}

export function UnidadCampos({ tipos, sedes }: UnidadCamposProps) {
  return (
    <>
      <Field<UnidadSolicitanteFormValues> name="nombre" label="Nombre" required>
        <Input />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field<UnidadSolicitanteFormValues> name="cr" label="CR" required>
          <NumberInput min={1} max={CR_MAXIMO} thousandSeparator={false} showStepper={false} />
        </Field>
        <Field<UnidadSolicitanteFormValues> name="tipo" label="Tipo" required>
          <Combobox options={tipos} placeholder="Seleccione un tipo" />
        </Field>
      </div>

      <Field<UnidadSolicitanteFormValues> name="sedes" label="Sedes" required>
        <Combobox
          multiple
          options={sedes}
          enableSelectAll
          placeholder="Seleccione las sedes"
          searchPlaceholder="Buscar sede"
          emptyMessage="No hay sedes disponibles"
        />
      </Field>
    </>
  )
}
