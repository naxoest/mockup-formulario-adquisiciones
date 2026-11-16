import type { AuthSession, Rol, Sesion, Usuario } from '@/features/auth/types'

export const MOCK_CSRF_TOKEN = 'csrf-token-de-prueba'

export const CLAVE_SIMULADA = '123'

export function createMockUsuario(overrides: Partial<Usuario> = {}): Usuario {
  return {
    run: 12345678,
    digito_verificador: '5',
    email_institucional: 'ana.rojas@ejemplo.cl',
    email_estudiantil: null,
    nombres: 'Ana',
    apellido_paterno: 'Rojas',
    apellido_materno: 'Pérez',
    es_estudiante: false,
    foto_url: null,
    portada: null,
    ...overrides,
  }
}

export function createMockSesion(overrides: Partial<Sesion> = {}): Sesion {
  return {
    remaining_seconds: 1800,
    should_warn: false,
    ...overrides,
  }
}

export function createMockRol(overrides: Partial<Rol> = {}): Rol {
  return {
    id: 2,
    nombre: 'administrador',
    ...overrides,
  }
}

export function createMockAuthSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    usuario: createMockUsuario(),
    sesion: createMockSesion(),
    csrf_token: MOCK_CSRF_TOKEN,
    roles: [createMockRol()],
    ...overrides,
  }
}
