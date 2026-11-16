import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authSessionKey } from '@/features/auth/session'
import { elegirPortada, quitarPortada } from '@/features/usuarios/api/portadaPerfil'

export function usePortadaPerfil() {
  const queryClient = useQueryClient()

  const refrescarDatos = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: authSessionKey }),
      queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    ])
  }

  const elegir = useMutation({
    mutationFn: elegirPortada,
    onSuccess: async () => {
      await refrescarDatos()
      toast.success('Portada actualizada')
    },
  })

  const quitar = useMutation({
    mutationFn: quitarPortada,
    onSuccess: async () => {
      await refrescarDatos()
      toast.success('Portada quitada')
    },
  })

  return { elegir, quitar }
}
