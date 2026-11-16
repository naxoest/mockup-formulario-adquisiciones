import type { Usuario } from '@/features/usuarios/types/usuario.types'

export const CLAVES_FILTRO = ['estado', 'rol'] as const

export type ClaveFiltro = (typeof CLAVES_FILTRO)[number]

type ExtractorFiltro = (usuario: Usuario) => string[]

const extractores: Record<ClaveFiltro, ExtractorFiltro> = {
  estado: (usuario) => [usuario.estaActivo ? 'activo' : 'inactivo'],
  rol: (usuario) => usuario.roles.map((rol) => String(rol.id)),
}

export function esClaveFiltro(clave: string): clave is ClaveFiltro {
  return (CLAVES_FILTRO as readonly string[]).includes(clave)
}

export function filtrarUsuarios(usuarios: Usuario[], valores: Record<string, string[]>): Usuario[] {
  const activos = Object.entries(valores).filter(
    (entrada): entrada is [ClaveFiltro, string[]] =>
      esClaveFiltro(entrada[0]) && entrada[1].length > 0,
  )

  if (activos.length === 0) {
    return usuarios
  }

  return usuarios.filter((usuario) =>
    activos.every(([clave, seleccionados]) =>
      extractores[clave](usuario).some((valor) => seleccionados.includes(valor)),
    ),
  )
}
