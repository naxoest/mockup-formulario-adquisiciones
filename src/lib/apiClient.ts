import { API_BASE_URL } from '@/config/env'
import { parseContentDispositionFilename } from '@/utils/contentDisposition'

export interface ApiErrorPayload {
  error: string
  code?: string
  field?: string
}

export const FORBIDDEN_ROLE_CODE = 'FORBIDDEN_ROLE'

const FORBIDDEN_ROLE_MESSAGE = 'No tiene permisos para realizar esta acción.'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly field?: string

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.error)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code
    this.field = payload.field
  }
}

let csrfToken: string | null = null

export function setCsrfToken(token: string | null) {
  csrfToken = token
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface BinaryBody {
  data: ArrayBuffer
  contentType: string
}

interface JsonRequestOptions {
  method?: HttpMethod
  body?: unknown
  binary?: never
}

interface BinaryRequestOptions {
  method?: HttpMethod
  binary: BinaryBody
  body?: never
}

type ApiClientOptions = JsonRequestOptions | BinaryRequestOptions

interface EncodedBody {
  body: BodyInit
  contentType: string
}

function encodeBody(options: ApiClientOptions): EncodedBody | null {
  if (options.binary !== undefined) {
    return { body: options.binary.data, contentType: options.binary.contentType }
  }

  if (options.body !== undefined) {
    return { body: JSON.stringify(options.body), contentType: 'application/json' }
  }

  return null
}

export interface ApiFile {
  blob: Blob
  filename: string | null
}

async function request(path: string, options: ApiClientOptions = {}): Promise<Response> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {}
  const encoded = encodeBody(options)

  if (encoded !== null) {
    headers['Content-Type'] = encoded.contentType
  }

  if (csrfToken !== null && method !== 'GET') {
    headers['X-CSRF-Token'] = csrfToken
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: encoded?.body,
  })

  if (!response.ok) {
    const payload = await parseErrorPayload(response)
    throw new ApiError(response.status, normalizeErrorPayload(path, response.status, payload))
  }

  return response
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const response = await request(path, options)
  return (await response.json()) as T
}

export async function apiClientFile(path: string): Promise<ApiFile> {
  const response = await request(path)

  return {
    blob: await response.blob(),
    filename: parseContentDispositionFilename(response.headers.get('Content-Disposition')),
  }
}

export async function apiClientNoContent(
  path: string,
  options: ApiClientOptions = {},
): Promise<void> {
  await request(path, options)
}

function normalizeErrorPayload(
  path: string,
  status: number,
  payload: ApiErrorPayload,
): ApiErrorPayload {
  if (status === 403 && payload.code === undefined && path.startsWith('/api/')) {
    return { ...payload, error: FORBIDDEN_ROLE_MESSAGE, code: FORBIDDEN_ROLE_CODE }
  }

  return payload
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload> {
  const fallback: ApiErrorPayload = { error: 'Respuesta inesperada del servidor' }

  try {
    const data: unknown = await response.json()

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
    ) {
      return data as ApiErrorPayload
    }

    return fallback
  } catch {
    return fallback
  }
}
