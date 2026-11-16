import { fotoPerfilResponseSchema } from '@/features/usuarios/schemas/fotoPerfilResponse.schema'
import { apiClient, apiClientNoContent } from '@/lib/apiClient'
import type { ImagenProcesada } from '@/features/usuarios/types/imagen.types'

const RUTA = '/api/perfil/foto'

export async function subirFotoPerfil(imagen: ImagenProcesada): Promise<string> {
  const datos = await apiClient<unknown>(RUTA, {
    method: 'PUT',
    binary: { data: imagen.datos, contentType: imagen.tipo },
  })
  return fotoPerfilResponseSchema.parse(datos).fotoUrl
}

export async function eliminarFotoPerfil(): Promise<void> {
  await apiClientNoContent(RUTA, { method: 'DELETE' })
}

export async function quitarFotoDeUsuario(run: number): Promise<void> {
  await apiClientNoContent(`/api/usuarios/${run}/foto`, { method: 'DELETE' })
}
