import { z } from 'zod'

export const loginSchema = z.object({
  email_intento: z
    .email({
      error: (issue) => {
        if (issue.input === '') {
          return 'Debe ingresar su correo institucional'
        }

        return 'El formato del correo institucional no es válido'
      },
    })
    .max(100, 'El correo institucional no puede exceder 100 caracteres'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginValues = z.infer<typeof loginSchema>
