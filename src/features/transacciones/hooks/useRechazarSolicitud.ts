import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rechazarSolicitud } from '@/features/transacciones/api/solicitudes'
import type { ObservacionRequeridaRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useRechazarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ObservacionRequeridaRequest }) =>
      rechazarSolicitud(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
