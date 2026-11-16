import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rechazarFactura } from '@/features/transacciones/api/facturas'
import type { ObservacionRequeridaRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useRechazarFactura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ObservacionRequeridaRequest }) =>
      rechazarFactura(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
