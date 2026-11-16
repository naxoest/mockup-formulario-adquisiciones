import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editarTransaccion } from '@/features/transacciones/api/transacciones'
import type { TransaccionEdicionRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useEditarTransaccion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: TransaccionEdicionRequest }) =>
      editarTransaccion(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
