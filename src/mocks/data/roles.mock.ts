import type { Rol } from '@/features/usuarios/types/usuario.types'

export const rolAnalista: Rol = { id: 1, nombre: 'analista' }

export const rolAdministrador: Rol = { id: 2, nombre: 'administrador' }

export const rolSolicitante: Rol = { id: 3, nombre: 'solicitante' }

export const rolesMock: Rol[] = [rolAnalista, rolAdministrador, rolSolicitante]
