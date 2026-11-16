import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eliminarSolicitud } from '@/features/transacciones/api/solicitudes'

export function useEliminarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarSolicitud(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
