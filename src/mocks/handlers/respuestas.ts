import { HttpResponse } from 'msw'
import type { ZodError } from 'zod'

export function responderError(mensaje: string, status: number, code?: string, field?: string) {
  return HttpResponse.json({ error: mensaje, code, field }, { status })
}

export async function leerCuerpo(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export function responderCuerpoInvalido(error: ZodError) {
  const problema = error.issues[0]

  return responderError(
    problema.message,
    400,
    'cuerpo_invalido',
    problema.path.map(String).join('.'),
  )
}
