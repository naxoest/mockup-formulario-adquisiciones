import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editarSolicitud } from '@/features/transacciones/api/solicitudes'
import type { SolicitudEdicionRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useEditarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: SolicitudEdicionRequest }) =>
      editarSolicitud(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
