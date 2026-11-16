import type { Usuario } from '@/features/usuarios/types/usuario.types'

export function nombreDeAnalista(usuario: Usuario): string {
  return `${usuario.nombres} ${usuario.apellidoPaterno}`
}
