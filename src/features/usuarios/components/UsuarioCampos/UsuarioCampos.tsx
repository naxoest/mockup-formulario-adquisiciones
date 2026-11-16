import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { etiquetaRol } from '@/features/auth/roles'
import type { UsuarioEdicionValues } from '@/features/usuarios/schemas/usuario.schema'
import type { Rol } from '@/features/usuarios/types/usuario.types'

interface UsuarioCamposProps {
  roles: Rol[]
  correoInstitucionalObligatorio: boolean
}

export function UsuarioCampos({ roles, correoInstitucionalObligatorio }: UsuarioCamposProps) {
  const opciones = roles.map((rol) => ({ value: String(rol.id), label: etiquetaRol(rol.nombre) }))

  return (
    <>
      <Field<UsuarioEdicionValues> name="nombres" label="Nombres" required>
        <Input />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field<UsuarioEdicionValues> name="apellidoPaterno" label="Apellido paterno" required>
          <Input />
        </Field>
        <Field<UsuarioEdicionValues> name="apellidoMaterno" label="Apellido materno" required>
          <Input />
        </Field>
      </div>

      {correoInstitucionalObligatorio ? (
        <Field<UsuarioEdicionValues>
          name="emailInstitucional"
          label="Correo institucional"
          required
        >
          <Input type="email" placeholder="nombre.apellido@inst.cl" />
        </Field>
      ) : (
        <Field<UsuarioEdicionValues>
          name="emailInstitucional"
          label="Correo institucional"
          description="Opcional, porque el usuario tiene correo estudiantil"
        >
          <Input type="email" placeholder="nombre.apellido@inst.cl" />
        </Field>
      )}

      <Field<UsuarioEdicionValues> name="roles" label="Roles">
        <Combobox
          multiple
          options={opciones}
          enableSelectAll
          placeholder="Seleccionar roles"
          searchPlaceholder="Buscar rol"
          emptyMessage="No hay roles disponibles"
        />
      </Field>
    </>
  )
}
