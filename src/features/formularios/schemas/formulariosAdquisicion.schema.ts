import { z } from 'zod'
import { fileUploadItemSchema } from '@/components/ui/FileUpload'
import {
  cabeceraComunFormSchema,
  runChilenoSchema,
} from '@/features/formularios/schemas/disposicionesComunes.schema'
import {
  GARANTIA_MINIMA_LICITACION_MESES,
  calcularMontoUtm,
  obtenerFormalizacionForzada,
  obtenerMinimoComisionEvaluadora,
  sumarPonderacionesCriterios,
} from '@/features/formularios/utils/reglasLicitacion'

export const itemProductoFormSchema = z.object({
  descripcion: z.string().trim().min(3, 'Describa el producto requerido'),
  cantidad: z
    .number({ error: 'Ingrese la cantidad' })
    .int('Debe ser un entero')
    .positive('Mínimo 1 unidad')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
  unidadMedida: z.string().trim().min(1, 'Indique la unidad de medida (ej. Unidad, Caja)'),
  materialidad: z.string().trim().min(2, 'Especifique la materialidad o composición'),
  permiteEquivalentes: z.boolean(),
  mesesGarantia: z
    .number({ error: 'Ingrese los meses de garantía' })
    .int('Debe ser entero')
    .min(0, 'No puede ser negativo')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese los meses de garantía' }),
  requiereInstalacion: z.boolean(),
})

export const itemServicioFormSchema = z.object({
  nombreServicio: z.string().trim().min(3, 'Ingrese el nombre del servicio'),
  metodologiaExigida: z.string().trim().min(10, 'Describa la metodología requerida'),
  hitosPrincipales: z.string().trim().min(5, 'Detalle los hitos o entregables'),
  fechaInicioEstimada: z
    .date({ error: 'Seleccione la fecha estimada de inicio' })
    .nullable()
    .refine((valor): valor is Date => valor !== null, {
      error: 'Seleccione la fecha estimada de inicio',
    }),
  fechaTerminoEstimada: z
    .date({ error: 'Seleccione la fecha estimada de término' })
    .nullable()
    .refine((valor): valor is Date => valor !== null, {
      error: 'Seleccione la fecha estimada de término',
    }),
  normativasAplicables: z.string().trim().min(2, 'Indique las normativas aplicables'),
})

export const itemBibliografiaFormSchema = z.object({
  titulo: z.string().trim().min(2, 'Ingrese el título de la obra'),
  autor: z.string().trim().min(2, 'Ingrese el autor'),
  editorial: z.string().trim().min(2, 'Ingrese la editorial'),
  isbnIssn: z.string().trim().min(8, 'Ingrese el código ISBN o ISSN'),
  edicionAnio: z
    .number({ error: 'Ingrese el año de edición' })
    .int('Año inválido')
    .min(1900, 'Año mínimo 1900')
    .max(2100, 'Año inválido')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese el año de edición' }),
  cantidadEjemplares: z
    .number({ error: 'Ingrese la cantidad de ejemplares' })
    .int('Debe ser entero')
    .positive('Mínimo 1 ejemplar')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
  visadoDireccionBiblioteca: z.boolean().refine((valor) => valor === true, {
    error: 'La bibliografía requiere validación de la Dirección de Biblioteca',
  }),
})

export const integranteComisionFormSchema = z.object({
  nombreCompleto: z.string().trim().min(3, 'Ingrese el nombre del funcionario'),
  run: runChilenoSchema,
  cargo: z.string().trim().min(2, 'Ingrese el cargo'),
  unidad: z.string().trim().min(2, 'Ingrese la unidad o departamento'),
})

const porcentajeCriterioSchema = z
  .number({ error: 'Ingrese el porcentaje' })
  .min(0, 'Mínimo 0%')
  .max(100, 'Máximo 100%')
  .nullable()
  .refine((valor): valor is number => valor !== null, { error: 'Ingrese la ponderación' })

export const criteriosEvaluacionFormSchema = z.object({
  ponderacionAdministrativa: porcentajeCriterioSchema,
  ponderacionEconomica: porcentajeCriterioSchema,
  ponderacionPlazoEntrega: porcentajeCriterioSchema,
  ponderacionExperiencia: porcentajeCriterioSchema,
  ponderacionGarantia: porcentajeCriterioSchema,
  mesesGarantiaMinima: z
    .number({ error: 'Ingrese la garantía mínima exigida' })
    .int('Ingrese meses enteros')
    .min(
      GARANTIA_MINIMA_LICITACION_MESES,
      `El plazo mínimo de garantía exigido es de ${GARANTIA_MINIMA_LICITACION_MESES} meses`,
    )
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese los meses de garantía mínima',
    }),
  exigePactoIntegridad: z.boolean().refine((valor) => valor === true, {
    error: 'Toda licitación debe incluir el Pacto de Integridad',
  }),
})

export const licitacionPublicaFormSchema = cabeceraComunFormSchema
  .extend({
    categoriaRequerimiento: z.enum(['productos', 'servicios', 'bibliografia'], {
      error: 'Seleccione la categoría del requerimiento',
    }),
    formalizacion: z.enum(['solo_oc', 'contrato_y_oc'], {
      error: 'Seleccione el tipo de formalización',
    }),
    productos: z.array(itemProductoFormSchema),
    servicios: z.array(itemServicioFormSchema),
    bibliografia: z.array(itemBibliografiaFormSchema),
    comisionEvaluadora: z
      .array(integranteComisionFormSchema)
      .min(1, 'Debe designar al menos 1 funcionario en la comisión evaluadora'),
    criteriosEvaluacion: criteriosEvaluacionFormSchema,
  })
  .superRefine((valores, ctx) => {
    const montoUtm = calcularMontoUtm(valores.montoEstimadoClp)
    const formalizacionForzada = obtenerFormalizacionForzada(montoUtm)

    if (formalizacionForzada !== null && valores.formalizacion !== formalizacionForzada) {
      ctx.addIssue({
        code: 'custom',
        path: ['formalizacion'],
        message:
          formalizacionForzada === 'solo_oc'
            ? 'Para compras menores a 100 UTM corresponde formalizar solo con Orden de Compra'
            : 'Para compras mayores a 1.000 UTM es obligatorio formalizar con Contrato y OC',
        input: valores.formalizacion,
      })
    }

    if (valores.categoriaRequerimiento === 'productos' && valores.productos.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['productos'],
        message: 'Agregue al menos un producto al requerimiento',
        input: valores.productos,
      })
    }

    if (valores.categoriaRequerimiento === 'servicios' && valores.servicios.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['servicios'],
        message: 'Agregue al menos un servicio al requerimiento',
        input: valores.servicios,
      })
    }

    if (valores.categoriaRequerimiento === 'bibliografia' && valores.bibliografia.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['bibliografia'],
        message: 'Agregue al menos un título bibliográfico al requerimiento',
        input: valores.bibliografia,
      })
    }

    const minimoComision = obtenerMinimoComisionEvaluadora(montoUtm)
    if (valores.comisionEvaluadora.length < minimoComision) {
      ctx.addIssue({
        code: 'custom',
        path: ['comisionEvaluadora'],
        message: `Para montos superiores a 1.000 UTM la comisión evaluadora exige mínimo ${minimoComision} funcionarios`,
        input: valores.comisionEvaluadora,
      })
    }

    const sumaCriterios = sumarPonderacionesCriterios(valores.criteriosEvaluacion)
    if (sumaCriterios !== 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['criteriosEvaluacion', 'ponderacionEconomica'],
        message: `Los criterios de evaluación deben sumar exactamente 100% (actual: ${sumaCriterios}%)`,
        input: sumaCriterios,
      })
    }
  })

export const tratoDirectoFormSchema = cabeceraComunFormSchema
  .extend({
    proveedorNombre: z
      .string()
      .trim()
      .min(3, 'Ingrese la razón social o nombre del proveedor')
      .max(160, 'Máximo 160 caracteres'),
    proveedorRut: runChilenoSchema,
    causal: z.enum(
      [
        'proveedor_unico',
        'emergencia_urgencia',
        'costo_desproporcionado_7b',
        'servicios_confianza',
        'convenio_marco_no_disponible',
      ],
      { error: 'Seleccione la causal legal del Art. 71' },
    ),
    objetivoImportancia: z
      .string()
      .trim()
      .min(
        20,
        'Describa con detalle el objetivo e importancia institucional (mínimo 20 caracteres)',
      )
      .max(1500, 'Máximo 1500 caracteres'),
    justificacionProveedorUnico: z
      .string()
      .trim()
      .min(
        20,
        'Justifique técnica o comercialmente por qué este proveedor es la única opción viable',
      )
      .max(1500, 'Máximo 1500 caracteres'),
    informeCostos7b: z.string().trim().max(1500, 'Máximo 1500 caracteres'),
    certificaNoConvenioMarco: z.boolean().refine((valor) => valor === true, {
      error:
        'Debe certificar que el bien o servicio no está disponible en Convenio Marco o condiciones regionales',
    }),
    compromisoNoFragmentacion: z.boolean().refine((valor) => valor === true, {
      error: 'Debe asumir el compromiso de no fragmentar compras para eludir licitación',
    }),
    archivoCotizacion: z
      .array(fileUploadItemSchema)
      .min(1, 'Debe adjuntar la cotización del proveedor'),
    archivoDeclaracionJurada: z
      .array(fileUploadItemSchema)
      .min(1, 'Debe adjuntar la declaración jurada del proveedor'),
  })
  .superRefine((valores, ctx) => {
    if (
      valores.causal === 'costo_desproporcionado_7b' &&
      valores.informeCostos7b.trim().length < 20
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['informeCostos7b'],
        message:
          'La causal 7b exige incluir un informe de costos que demuestre la desproporción de licitar (mínimo 20 caracteres)',
        input: valores.informeCostos7b,
      })
    }
  })

export type LicitacionPublicaFormValues = z.input<typeof licitacionPublicaFormSchema>
export type TratoDirectoFormValues = z.input<typeof tratoDirectoFormSchema>
