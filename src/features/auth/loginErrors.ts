import { CuentaSinAccesoError } from '@/features/auth/errores'
import { ApiError } from '@/lib/apiClient'
import type { LoginValues } from '@/features/auth/loginSchema'

interface FieldErrorMapping {
  field: keyof LoginValues
  message: string
}

interface LoginErrorResult {
  fieldError?: FieldErrorMapping
  formMessage?: string
}

const GENERIC_MESSAGE = 'No se pudo conectar con el servidor. Intente nuevamente.'

const TOO_MANY_ATTEMPTS_MESSAGE = 'Demasiados intentos fallidos. Intente nuevamente más tarde.'

const ACCOUNT_DISABLED_MESSAGE = 'Su cuenta está desactivada. Contacte al administrador.'

function isLoginField(value: string): value is keyof LoginValues {
  return value === 'email_intento' || value === 'password'
}

export function resolveLoginError(error: unknown): LoginErrorResult {
  if (error instanceof CuentaSinAccesoError) {
    return { formMessage: error.message }
  }

  if (!(error instanceof ApiError)) {
    return { formMessage: GENERIC_MESSAGE }
  }

  if (error.status === 422 && error.field && isLoginField(error.field)) {
    return { fieldError: { field: error.field, message: error.message } }
  }

  if (error.status === 401) {
    return { formMessage: error.message }
  }

  if (error.status === 429) {
    return { formMessage: TOO_MANY_ATTEMPTS_MESSAGE }
  }

  if (error.status === 403 && error.code === undefined) {
    return { formMessage: ACCOUNT_DISABLED_MESSAGE }
  }

  return { formMessage: GENERIC_MESSAGE }
}
