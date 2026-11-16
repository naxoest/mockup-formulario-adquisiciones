import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import {
  paginaUsuariosResponseSchema,
  usuarioResponseSchema,
} from '@/features/usuarios/schemas/usuarioResponse.schema'
import { asignacionesUsuarioResponseSchema } from '@/features/usuarios/schemas/asignacionesUsuarioResponse.schema'
import type {
  AsignacionesUsuario,
  Usuario,
  UsuarioCreacionRequest,
  UsuarioEdicionRequest,
} from '@/features/usuarios/types/usuario.types'

const USUARIOS_POR_PAGINA = 100

async function pedirPaginaUsuarios(pagina: number) {
  const parametros = new URLSearchParams({
    pagina: String(pagina),
    por_pagina: String(USUARIOS_POR_PAGINA),
  })
  const datos = await apiClient<unknown>(`/api/usuarios?${parametros.toString()}`)
  return paginaUsuariosResponseSchema.parse(datos)
}

export async function obtenerTodosLosUsuarios(): Promise<Usuario[]> {
  const primera = await pedirPaginaUsuarios(1)
  const totalPaginas = Math.ceil(primera.paginacion.total / primera.paginacion.por_pagina)

  const restantes = await Promise.all(
    Array.from({ length: Math.max(totalPaginas - 1, 0) }, (_, indice) =>
      pedirPaginaUsuarios(indice + 2),
    ),
  )

  const porRun = new Map<number, Usuario>()

  for (const pagina of [primera, ...restantes]) {
    for (const usuario of pagina.datos) {
      porRun.set(usuario.run, usuario)
    }
  }

  return [...porRun.values()]
}

export const usuariosQueryOptions = queryOptions({
  queryKey: ['usuarios'],
  queryFn: obtenerTodosLosUsuarios,
})

export function usuarioQueryOptions(run: number) {
  return queryOptions({
    queryKey: ['usuarios', run],
    queryFn: async () => {
      const datos = await apiClient<unknown>(`/api/usuarios/${run}`)
      return usuarioResponseSchema.parse(datos)
    },
  })
}

export function asignacionesUsuarioQueryOptions(run: number) {
  return queryOptions({
    queryKey: ['usuarios', run, 'asignaciones'],
    queryFn: async (): Promise<AsignacionesUsuario> => {
      const datos = await apiClient<unknown>(`/api/usuarios/${run}/asignaciones`)
      return asignacionesUsuarioResponseSchema.parse(datos)
    },
  })
}

export async function crearUsuario(peticion: UsuarioCreacionRequest): Promise<Usuario> {
  const datos = await apiClient<unknown>('/api/usuarios', { method: 'POST', body: peticion })
  return usuarioResponseSchema.parse(datos)
}

export async function editarUsuario(
  run: number,
  peticion: UsuarioEdicionRequest,
): Promise<Usuario> {
  const datos = await apiClient<unknown>(`/api/usuarios/${run}`, {
    method: 'PATCH',
    body: peticion,
  })
  return usuarioResponseSchema.parse(datos)
}

export async function cambiarEstadoUsuario(run: number, activar: boolean): Promise<Usuario> {
  const accion = activar ? 'activar' : 'desactivar'
  const datos = await apiClient<unknown>(`/api/usuarios/${run}/${accion}`, { method: 'POST' })
  return usuarioResponseSchema.parse(datos)
}
