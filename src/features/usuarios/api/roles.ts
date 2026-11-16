import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { rolesResponseSchema } from '@/features/usuarios/schemas/rolResponse.schema'

export const rolesQueryOptions = queryOptions({
  queryKey: ['roles'],
  queryFn: async () => {
    const datos = await apiClient<unknown>('/api/usuarios/roles')
    return rolesResponseSchema.parse(datos)
  },
})
