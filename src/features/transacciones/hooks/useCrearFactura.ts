import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearFactura } from '@/features/transacciones/api/facturas'
import type { FacturaCreacionRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useCrearFactura() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transaccionId,
      datos,
    }: {
      transaccionId: number
      datos: FacturaCreacionRequest
    }) => crearFactura(transaccionId, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
