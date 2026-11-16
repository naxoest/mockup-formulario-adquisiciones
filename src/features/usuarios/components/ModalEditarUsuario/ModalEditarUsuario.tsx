import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm } from '@/components/ui/Modal'
import { zodResolver } from '@/lib/zodResolver'
import { ApiError } from '@/lib/apiClient'
import { formatFullName, getInitials } from '@/utils/personName'
import { formatRun } from '@/utils/run'
import { rolesQueryOptions } from '@/features/usuarios/api/roles'
import { asignacionesUsuarioQueryOptions, editarUsuario } from '@/features/usuarios/api/usuarios'
import { UsuarioCampos } from '@/features/usuarios/components/UsuarioCampos'
import { crearUsuarioEdicionSchema } from '@/features/usuarios/schemas/usuario.schema'
import {
  construirPeticionEdicion,
  construirValoresEdicion,
  describirAsignaciones,
  esCampoEdicion,
  nombreDeUsuario,
  pierdeRolAnalista,
} from '@/features/usuarios/utils/usuario'
import type { UsuarioEdicionValues } from '@/features/usuarios/schemas/usuario.schema'
import type { ModalEditarUsuarioProps } from './ModalEditarUsuario.types'

const AVISO_QUITA_DE_ROL =
  'Al quitarle el rol analista, esas asignaciones terminarán y no se restaurarán aunque vuelva a tenerlo.'

export function ModalEditarUsuario({ usuario, open, resolve, onExited }: ModalEditarUsuarioProps) {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()
  const { data: roles = [] } = useQuery(rolesQueryOptions)
  const [verificando, setVerificando] = useState(false)

  const tieneCorreoEstudiantil = usuario.emailEstudiantil !== null
  const nombre = nombreDeUsuario(usuario)

  const esquema = useMemo(
    () => crearUsuarioEdicionSchema(tieneCorreoEstudiantil),
    [tieneCorreoEstudiantil],
  )

  const form = useForm<UsuarioEdicionValues>({
    resolver: zodResolver(esquema),
    defaultValues: construirValoresEdicion(usuario),
  })

  const mutacion = useMutation({
    mutationFn: (valores: UsuarioEdicionValues) =>
      editarUsuario(usuario.run, construirPeticionEdicion(valores)),
    onSuccess: async (_actualizado, valores) => {
      if (pierdeRolAnalista(usuario.roles, valores.roles)) {
        void queryClient.invalidateQueries({ queryKey: ['transacciones'] })
        void queryClient.invalidateQueries({ queryKey: ['monitoreo'] })
      }

      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Cambios guardados')
      resolve(true)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.field && esCampoEdicion(error.field)) {
        form.setError(error.field, { message: error.message })
        return
      }
      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los cambios')
    },
  })

  const ocupado = verificando || mutacion.isPending

  const confirmarQuitaDeRolAnalista = async () => {
    const asignaciones = await queryClient.fetchQuery(asignacionesUsuarioQueryOptions(usuario.run))
    const descripcion = describirAsignaciones(asignaciones)

    if (descripcion === null) return true

    return confirmar({
      title: `Quitar el rol analista a ${formatFullName(nombre)}`,
      message: `${descripcion} ${AVISO_QUITA_DE_ROL}`,
      variant: 'warning',
      confirmText: 'Guardar cambios',
      cancelText: 'Volver a la edición',
    })
  }

  const guardar = async (valores: UsuarioEdicionValues) => {
    if (!pierdeRolAnalista(usuario.roles, valores.roles)) {
      mutacion.mutate(valores)
      return
    }

    setVerificando(true)

    try {
      if (await confirmarQuitaDeRolAnalista()) {
        mutacion.mutate(valores)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudieron consultar las asignaciones del usuario',
      )
    } finally {
      setVerificando(false)
    }
  }

  const cerrar = async () => {
    if (ocupado) return

    if (!form.formState.isDirty) {
      resolve(false)
      return
    }

    const descartar = await confirmar({
      title: 'Descartar los cambios',
      message: 'Las modificaciones realizadas se perderán.',
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
      closeOnBackdrop={!ocupado}
      closeOnEscape={!ocupado}
      showCloseButton={!ocupado}
    >
      <Modal.Header>Editar usuario</Modal.Header>
      <Form form={form} onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          <div className="flex items-center gap-3 border-b border-mercury-200 pb-4">
            <Avatar
              initials={getInitials(nombre)}
              seed={usuario.run}
              src={usuario.fotoUrl ?? undefined}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-mercury-900">
                {formatFullName(nombre)}
              </p>
              <p className="text-xs tabular-nums text-mercury-600">
                {formatRun(usuario.run, usuario.digitoVerificador)}
              </p>
            </div>
          </div>
          <UsuarioCampos roles={roles} correoInstitucionalObligatorio={!tieneCorreoEstudiantil} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={mutacion.isPending}
            disabled={verificando}
          >
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
