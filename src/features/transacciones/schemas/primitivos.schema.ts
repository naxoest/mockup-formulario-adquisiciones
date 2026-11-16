import { z } from 'zod'

export const fechaCivilSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD')

export const opcionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

export const estadoEvaluacionSchema = z.enum([
  'sindefinir',
  'en_evaluacion',
  'evaluado',
  'norequiere',
])

export const LONGITUD_MAXIMA_NOMBRE_TRANSACCION = 255

export const LONGITUD_MAXIMA_ENLACE_CARPETA = 2048

const MENSAJE_ENLACE_CARPETA_INVALIDO =
  'Ingrese una dirección web válida que comience con https:// o http://'

const direccionWebSchema = z.httpUrl()

function esDireccionWeb(valor: string): boolean {
  return direccionWebSchema.safeParse(valor).success
}

export const nombreTransaccionSchema = z
  .string({ error: 'Ingrese el nombre de la transacción' })
  .trim()
  .min(1, 'Ingrese el nombre de la transacción')
  .max(
    LONGITUD_MAXIMA_NOMBRE_TRANSACCION,
    `El nombre no puede superar los ${LONGITUD_MAXIMA_NOMBRE_TRANSACCION} caracteres`,
  )

const enlaceCarpetaBaseSchema = z
  .string({ error: MENSAJE_ENLACE_CARPETA_INVALIDO })
  .trim()
  .max(
    LONGITUD_MAXIMA_ENLACE_CARPETA,
    `La dirección no puede superar los ${LONGITUD_MAXIMA_ENLACE_CARPETA} caracteres`,
  )

export const enlaceCarpetaSchema = enlaceCarpetaBaseSchema.refine(esDireccionWeb, {
  error: MENSAJE_ENLACE_CARPETA_INVALIDO,
})

export const enlaceCarpetaFormularioSchema = enlaceCarpetaBaseSchema.refine(
  (valor) => valor.length === 0 || esDireccionWeb(valor),
  { error: MENSAJE_ENLACE_CARPETA_INVALIDO },
)
