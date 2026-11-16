import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editarOrdenDeCompra } from '@/features/transacciones/api/ordenesDeCompra'
import type { OrdenDeCompraEdicionRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useEditarOrdenDeCompra() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: OrdenDeCompraEdicionRequest }) =>
      editarOrdenDeCompra(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
