import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { API_BASE_URL } from '@/config/env'
import { CLAVE_SIMULADA, MOCK_CSRF_TOKEN, createMockSesion } from '@/mocks/data/auth.mock'
import { leerCuerpo, responderError } from '@/mocks/handlers/respuestas'
import {
  cerrarSesionSimulada,
  iniciarSesionSimulada,
  obtenerSesionSimulada,
} from '@/mocks/handlers/sesion.estado'
import { buscarUsuario, obtenerUsuarios } from '@/mocks/handlers/usuarios.estado'
import type { AuthSession, Usuario as UsuarioDeSesion } from '@/features/auth/types'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const RUTA = `${API_BASE_URL}/auth`

const credencialesSchema = z.object({
  email_intento: z.string(),
  password: z.string(),
})

function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase()
}

function tieneCorreo(correo: string | null, buscado: string): boolean {
  return correo !== null && normalizarCorreo(correo) === buscado
}

function buscarPorCorreo(correo: string): Usuario | undefined {
  const buscado = normalizarCorreo(correo)

  return obtenerUsuarios().find(
    (usuario) =>
      tieneCorreo(usuario.emailInstitucional, buscado) ||
      tieneCorreo(usuario.emailEstudiantil, buscado),
  )
}

function construirSesion(usuarioDeSesion: UsuarioDeSesion, usuario: Usuario): AuthSession {
  return {
    usuario: { ...usuarioDeSesion, foto_url: usuario.fotoUrl, portada: usuario.portada },
    sesion: createMockSesion(),
    csrf_token: MOCK_CSRF_TOKEN,
    roles: usuario.roles.map((rol) => ({ id: rol.id, nombre: rol.nombre })),
  }
}

function sesionVigente(): AuthSession | null {
  const usuarioDeSesion = obtenerSesionSimulada()
  if (usuarioDeSesion === null) return null

  const usuario = buscarUsuario(usuarioDeSesion.run)

  if (!usuario) {
    cerrarSesionSimulada()
    return null
  }

  return construirSesion(usuarioDeSesion, usuario)
}

export const authHandlers = [
  http.post(`${RUTA}/login`, async ({ request }) => {
    const credenciales = credencialesSchema.safeParse(await leerCuerpo(request))

    if (!credenciales.success) {
      return responderError('Los datos enviados no son válidos', 422)
    }

    const usuario = buscarPorCorreo(credenciales.data.email_intento)

    if (!usuario || credenciales.data.password.trim() !== CLAVE_SIMULADA) {
      return responderError('Correo o contraseña incorrectos', 401)
    }

    if (!usuario.estaActivo) {
      return responderError('Tu cuenta está desactivada', 403)
    }

    return HttpResponse.json(construirSesion(iniciarSesionSimulada(usuario), usuario))
  }),

  http.post(`${RUTA}/logout`, () => {
    cerrarSesionSimulada()
    return HttpResponse.json({ message: 'Sesión cerrada' })
  }),

  http.get(`${RUTA}/me`, () => {
    const sesion = sesionVigente()
    return sesion ? HttpResponse.json(sesion) : responderError('No autenticado', 401)
  }),

  http.get(`${RUTA}/heartbeat`, () => {
    const sesion = sesionVigente()

    return sesion
      ? HttpResponse.json({ sesion: sesion.sesion, csrf_token: sesion.csrf_token })
      : responderError('Autenticación requerida', 401)
  }),

  http.get(`${RUTA}/csrf-token`, () => HttpResponse.json({ csrf_token: MOCK_CSRF_TOKEN })),
]
