import { useMutation, useQueryClient } from '@tanstack/react-query'
import { iniciarProcesoSolicitud } from '@/features/transacciones/api/solicitudes'
import type { ObservacionOpcionalRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useIniciarProcesoSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos?: ObservacionOpcionalRequest }) =>
      iniciarProcesoSolicitud(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
