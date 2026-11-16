import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authSessionKey } from '@/features/auth/session'
import { eliminarFotoPerfil, subirFotoPerfil } from '@/features/usuarios/api/fotoPerfil'

export function useFotoPerfil() {
  const queryClient = useQueryClient()

  const refrescarDatos = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: authSessionKey }),
      queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    ])
  }

  const subir = useMutation({
    mutationFn: subirFotoPerfil,
    onSuccess: async () => {
      await refrescarDatos()
      toast.success('Foto de perfil actualizada')
    },
  })

  const quitar = useMutation({
    mutationFn: eliminarFotoPerfil,
    onSuccess: async () => {
      await refrescarDatos()
      toast.success('Foto de perfil eliminada')
    },
  })

  return { subir, quitar }
}
