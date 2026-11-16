import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reemplazarMontosOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { MontosOrdenDeCompraRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useReemplazarMontosOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: MontosOrdenDeCompraRequest }) =>
      reemplazarMontosOrdenDeCompra(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
