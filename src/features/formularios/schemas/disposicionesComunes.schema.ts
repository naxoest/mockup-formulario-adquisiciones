import { z } from 'zod'
import {
  GARANTIA_MINIMA_LICITACION_MESES,
  MULTA_DIARIA_ESTANDAR,
  PLAZO_PAGO_ESTANDAR_DIAS,
  TOPE_DIAS_MULTA_ESTANDAR,
} from '@/features/formularios/utils/reglasLicitacion'
import { isValidRun } from '@/utils/run'

export const tipoSolicitudEdelfosSchema = z.enum(['SASERVI', 'SASERDIR', 'SAEXIST', 'SABIENES'], {
  error: 'Seleccione el tipo de solicitud E-delfos',
})

export const runChilenoSchema = z
  .string()
  .trim()
  .min(1, 'Ingrese el RUN o RUT')
  .refine((valor) => isValidRun(valor), {
    error: 'Ingrese un RUN o RUT válido (ej. 12.345.678-5)',
  })

export const coordinadorFormSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'Ingrese el nombre completo del coordinador')
    .max(120, 'Máximo 120 caracteres'),
  run: runChilenoSchema,
  correo: z.email({ error: 'Ingrese un correo institucional válido' }),
  cargo: z
    .string()
    .trim()
    .min(2, 'Ingrese el cargo del coordinador')
    .max(100, 'Máximo 100 caracteres'),
  crCodigo: z
    .number({ error: 'Ingrese el código del CR' })
    .int('El código CR debe ser entero')
    .positive('Ingrese un código CR mayor a cero')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el código del Centro de Responsabilidad',
    }),
  crNombre: z
    .string()
    .trim()
    .min(3, 'Ingrese el nombre del Centro de Responsabilidad')
    .max(150, 'Máximo 150 caracteres'),
})

export const disposicionesFormSchema = z.object({
  porcentajeMultaDiaria: z
    .number({ error: 'Ingrese el porcentaje de multa diaria' })
    .min(0.1, 'El porcentaje mínimo es 0,1%')
    .max(5, 'El porcentaje máximo es 5%')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el porcentaje de multa diaria (estándar 0,5%)',
    }),
  topeDiasMulta: z
    .number({ error: 'Ingrese el tope de días de multa' })
    .int('Ingrese días enteros')
    .min(1, 'Mínimo 1 día')
    .max(60, 'Máximo 60 días')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el tope de días (estándar 20 días)',
    }),
  topePorcentajeContrato: z.enum(['10', '20'], {
    error: 'Seleccione el tope porcentual sobre el contrato',
  }),
  plazoPagoDias: z
    .number({ error: 'Ingrese el plazo de pago' })
    .int('Ingrese días enteros')
    .min(1, 'Mínimo 1 día')
    .max(90, 'Máximo 90 días')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el plazo de pago en días (estándar 30 días)',
    }),
  aceptaTerminoAnticipadoArt130: z.boolean().refine((valor) => valor === true, {
    error: 'Debe confirmar la cláusula de término anticipado (Art. 130 Reglamento Ley 19.886)',
  }),
})

export const cabeceraComunFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, 'Ingrese un nombre o título descriptivo para la compra')
    .max(200, 'Máximo 200 caracteres'),
  codigoEdelfos: z
    .string()
    .trim()
    .min(3, 'Ingrese el código de solicitud E-delfos')
    .max(40, 'Máximo 40 caracteres'),
  tipoSolicitud: tipoSolicitudEdelfosSchema,
  montoEstimadoClp: z
    .number({ error: 'Ingrese el monto estimado en CLP' })
    .int('Ingrese un monto sin decimales')
    .positive('El monto estimado debe ser mayor a cero')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el monto estimado en CLP',
    }),
  coordinador: coordinadorFormSchema,
  disposiciones: disposicionesFormSchema,
})

export const VALORES_INICIALES_DISPOSICIONES = {
  porcentajeMultaDiaria: MULTA_DIARIA_ESTANDAR,
  topeDiasMulta: TOPE_DIAS_MULTA_ESTANDAR,
  topePorcentajeContrato: '20' as const,
  plazoPagoDias: PLAZO_PAGO_ESTANDAR_DIAS,
  aceptaTerminoAnticipadoArt130: true,
}

export const GARANTIA_MINIMA_DEFAULT = GARANTIA_MINIMA_LICITACION_MESES
