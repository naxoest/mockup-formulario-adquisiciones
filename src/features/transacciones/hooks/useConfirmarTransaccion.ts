import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmarTransaccion } from '@/features/transacciones/api/transacciones'

export function useConfirmarTransaccion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => confirmarTransaccion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
