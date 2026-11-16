import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionarOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { ObservacionOpcionalRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useRecepcionarOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos?: ObservacionOpcionalRequest }) =>
      recepcionarOrdenDeCompra(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
