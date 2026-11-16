import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field, Form } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Modal, useConfirm } from '@/components/ui/Modal'
import { zodResolver } from '@/lib/zodResolver'
import { ApiError } from '@/lib/apiClient'
import { rolesQueryOptions } from '@/features/usuarios/api/roles'
import { crearUsuario } from '@/features/usuarios/api/usuarios'
import { UsuarioCampos } from '@/features/usuarios/components/UsuarioCampos'
import { usuarioCreacionSchema } from '@/features/usuarios/schemas/usuario.schema'
import { construirPeticionCreacion, esCampoCreacion } from '@/features/usuarios/utils/usuario'
import type { UsuarioCreacionValues } from '@/features/usuarios/schemas/usuario.schema'
import type { ModalCrearUsuarioProps } from './ModalCrearUsuario.types'

export function ModalCrearUsuario({ open, resolve, onExited }: ModalCrearUsuarioProps) {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()
  const { data: roles = [] } = useQuery(rolesQueryOptions)

  const form = useForm<UsuarioCreacionValues>({
    resolver: zodResolver(usuarioCreacionSchema),
    defaultValues: {
      run: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      emailInstitucional: '',
      roles: [],
    },
  })

  const mutacion = useMutation({
    mutationFn: crearUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario creado')
      resolve(true)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.field && esCampoCreacion(error.field)) {
        form.setError(error.field, { message: error.message })
        return
      }
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el usuario')
    },
  })

  const cerrar = async () => {
    if (mutacion.isPending) return

    if (!form.formState.isDirty) {
      resolve(false)
      return
    }

    const descartar = await confirmar({
      title: 'Descartar el usuario nuevo',
      message: 'Los datos ingresados se perderán.',
      variant: 'warning',
      confirmText: 'Descartar',
      cancelText: 'Seguir editando',
    })

    if (descartar) {
      resolve(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      onExited={onExited}
      size="lg"
      closeOnBackdrop={!mutacion.isPending}
      closeOnEscape={!mutacion.isPending}
      showCloseButton={!mutacion.isPending}
    >
      <Modal.Header>Nuevo usuario</Modal.Header>
      <Form
        form={form}
        onSubmit={(valores) => mutacion.mutate(construirPeticionCreacion(valores))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Modal.Body className="space-y-4">
          <Field<UsuarioCreacionValues>
            name="run"
            label="RUN"
            required
            description="Con o sin puntos y guión"
          >
            <Input placeholder="12.345.678-5" />
          </Field>
          <UsuarioCampos roles={roles} correoInstitucionalObligatorio />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrar} disabled={mutacion.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={mutacion.isPending}>
            Crear usuario
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
