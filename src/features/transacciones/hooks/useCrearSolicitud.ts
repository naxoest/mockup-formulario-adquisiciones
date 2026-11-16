import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearSolicitud } from '@/features/transacciones/api/solicitudes'
import type { SolicitudCreacionDirectaRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useCrearSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transaccionId,
      datos,
    }: {
      transaccionId: number
      datos: SolicitudCreacionDirectaRequest
    }) => crearSolicitud(transaccionId, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
