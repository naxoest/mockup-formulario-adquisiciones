import { portadaPerfilResponseSchema } from '@/features/usuarios/schemas/portadaPerfilResponse.schema'
import { apiClient, apiClientNoContent } from '@/lib/apiClient'

const RUTA = '/api/perfil/portada'

export async function elegirPortada(clave: string): Promise<string> {
  const datos = await apiClient<unknown>(RUTA, { method: 'PUT', body: { portada: clave } })
  return portadaPerfilResponseSchema.parse(datos).portada
}

export async function quitarPortada(): Promise<void> {
  await apiClientNoContent(RUTA, { method: 'DELETE' })
}
