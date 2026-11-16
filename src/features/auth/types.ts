import type { z } from 'zod'
import type {
  authSessionSchema,
  heartbeatResponseSchema,
  rolSchema,
  sesionSchema,
  usuarioSchema,
} from '@/features/auth/sesionSchema'

export type Usuario = z.infer<typeof usuarioSchema>

export type Rol = z.infer<typeof rolSchema>

export type Sesion = z.infer<typeof sesionSchema>

export type AuthSession = z.infer<typeof authSessionSchema>

export type HeartbeatResponse = z.infer<typeof heartbeatResponseSchema>

export interface LoginCredentials {
  email_intento: string
  password: string
}

export interface LogoutResponse {
  message: string
}

export interface CsrfTokenResponse {
  csrf_token: string
}
