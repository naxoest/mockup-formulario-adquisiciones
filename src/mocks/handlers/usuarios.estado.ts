import type { Rol, Usuario } from '@/features/usuarios/types/usuario.types'
import { usuariosMock } from '@/mocks/data/usuarios.mock'

function clonarRol(rol: Rol): Rol {
  return {
    id: rol.id,
    nombre: rol.nombre,
  }
}

function clonarUsuario(usuario: Usuario): Usuario {
  return {
    run: usuario.run,
    digitoVerificador: usuario.digitoVerificador,
    emailInstitucional: usuario.emailInstitucional,
    emailEstudiantil: usuario.emailEstudiantil,
    nombres: usuario.nombres,
    apellidoPaterno: usuario.apellidoPaterno,
    apellidoMaterno: usuario.apellidoMaterno,
    esEstudiante: usuario.esEstudiante,
    estaActivo: usuario.estaActivo,
    fotoUrl: usuario.fotoUrl,
    portada: usuario.portada,
    creadoEn: usuario.creadoEn,
    actualizadoEn: usuario.actualizadoEn,
    roles: usuario.roles.map(clonarRol),
  }
}

let usuarios: Usuario[] = usuariosMock.map(clonarUsuario)

export function restablecerUsuarios(): void {
  usuarios = usuariosMock.map(clonarUsuario)
}

export function obtenerUsuarios(): Usuario[] {
  return usuarios
}

export function buscarUsuario(run: number): Usuario | undefined {
  return usuarios.find((usuario) => usuario.run === run)
}

export function agregarUsuario(usuario: Usuario): void {
  usuarios.push(usuario)
}

export function reemplazarUsuario(usuario: Usuario): void {
  usuarios = usuarios.map((actual) => (actual.run === usuario.run ? usuario : actual))
}
