const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!rawApiBaseUrl) {
  throw new Error('La variable de entorno VITE_API_BASE_URL no está definida')
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '')

export const ENABLE_API_MOCKING =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_API_MOCKING === 'true'

export const ENABLE_PROFILE_IMAGES = import.meta.env.VITE_ENABLE_PROFILE_IMAGES === 'true'
