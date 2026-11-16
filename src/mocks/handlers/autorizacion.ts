import { responderError } from '@/mocks/handlers/respuestas'
import { obtenerSesionSimulada } from '@/mocks/handlers/sesion.estado'
import { buscarUsuario } from '@/mocks/handlers/usuarios.estado'
import { participacionDe } from '@/mocks/handlers/analistas.derivacion'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

type Autorizacion = { usuario: Usuario; rechazo: null } | { usuario: null; rechazo: Response }

export function usuarioEnSesion(): Usuario | undefined {
  const sesion = obtenerSesionSimulada()
  return sesion === null ? undefined : buscarUsuario(sesion.run)
}

export function esAdministrador(usuario: Usuario): boolean {
  return usuario.roles.some((rol) => rol.nombre === 'administrador')
}

export function autorizarAdministrador(): Autorizacion {
  const usuario = usuarioEnSesion()

  if (!usuario) {
    return { usuario: null, rechazo: responderError('Autenticación requerida', 401) }
  }

  if (!esAdministrador(usuario)) {
    return {
      usuario: null,
      rechazo: responderError('No tienes permisos para realizar esta acción', 403),
    }
  }

  return { usuario, rechazo: null }
}

export function exigirAdministrador(): Response | null {
  return autorizarAdministrador().rechazo
}

const ROLES_CON_ACCESO_A_TRANSACCIONES = ['administrador', 'analista']

export function autorizarTransacciones(): Autorizacion {
  const usuario = usuarioEnSesion()

  if (!usuario) {
    return { usuario: null, rechazo: responderError('Autenticación requerida', 401) }
  }

  const tieneAcceso = usuario.roles.some((rol) =>
    ROLES_CON_ACCESO_A_TRANSACCIONES.includes(rol.nombre),
  )

  if (!tieneAcceso) {
    return {
      usuario: null,
      rechazo: responderError('No tienes permisos para realizar esta acción', 403),
    }
  }

  return { usuario, rechazo: null }
}

export function puedeVerTransaccion(usuario: Usuario, transaccionId: number): boolean {
  return esAdministrador(usuario) || participacionDe(transaccionId, usuario.run) !== null
}
