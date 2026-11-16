export interface Rol {
  id: number
  nombre: string
}

export interface Usuario {
  run: number
  digitoVerificador: string
  emailInstitucional: string | null
  emailEstudiantil: string | null
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  esEstudiante: boolean
  estaActivo: boolean
  fotoUrl: string | null
  portada: string | null
  creadoEn: string
  actualizadoEn: string
  roles: Rol[]
}

export interface UsuarioCreacionRequest {
  run: number
  digitoVerificador: string
  emailInstitucional: string | null
  emailEstudiantil: string | null
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  esEstudiante: boolean
  roles: number[]
}

export type UsuarioEdicionRequest = Pick<
  UsuarioCreacionRequest,
  'emailInstitucional' | 'nombres' | 'apellidoPaterno' | 'apellidoMaterno' | 'roles'
>

export interface AsignacionesUsuario {
  principal: number
  apoyo: number
}
