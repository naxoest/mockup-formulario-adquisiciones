import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/Modal'
import {
  asignacionesUsuarioQueryOptions,
  cambiarEstadoUsuario,
} from '@/features/usuarios/api/usuarios'
import { describirAsignaciones, nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { formatFullName } from '@/utils/personName'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const MENSAJE_ACTIVACION = 'Recuperará el acceso al sistema de inmediato.'

const MENSAJE_DESACTIVACION =
  'No podrá volver a iniciar sesión. Si tiene una sesión abierta, esta continuará hasta que la cierre o expire. Sus roles y su historial se conservan, y puede reactivarlo en cualquier momento.'

const AVISO_DESACTIVACION =
  'Al desactivarlo, esas asignaciones terminarán y no se restaurarán si lo reactiva.'

export function useCambioEstadoUsuario() {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()

  const mutacion = useMutation({
    mutationFn: ({ run, activar }: { run: number; activar: boolean }) =>
      cambiarEstadoUsuario(run, activar),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] })

      if (!usuario.estaActivo) {
        void queryClient.invalidateQueries({ queryKey: ['transacciones'] })
        void queryClient.invalidateQueries({ queryKey: ['monitoreo'] })
      }

      toast.success(usuario.estaActivo ? 'Usuario activado' : 'Usuario desactivado')
    },
  })

  const mensajeDeDesactivacion = async (run: number) => {
    const asignaciones = await queryClient.fetchQuery(asignacionesUsuarioQueryOptions(run))
    const descripcion = describirAsignaciones(asignaciones)

    return descripcion === null
      ? MENSAJE_DESACTIVACION
      : `${MENSAJE_DESACTIVACION} ${descripcion} ${AVISO_DESACTIVACION}`
  }

  const cambiarEstado = async (usuario: Usuario, activar: boolean) => {
    const nombre = formatFullName(nombreDeUsuario(usuario))
    let mensaje = MENSAJE_ACTIVACION

    if (!activar) {
      try {
        mensaje = await mensajeDeDesactivacion(usuario.run)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'No se pudieron consultar las asignaciones del usuario',
        )
        return
      }
    }

    await confirmar({
      title: activar ? `Activar a ${nombre}` : `Desactivar a ${nombre}`,
      message: mensaje,
      variant: activar ? 'info' : 'error',
      confirmText: activar ? 'Activar usuario' : 'Desactivar usuario',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await mutacion.mutateAsync({ run: usuario.run, activar })
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : 'No se pudo cambiar el estado del usuario',
          )
        }
      },
    })
  }

  return { cambiarEstado }
}
