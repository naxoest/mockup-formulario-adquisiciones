import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearTransaccion } from '@/features/transacciones/api/transacciones'
import type { TransaccionBorradorRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'

export function useCrearTransaccion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: TransaccionBorradorRequest) => crearTransaccion(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
  })
}
