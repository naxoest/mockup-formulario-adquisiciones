import { z } from 'zod'
import { rolResponseSchema } from './rolResponse.schema'

export const usuarioResponseSchema = z.object({
  run: z.number().int().positive(),
  digitoVerificador: z.string().length(1),
  emailInstitucional: z.string().nullable(),
  emailEstudiantil: z.string().nullable(),
  nombres: z.string(),
  apellidoPaterno: z.string(),
  apellidoMaterno: z.string(),
  esEstudiante: z.boolean(),
  estaActivo: z.boolean(),
  fotoUrl: z.string().nullable().default(null),
  portada: z.string().nullable().default(null),
  creadoEn: z.iso.datetime({ local: true }),
  actualizadoEn: z.iso.datetime({ local: true }),
  roles: z.array(rolResponseSchema),
})

export const paginaUsuariosResponseSchema = z.object({
  datos: z.array(usuarioResponseSchema),
  paginacion: z.object({
    pagina: z.number().int().positive(),
    por_pagina: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
})
