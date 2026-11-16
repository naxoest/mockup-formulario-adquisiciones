import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aceptarFactura } from '@/features/transacciones/api/facturas'
import type { ObservacionOpcionalRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useAceptarFactura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos?: ObservacionOpcionalRequest }) =>
      aceptarFactura(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
