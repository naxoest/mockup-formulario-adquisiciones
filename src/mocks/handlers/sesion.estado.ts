import { usuarioSchema } from '@/features/auth/sesionSchema'
import { buscarUsuario } from '@/mocks/handlers/usuarios.estado'
import type { Usuario as UsuarioDeSesion } from '@/features/auth/types'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

export const CLAVE_SESION_SIMULADA = 'simulacion:sesion'

let usuarioDeSesion: UsuarioDeSesion | null = null
let persistente = false

function persistir(): void {
  if (!persistente) return

  if (usuarioDeSesion === null) {
    sessionStorage.removeItem(CLAVE_SESION_SIMULADA)
    return
  }

  sessionStorage.setItem(CLAVE_SESION_SIMULADA, JSON.stringify(usuarioDeSesion))
}

function leerSesionGuardada(texto: string): UsuarioDeSesion | null {
  let valor: unknown

  try {
    valor = JSON.parse(texto)
  } catch {
    return null
  }

  const resultado = usuarioSchema.safeParse(valor)
  return resultado.success ? resultado.data : null
}

export function habilitarPersistenciaDeSesion(): void {
  persistente = true

  const guardada = sessionStorage.getItem(CLAVE_SESION_SIMULADA)
  if (guardada === null) return

  usuarioDeSesion = leerSesionGuardada(guardada)
  persistir()
}

export function restablecerSesion(): void {
  usuarioDeSesion = null
  persistente = false

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CLAVE_SESION_SIMULADA)
  }
}

export function obtenerSesionSimulada(): UsuarioDeSesion | null {
  return usuarioDeSesion
}

export function iniciarSesionSimulada(usuario: Usuario): UsuarioDeSesion {
  const instantanea: UsuarioDeSesion = {
    run: usuario.run,
    digito_verificador: usuario.digitoVerificador,
    email_institucional: usuario.emailInstitucional,
    email_estudiantil: usuario.emailEstudiantil,
    nombres: usuario.nombres,
    apellido_paterno: usuario.apellidoPaterno,
    apellido_materno: usuario.apellidoMaterno,
    es_estudiante: usuario.esEstudiante,
    foto_url: usuario.fotoUrl,
    portada: usuario.portada,
  }

  usuarioDeSesion = instantanea
  persistir()

  return instantanea
}

export function iniciarSesionSimuladaPorRun(run: number): UsuarioDeSesion {
  const usuario = buscarUsuario(run)

  if (!usuario) {
    throw new Error(`No existe un usuario simulado con RUN ${run}`)
  }

  return iniciarSesionSimulada(usuario)
}

export function cerrarSesionSimulada(): void {
  usuarioDeSesion = null
  persistir()
}
