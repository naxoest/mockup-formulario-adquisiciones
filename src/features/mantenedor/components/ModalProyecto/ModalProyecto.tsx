import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm } from '@/components/ui/Modal'
import {
  crearProyecto,
  editarProyecto,
  invalidarDatosDeProyectos,
} from '@/features/mantenedor/api/proyectos'
import {
  proyectoFormSchema,
  proyectoRequestSchema,
  type ProyectoFormValues,
  type ProyectoRequest,
} from '@/features/mantenedor/schemas/proyecto.schema'
import {
  construirAvisoDeCambiosProyecto,
  construirValoresFormularioProyecto,
  esCampoProyecto,
} from '@/features/mantenedor/utils/proyecto'
import { ApiError } from '@/lib/apiClient'
import { zodResolver } from '@/lib/zodResolver'
import { ProyectoCampos } from './ProyectoCampos'
import type { ModalProyectoProps } from './ModalProyecto.types'

export function ModalProyecto({ proyecto, open, resolve, onExited }: ModalProyectoProps) {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()

  const form = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoFormSchema),
    defaultValues: construirValoresFormularioProyecto(proyecto),
  })

  const { isDirty } = form.formState

  const mutacion = useMutation({
    mutationFn: (peticion: ProyectoRequest) =>
      proyecto ? editarProyecto(proyecto.id, peticion) : crearProyecto(peticion),
    onSuccess: async () => {
      await invalidarDatosDeProyectos(queryClient)
      toast.success(proyecto ? 'Cambios guardados' : 'Proyecto creado')
      resolve(true)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.field && esCampoProyecto(error.field)) {
        form.setError(error.field, { message: error.message })
        return
      }

      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los datos')
    },
  })

  const guardar = async (valores: ProyectoFormValues) => {
    const peticion = proyectoRequestSchema.parse(valores)
    const aviso = proyecto ? construirAvisoDeCambiosProyecto(proyecto, peticion) : null

    if (aviso === null) {
      mutacion.mutate(peticion)
      return
    }

    const confirmado = await confirmar({
      title: 'Confirmar los cambios',
      message: aviso,
      variant: 'warning',
      confirmText: 'Guardar cambios',
      cancelText: 'Volver a la edición',
    })

    if (confirmado) {
      mutacion.mutate(peticion)
    }
  }

  const cerrar = async () => {
    if (mutacion.isPending) return

    if (!isDirty) {
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
      size="md"
      closeOnBackdrop={!mutacion.isPending}
      closeOnEscape={!mutacion.isPending}
      showCloseButton={!mutacion.isPending}
    >
      <Modal.Header>{proyecto ? 'Editar proyecto' : 'Nuevo proyecto'}</Modal.Header>
      <Form form={form} onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          <ProyectoCampos />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrar} disabled={mutacion.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={mutacion.isPending}>
            {proyecto ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
