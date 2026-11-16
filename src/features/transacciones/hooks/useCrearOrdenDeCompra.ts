import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { OrdenDeCompraCreacionRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useCrearOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transaccionId,
      datos,
    }: {
      transaccionId: number
      datos: OrdenDeCompraCreacionRequest
    }) => crearOrdenDeCompra(transaccionId, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
