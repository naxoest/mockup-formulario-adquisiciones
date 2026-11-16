import { apiClient, setCsrfToken } from '@/lib/apiClient'
import { authSessionSchema, heartbeatResponseSchema } from '@/features/auth/sesionSchema'
import type {
  AuthSession,
  CsrfTokenResponse,
  HeartbeatResponse,
  LoginCredentials,
  LogoutResponse,
} from '@/features/auth/types'

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiClient<unknown>('/auth/login', {
    method: 'POST',
    body: credentials,
  })
  const session = authSessionSchema.parse(response)
  setCsrfToken(session.csrf_token)
  return session
}

export async function logout(): Promise<LogoutResponse> {
  const response = await apiClient<LogoutResponse>('/auth/logout', {
    method: 'POST',
  })
  setCsrfToken(null)
  return response
}

export async function getMe(): Promise<AuthSession> {
  const session = authSessionSchema.parse(await apiClient<unknown>('/auth/me'))
  setCsrfToken(session.csrf_token)
  return session
}

export async function heartbeat(): Promise<HeartbeatResponse> {
  const response = heartbeatResponseSchema.parse(await apiClient<unknown>('/auth/heartbeat'))
  setCsrfToken(response.csrf_token)
  return response
}

export async function getCsrfToken(): Promise<CsrfTokenResponse> {
  const response = await apiClient<CsrfTokenResponse>('/auth/csrf-token')
  setCsrfToken(response.csrf_token)
  return response
}
