import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/Modal'
import { authSessionKey } from '@/features/auth/session'
import { quitarFotoDeUsuario } from '@/features/usuarios/api/fotoPerfil'
import { nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { formatFullName } from '@/utils/personName'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

export function useQuitarFotoDeUsuario() {
  const queryClient = useQueryClient()
  const confirmar = useConfirm()

  const mutacion = useMutation({
    mutationFn: quitarFotoDeUsuario,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
        queryClient.invalidateQueries({ queryKey: authSessionKey }),
      ])
      toast.success('Foto quitada')
    },
  })

  const quitarFoto = async (usuario: Usuario) => {
    const nombre = formatFullName(nombreDeUsuario(usuario))

    await confirmar({
      title: `Quitar la foto de ${nombre}`,
      message:
        'La foto dejará de mostrarse y en su lugar aparecerán las iniciales. La persona podrá subir otra.',
      variant: 'warning',
      confirmText: 'Quitar foto',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await mutacion.mutateAsync(usuario.run)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'No se pudo quitar la foto')
        }
      },
    })
  }

  return { quitarFoto }
}
