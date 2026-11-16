import { fromCivilDate } from '@/utils/date'
import { parseRun } from '@/utils/run'
import type { PersonName } from '@/utils/personName'
import type {
  UsuarioCreacionValues,
  UsuarioEdicionValues,
} from '@/features/usuarios/schemas/usuario.schema'
import type {
  AsignacionesUsuario,
  Rol,
  Usuario,
  UsuarioCreacionRequest,
  UsuarioEdicionRequest,
} from '@/features/usuarios/types/usuario.types'

export const CAMPOS_EDICION = [
  'nombres',
  'apellidoPaterno',
  'apellidoMaterno',
  'emailInstitucional',
  'roles',
] as const

export const CAMPOS_CREACION = ['run', ...CAMPOS_EDICION] as const

export function esCampoEdicion(campo: string): campo is keyof UsuarioEdicionValues {
  return (CAMPOS_EDICION as readonly string[]).includes(campo)
}

export function esCampoCreacion(campo: string): campo is keyof UsuarioCreacionValues {
  return (CAMPOS_CREACION as readonly string[]).includes(campo)
}

export function nombreDeUsuario(usuario: Usuario): PersonName {
  return {
    givenNames: usuario.nombres,
    paternalSurname: usuario.apellidoPaterno,
    maternalSurname: usuario.apellidoMaterno,
  }
}

const formatoFechaDeRegistro = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' })

export function formatearFechaDeRegistro(fechaHora: string): string {
  return formatoFechaDeRegistro.format(fromCivilDate(fechaHora.slice(0, 10)))
}

export function construirValoresEdicion(usuario: Usuario): UsuarioEdicionValues {
  return {
    nombres: usuario.nombres,
    apellidoPaterno: usuario.apellidoPaterno,
    apellidoMaterno: usuario.apellidoMaterno,
    emailInstitucional: usuario.emailInstitucional ?? '',
    roles: usuario.roles.map((rol) => String(rol.id)),
  }
}

export function construirPeticionEdicion(valores: UsuarioEdicionValues): UsuarioEdicionRequest {
  return {
    emailInstitucional: valores.emailInstitucional === '' ? null : valores.emailInstitucional,
    nombres: valores.nombres,
    apellidoPaterno: valores.apellidoPaterno,
    apellidoMaterno: valores.apellidoMaterno,
    roles: valores.roles.map(Number),
  }
}

export function construirPeticionCreacion(valores: UsuarioCreacionValues): UsuarioCreacionRequest {
  const identificador = parseRun(valores.run)

  if (identificador === null) {
    throw new Error('El RUN no pudo interpretarse pese a haber superado la validación')
  }

  return {
    run: identificador.run,
    digitoVerificador: identificador.verifier,
    emailInstitucional: valores.emailInstitucional,
    emailEstudiantil: null,
    nombres: valores.nombres,
    apellidoPaterno: valores.apellidoPaterno,
    apellidoMaterno: valores.apellidoMaterno,
    esEstudiante: false,
    roles: valores.roles.map(Number),
  }
}

const ROL_ANALISTA = 'analista'

function enTransacciones(cantidad: number): string {
  return cantidad === 1 ? '1 transacción' : `${cantidad} transacciones`
}

export function describirAsignaciones(asignaciones: AsignacionesUsuario): string | null {
  const partes: string[] = []

  if (asignaciones.principal > 0) {
    partes.push(`analista principal en ${enTransacciones(asignaciones.principal)}`)
  }

  if (asignaciones.apoyo > 0) {
    partes.push(`analista de apoyo en ${enTransacciones(asignaciones.apoyo)}`)
  }

  return partes.length === 0 ? null : `Es ${partes.join(' y ')}.`
}

export function pierdeRolAnalista(rolesActuales: Rol[], rolesSeleccionados: string[]): boolean {
  const rolAnalista = rolesActuales.find((rol) => rol.nombre === ROL_ANALISTA)
  return rolAnalista !== undefined && !rolesSeleccionados.includes(String(rolAnalista.id))
}
