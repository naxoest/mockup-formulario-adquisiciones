import { useMutation, useQueryClient } from '@tanstack/react-query'
import { aceptarOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { ObservacionOpcionalRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useAceptarOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos?: ObservacionOpcionalRequest }) =>
      aceptarOrdenDeCompra(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
