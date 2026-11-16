import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { ObservacionRequeridaRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useCancelarOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ObservacionRequeridaRequest }) =>
      cancelarOrdenDeCompra(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
