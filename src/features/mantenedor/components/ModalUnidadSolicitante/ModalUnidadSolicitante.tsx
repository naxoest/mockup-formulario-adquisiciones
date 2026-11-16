import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm } from '@/components/ui/Modal'
import {
  crearUnidadSolicitante,
  editarUnidadSolicitante,
  invalidarDatosDeUnidades,
  sedesQueryOptions,
  tiposSolicitanteQueryOptions,
} from '@/features/mantenedor/api/unidadesSolicitantes'
import {
  unidadSolicitanteFormSchema,
  unidadSolicitanteRequestSchema,
  type UnidadSolicitanteFormValues,
  type UnidadSolicitanteRequest,
} from '@/features/mantenedor/schemas/unidadSolicitante.schema'
import {
  construirAvisoDeCambios,
  construirValoresFormulario,
  esCampoUnidad,
} from '@/features/mantenedor/utils/unidadSolicitante'
import { ApiError } from '@/lib/apiClient'
import { zodResolver } from '@/lib/zodResolver'
import type { SelectOption } from '@/types/select'
import { UnidadCampos } from './UnidadCampos'
import type { ModalUnidadSolicitanteProps } from './ModalUnidadSolicitante.types'

const SIN_OPCIONES: SelectOption[] = []

export function ModalUnidadSolicitante({
  unidad,
  open,
  resolve,
  onExited,
}: ModalUnidadSolicitanteProps) {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()
  const consultaTipos = useQuery(tiposSolicitanteQueryOptions)
  const consultaSedes = useQuery(sedesQueryOptions)
  const tipos = consultaTipos.data ?? SIN_OPCIONES
  const sedes = consultaSedes.data ?? SIN_OPCIONES
  const catalogosCargados = consultaTipos.data !== undefined && consultaSedes.data !== undefined
  const catalogosFallidos = consultaTipos.isLoadingError || consultaSedes.isLoadingError

  const form = useForm<UnidadSolicitanteFormValues>({
    resolver: zodResolver(unidadSolicitanteFormSchema),
    defaultValues: construirValoresFormulario(unidad),
  })

  const mutacion = useMutation({
    mutationFn: (peticion: UnidadSolicitanteRequest) =>
      unidad ? editarUnidadSolicitante(unidad.id, peticion) : crearUnidadSolicitante(peticion),
    onSuccess: async () => {
      await invalidarDatosDeUnidades(queryClient)
      toast.success(unidad ? 'Cambios guardados' : 'Registro creado')
      resolve(true)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.field && esCampoUnidad(error.field)) {
        form.setError(error.field, { message: error.message })
        return
      }

      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los datos')
    },
  })

  const guardar = async (valores: UnidadSolicitanteFormValues) => {
    const peticion = unidadSolicitanteRequestSchema.parse(valores)
    const aviso = unidad ? construirAvisoDeCambios(unidad, peticion, tipos) : null

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

  const reintentarCatalogos = () => {
    void consultaTipos.refetch()
    void consultaSedes.refetch()
  }

  const cerrar = async () => {
    if (mutacion.isPending) return

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
      closeOnBackdrop={!mutacion.isPending}
      closeOnEscape={!mutacion.isPending}
      showCloseButton={!mutacion.isPending}
    >
      <Modal.Header>{unidad ? 'Editar carrera o unidad' : 'Nueva carrera o unidad'}</Modal.Header>
      <Form form={form} onSubmit={guardar} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          {catalogosFallidos ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-mercury-600">
                No se pudieron cargar los tipos y las sedes. Sin estos datos no es posible guardar
                el registro.
              </p>
              <Button variant="secondary" onClick={reintentarCatalogos}>
                Reintentar
              </Button>
            </div>
          ) : (
            <UnidadCampos tipos={tipos} sedes={sedes} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrar} disabled={mutacion.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={mutacion.isPending}
            disabled={!catalogosCargados}
          >
            {unidad ? 'Guardar cambios' : 'Crear registro'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
