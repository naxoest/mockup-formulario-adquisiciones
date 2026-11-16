import { z } from 'zod'

export const usuarioSchema = z.object({
  run: z.int(),
  digito_verificador: z.string(),
  email_institucional: z.string().nullable(),
  email_estudiantil: z.string().nullable(),
  nombres: z.string(),
  apellido_paterno: z.string(),
  apellido_materno: z.string(),
  es_estudiante: z.boolean(),
  foto_url: z.string().nullable().default(null),
  portada: z.string().nullable().default(null),
})

export const rolSchema = z.object({
  id: z.int(),
  nombre: z.string(),
})

export const sesionSchema = z.object({
  remaining_seconds: z.number(),
  should_warn: z.boolean(),
})

export const authSessionSchema = z.object({
  usuario: usuarioSchema,
  sesion: sesionSchema,
  csrf_token: z.string(),
  roles: z.array(rolSchema),
})

export const heartbeatResponseSchema = z.object({
  sesion: sesionSchema,
  csrf_token: z.string(),
})
