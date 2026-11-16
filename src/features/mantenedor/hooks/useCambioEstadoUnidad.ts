import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/Modal'
import {
  cambiarEstadoUnidadSolicitante,
  invalidarDatosDeUnidades,
} from '@/features/mantenedor/api/unidadesSolicitantes'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'

const MENSAJE_ACTIVACION = 'Volverá a estar disponible para registros nuevos.'

const MENSAJE_DESACTIVACION =
  'No podrá elegirse en registros nuevos. Sus datos asociados se conservan, y puede reactivarlo en cualquier momento.'

export function useCambioEstadoUnidad() {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()

  const mutacion = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cambiarEstadoUnidadSolicitante(id, activar),
    onSuccess: (unidad) => {
      void invalidarDatosDeUnidades(queryClient)
      toast.success(unidad.activo ? 'Registro activado' : 'Registro desactivado')
    },
  })

  const cambiarEstado = async (unidad: UnidadSolicitante, activar: boolean) => {
    await confirmar({
      title: activar ? `Activar ${unidad.nombre}` : `Desactivar ${unidad.nombre}`,
      message: activar ? MENSAJE_ACTIVACION : MENSAJE_DESACTIVACION,
      variant: activar ? 'info' : 'error',
      confirmText: activar ? 'Activar registro' : 'Desactivar registro',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await mutacion.mutateAsync({ id: unidad.id, activar })
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'No se pudo cambiar el estado del registro',
          )
        }
      },
    })
  }

  return { cambiarEstado }
}
