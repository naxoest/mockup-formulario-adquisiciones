import { z } from 'zod'

export const fechaCivilSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD')

export const instanteLocalSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
    'La marca temporal debe tener el formato AAAA-MM-DDTHH:MM:SS, sin zona horaria',
  )

export const opcionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

export const textoOpcionalSchema = z.string().min(1).nullable()

export const LONGITUD_MAXIMA_IDENTIFICADOR = 50

export const identificadorSchema = z
  .string()
  .trim()
  .min(1, 'El ítem es obligatorio')
  .max(
    LONGITUD_MAXIMA_IDENTIFICADOR,
    `El ítem no puede superar los ${LONGITUD_MAXIMA_IDENTIFICADOR} caracteres`,
  )
