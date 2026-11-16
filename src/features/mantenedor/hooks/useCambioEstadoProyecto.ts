import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/Modal'
import {
  cambiarEstadoProyecto,
  invalidarDatosDeProyectos,
} from '@/features/mantenedor/api/proyectos'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

const MENSAJE_ACTIVACION = 'Volverá a estar disponible para asociarlo a solicitudes de compra.'

const MENSAJE_DESACTIVACION =
  'No podrá elegirse en solicitudes nuevas. Sus datos asociados se conservan y puede reactivarlo en cualquier momento.'

export function useCambioEstadoProyecto() {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()

  const mutacion = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cambiarEstadoProyecto(id, activar),
    onSuccess: (proyecto) => {
      void invalidarDatosDeProyectos(queryClient)
      toast.success(proyecto.activo ? 'Proyecto activado' : 'Proyecto desactivado')
    },
  })

  const cambiarEstado = async (proyecto: Proyecto, activar: boolean) => {
    await confirmar({
      title: activar ? `Activar ${proyecto.nombre}` : `Desactivar ${proyecto.nombre}`,
      message: activar ? MENSAJE_ACTIVACION : MENSAJE_DESACTIVACION,
      variant: activar ? 'info' : 'error',
      confirmText: activar ? 'Activar proyecto' : 'Desactivar proyecto',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await mutacion.mutateAsync({ id: proyecto.id, activar })
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'No se pudo cambiar el estado del proyecto',
          )
        }
      },
    })
  }

  return { cambiarEstado }
}
