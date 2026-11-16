import { z } from 'zod'
import type { SiguientePermitido } from '@/features/transacciones/types/transaccion.types'

export function crearRegistroPasoSchema(siguientes: SiguientePermitido[]) {
  return z
    .object({
      paso: z.string(),
      fecha: z.date().nullable(),
      observacion: z.string(),
    })
    .superRefine((valores, ctx) => {
      const elegido = siguientes.find((siguiente) => siguiente.paso === valores.paso)

      if (elegido === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Seleccione el resultado del paso',
          path: ['paso'],
          input: valores.paso,
        })
      }

      if (valores.fecha === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Seleccione la fecha del hecho',
          path: ['fecha'],
          input: valores.fecha,
        })
      }

      if (elegido?.requiereObservacion === true && valores.observacion.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ingrese una observación',
          path: ['observacion'],
          input: valores.observacion,
        })
      }
    })
}

export type RegistroPasoValues = z.infer<ReturnType<typeof crearRegistroPasoSchema>>
