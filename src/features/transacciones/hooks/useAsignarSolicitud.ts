import { useMutation, useQueryClient } from '@tanstack/react-query'
import { asignarSolicitud } from '@/features/transacciones/api/solicitudes'
import type { ObservacionOpcionalRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useAsignarSolicitud() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos?: ObservacionOpcionalRequest }) =>
      asignarSolicitud(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
