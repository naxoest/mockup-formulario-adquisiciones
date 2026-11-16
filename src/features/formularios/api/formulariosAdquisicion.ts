import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
} from '@/features/formularios/types/formularioAdquisicion.types'
import type { NuevoFormularioPayload } from '@/features/formularios/utils/catalogosFormulario'
import { apiClient } from '@/lib/apiClient'

const CLAVE_QUERY_FORMULARIOS = ['formularios-adquisicion'] as const

export async function obtenerFormulariosAdquisicion(): Promise<FormularioAdquisicion[]> {
  return apiClient<FormularioAdquisicion[]>('/api/formularios-adquisicion')
}

export async function crearFormularioAdquisicion(
  payload: NuevoFormularioPayload,
): Promise<FormularioAdquisicion> {
  return apiClient<FormularioAdquisicion>('/api/formularios-adquisicion', {
    method: 'POST',
    body: payload,
  })
}

export async function cambiarEstadoFormularioAdquisicion(
  id: string,
  estado: EstadoFormularioAdquisicion,
): Promise<FormularioAdquisicion> {
  return apiClient<FormularioAdquisicion>(`/api/formularios-adquisicion/${id}/estado`, {
    method: 'PATCH',
    body: { estado },
  })
}

export const formulariosAdquisicionQueryOptions = queryOptions({
  queryKey: CLAVE_QUERY_FORMULARIOS,
  queryFn: obtenerFormulariosAdquisicion,
})

export function useCrearFormularioAdquisicion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearFormularioAdquisicion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLAVE_QUERY_FORMULARIOS })
    },
  })
}

export function useCambiarEstadoFormulario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoFormularioAdquisicion }) =>
      cambiarEstadoFormularioAdquisicion(id, estado),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLAVE_QUERY_FORMULARIOS })
    },
  })
}
