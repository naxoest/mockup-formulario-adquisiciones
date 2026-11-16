import { z } from 'zod'
import { isValidRun } from '@/utils/run'

const formatoCorreo = z.email()

function correoInstitucional(admiteVacio: boolean) {
  return z
    .string()
    .max(254, 'Máximo 254 caracteres')
    .refine((valor) => admiteVacio || valor !== '', { error: 'Ingrese el correo institucional' })
    .refine((valor) => valor === '' || formatoCorreo.safeParse(valor).success, {
      error: 'Ingrese un correo válido',
    })
}

const nombres = z.string().trim().min(1, 'Ingrese los nombres').max(50, 'Máximo 50 caracteres')

const apellidoPaterno = z
  .string()
  .trim()
  .min(1, 'Ingrese el apellido paterno')
  .max(50, 'Máximo 50 caracteres')

const apellidoMaterno = z
  .string()
  .trim()
  .min(1, 'Ingrese el apellido materno')
  .max(50, 'Máximo 50 caracteres')

const roles = z.array(z.string().regex(/^\d+$/, 'Identificador de rol inválido'))

export const usuarioCreacionSchema = z.object({
  run: z
    .string()
    .trim()
    .min(1, 'Ingrese el RUN')
    .refine(isValidRun, { error: 'El RUN ingresado no es válido' }),
  nombres,
  apellidoPaterno,
  apellidoMaterno,
  emailInstitucional: correoInstitucional(false),
  roles,
})

export function crearUsuarioEdicionSchema(admiteSinCorreoInstitucional: boolean) {
  return z.object({
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    emailInstitucional: correoInstitucional(admiteSinCorreoInstitucional),
    roles,
  })
}

export const usuarioEdicionSchema = crearUsuarioEdicionSchema(false)

export type UsuarioCreacionValues = z.infer<typeof usuarioCreacionSchema>
export type UsuarioEdicionValues = z.infer<typeof usuarioEdicionSchema>
