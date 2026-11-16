import { z } from 'zod'
import { fileUploadItemSchema } from '@/components/ui/FileUpload'
import {
  cabeceraComunFormSchema,
  runChilenoSchema,
} from '@/features/formularios/schemas/disposicionesComunes.schema'
import {
  GARANTIA_MINIMA_LICITACION_MESES,
  TOPE_CAUSAL_7B_UTM,
  calcularMaximoGarantiaSeriedadClp,
  calcularMontoUtm,
  calcularTotalesCotizacionTratoDirecto,
  contarCriteriosTecnicosActivos,
  obtenerFormalizacionForzada,
  obtenerMinimoComisionEvaluadora,
  sumarPonderacionesCriterios,
} from '@/features/formularios/utils/reglasLicitacion'
import { formatCLP } from '@/utils/currency'

export const itemProductoFormSchema = z
  .object({
    cantidad: z
      .number({ error: 'Ingrese la cantidad' })
      .int('Debe ser entero')
      .positive('Mínimo 1 unidad')
      .nullable()
      .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
    especificacionesTecnicas: z
      .string()
      .trim()
      .min(
        10,
        'Incluya unidad de medida, materialidad, medidas, instalación/capacitación y equivalencias',
      ),
    imagenReferencia: z.array(fileUploadItemSchema),
    requiereGarantia: z.boolean(),
    mesesGarantia: z
      .number({ error: 'Ingrese los meses de garantía' })
      .int('Debe ser entero')
      .min(0, 'No puede ser negativo')
      .nullable(),
  })
  .superRefine((item, ctx) => {
    if (
      item.requiereGarantia &&
      (item.mesesGarantia === null || item.mesesGarantia < GARANTIA_MINIMA_LICITACION_MESES)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['mesesGarantia'],
        message: `Indique el plazo de garantía (mínimo ${GARANTIA_MINIMA_LICITACION_MESES} meses)`,
        input: item.mesesGarantia,
      })
    }
  })

export const itemBibliografiaFormSchema = z.object({
  titulo: z.string().trim().min(2, 'Ingrese el título'),
  autor: z.string().trim().min(2, 'Ingrese el autor'),
  editorial: z.string().trim().min(2, 'Ingrese la editorial'),
  numeroEdicion: z.string().trim().min(1, 'Indique el N° o año de edición'),
  idioma: z.string().trim().min(2, 'Indique el idioma'),
  isbnIssn: z.string().trim().min(8, 'Ingrese el ISBN o ISSN'),
  cantidad: z
    .number({ error: 'Ingrese la cantidad' })
    .int('Debe ser entero')
    .positive('Mínimo 1 ejemplar')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
})

export const otroIncumplimientoFormSchema = z.object({
  tipoIncumplimiento: z.string().trim().min(3, 'Describa el tipo de incumplimiento'),
  sancionAplicar: z.string().trim().min(2, 'Indique la sanción o multa a aplicar'),
})

export const antecedentesGeneralesFormSchema = z.object({
  campusSede: z.enum(['osorno', 'puerto_montt', 'santiago', 'ancud', 'castro'], {
    error: 'Seleccione el Campus o Sede',
  }),
  fechaFormulario: z
    .date({ error: 'Seleccione la fecha del formulario' })
    .nullable()
    .refine((valor): valor is Date => valor !== null, {
      error: 'Seleccione la fecha del formulario',
    }),
  formalizaSoloConFormularioLeasingObra: z.boolean(),
  jefeCrNombre: z.string().trim().min(3, 'Ingrese el nombre del Jefe de CR'),
  jefeCrCargo: z.string().trim().min(2, 'Ingrese el cargo del Jefe de CR'),
  coordinadorEsMismoJefeCr: z.boolean(),
  tipoPresupuesto: z.enum(['disponible', 'estimado'], {
    error: 'Indique si el presupuesto es disponible o estimado',
  }),
  hacerVisiblePresupuestoEstimado: z.boolean(),
  requiereGarantiaSeriedad: z.boolean(),
  montoGarantiaSeriedadClp: z
    .number({ error: 'Ingrese el monto de la garantía' })
    .int('Sin decimales')
    .positive('Mayor a cero')
    .nullable(),
  visitaTerreno: z.enum(['no_requiere', 'obligatoria', 'voluntaria']),
  visitaDiasCorridosPublicacion: z
    .number({ error: 'Ingrese los días corridos' })
    .int('Días enteros')
    .min(1, 'Mínimo 1 día')
    .nullable(),
  visitaHora: z.string().trim(),
  visitaGuiaNombreCargo: z.string().trim(),
  visitaFormato: z.enum(['presencial', 'virtual']),
  visitaDetalleLugarOEnlace: z.string().trim(),
  otrasConsideraciones: z.string().trim(),
})

export const integranteComisionFormSchema = z.object({
  nombreCompleto: z.string().trim().min(3, 'Ingrese el nombre completo'),
  run: runChilenoSchema,
  cargo: z.string().trim().min(2, 'Ingrese el cargo'),
  calidadContractual: z
    .string()
    .trim()
    .min(2, 'Indique la calidad contractual (ej. Planta, Contrata)'),
  correo: z.email({ error: 'Ingrese el correo electrónico institucional' }),
})

export const criterioAdicionalFormSchema = z.object({
  nombre: z.string().trim().min(3, 'Ingrese el nombre del criterio'),
  ponderacion: z
    .number({ error: 'Ingrese la ponderación' })
    .min(1, 'Mínimo 1%')
    .max(100, 'Máximo 100%')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la ponderación' }),
  mecanismoAsignacion: z.string().trim().min(5, 'Describa el mecanismo de asignación de puntaje'),
})

const porcentajeOpcionalSchema = z
  .number({ error: 'Ingrese el porcentaje' })
  .min(0, 'Mínimo 0%')
  .max(100, 'Máximo 100%')
  .nullable()

export const criteriosEvaluacionFormSchema = z.object({
  aplicaRequisitosFormales: z.boolean(),
  ponderacionRequisitosFormales: porcentajeOpcionalSchema,
  aplicaPactoIntegridad: z.boolean(),
  ponderacionPactoIntegridad: porcentajeOpcionalSchema,
  ponderacionPrecio: z
    .number({ error: 'Ingrese la ponderación del precio' })
    .min(1, 'Mínimo 1%')
    .max(100, 'Máximo 100%')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese la ponderación del criterio económico Precio',
    }),
  mecanismoPrecio: z.enum(['formula_proporcional', 'tramos_ranking']),
  aplicaPlazoEntrega: z.boolean(),
  ponderacionPlazoEntrega: porcentajeOpcionalSchema,
  tipoDiasPlazoEntrega: z.enum(['habiles', 'corridos']),
  plazoMaximoEntregaDias: z
    .number({ error: 'Indique el plazo máximo en días' })
    .int('Debe ser entero')
    .positive('Mayor a cero')
    .nullable(),
  mecanismoPlazoEntrega: z.enum(['formula_menor_plazo', 'rangos_dias']),
  aplicaExperiencia: z.boolean(),
  ponderacionExperiencia: porcentajeOpcionalSchema,
  especificacionRubroExperiencia: z.string().trim(),
  modoMedicionExperiencia: z.enum(['cantidad_servicios', 'anios_experiencia']),
  rangoMaximoExperiencia: z.string().trim(),
  rangoMedioExperiencia: z.string().trim(),
  rangoMinimoExperiencia: z.string().trim(),
  documentosRespaldoExperiencia: z.string().trim(),
  aplicaPlazoGarantia: z.boolean(),
  ponderacionPlazoGarantia: porcentajeOpcionalSchema,
  mecanismoPlazoGarantia: z.enum(['formula_mayor_garantia', 'rangos_meses']),
  otrosCriterios: z.array(criterioAdicionalFormSchema),
})

export const licitacionPublicaFormSchema = cabeceraComunFormSchema
  .extend({
    categoriaRequerimiento: z.enum(['productos', 'servicios', 'bibliografia'], {
      error: 'Seleccione la opción que corresponda (Productos, Servicios o Bibliografía)',
    }),
    productos: z.array(itemProductoFormSchema),
    especificacionesTecnicasServicio: z.string().trim(),
    planillaValidacionBiblioteca: z.array(fileUploadItemSchema),
    bibliografia: z.array(itemBibliografiaFormSchema),
    formalizacion: z.enum(['solo_oc', 'contrato_y_oc'], {
      error: 'Seleccione el tipo de formalización',
    }),
    modalidadDuracionContrato: z.enum(['plazo_ofertado', 'meses_fijos']),
    duracionContratoMeses: z
      .number({ error: 'Ingrese los meses de duración del contrato' })
      .int('Debe ser entero')
      .positive('Mínimo 1 mes')
      .nullable(),
    direccionDespachoCodigo: z.enum([
      'osorno_fuchslocher',
      'puerto_montt_chinquihue',
      'santiago_republica',
      'ancud_ramirez',
      'castro_mansilla',
      'otra',
    ]),
    direccionDespachoOtra: z.string().trim(),
    otrosIncumplimientos: z.array(otroIncumplimientoFormSchema),
    modalidadFormaPago: z.enum([
      'recepcion_conforme_total',
      'entrega_parcializada',
      'financiamiento_leasing',
    ]),
    tipoEntregaParcializada: z.enum(['mes_vencido', 'informe_avance', 'etapa_cumplida', 'otra']),
    detalleEntregaParcializada: z.string().trim(),
    antecedentes: antecedentesGeneralesFormSchema,
    tipoEvaluacion: z.enum(['completa', 'por_linea']),
    comisionEvaluadora: z
      .array(integranteComisionFormSchema)
      .min(1, 'Debe designar al menos 1 funcionario evaluador'),
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
            ? 'Para compras menores a 100 UTM siempre se formalizará solo con OC'
            : 'Para compras mayores a 1.000 UTM es obligación formalizar con Contrato y OC aceptada',
        input: valores.formalizacion,
      })
    }

    if (
      valores.formalizacion === 'contrato_y_oc' &&
      valores.modalidadDuracionContrato === 'meses_fijos' &&
      (valores.duracionContratoMeses === null || valores.duracionContratoMeses < 1)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['duracionContratoMeses'],
        message: 'Indique la cantidad de meses de duración del contrato',
        input: valores.duracionContratoMeses,
      })
    }

    if (
      valores.direccionDespachoCodigo === 'otra' &&
      valores.direccionDespachoOtra.trim().length < 5
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['direccionDespachoOtra'],
        message: 'Indique la dirección de despacho o entrega del servicio',
        input: valores.direccionDespachoOtra,
      })
    }

    if (valores.categoriaRequerimiento === 'productos' && valores.productos.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['productos'],
        message: 'Agregue al menos un ítem de producto con sus especificaciones técnicas',
        input: valores.productos,
      })
    }

    if (
      valores.categoriaRequerimiento === 'servicios' &&
      valores.especificacionesTecnicasServicio.trim().length < 20
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['especificacionesTecnicasServicio'],
        message:
          'Detalle claramente las características del servicio, fechas, metodología, reglamentación e hitos',
        input: valores.especificacionesTecnicasServicio,
      })
    }

    if (valores.categoriaRequerimiento === 'bibliografia') {
      if (valores.bibliografia.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['bibliografia'],
          message: 'Agregue al menos un ítem bibliográfico con ISBN/ISSN e idioma',
          input: valores.bibliografia,
        })
      }
      if (valores.planillaValidacionBiblioteca.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['planillaValidacionBiblioteca'],
          message: 'Debe adjuntar la planilla de validación de la Dirección de Biblioteca',
          input: valores.planillaValidacionBiblioteca,
        })
      }
    }

    if (valores.antecedentes.requiereGarantiaSeriedad) {
      const topeGarantia = calcularMaximoGarantiaSeriedadClp(valores.montoEstimadoClp)
      if (
        valores.antecedentes.montoGarantiaSeriedadClp === null ||
        valores.antecedentes.montoGarantiaSeriedadClp <= 0
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['antecedentes', 'montoGarantiaSeriedadClp'],
          message: 'Indique el monto en pesos de la Garantía de Seriedad de la Oferta',
          input: valores.antecedentes.montoGarantiaSeriedadClp,
        })
      } else if (topeGarantia > 0 && valores.antecedentes.montoGarantiaSeriedadClp > topeGarantia) {
        ctx.addIssue({
          code: 'custom',
          path: ['antecedentes', 'montoGarantiaSeriedadClp'],
          message: `La garantía no puede exceder el 3% del presupuesto (${formatCLP(topeGarantia)})`,
          input: valores.antecedentes.montoGarantiaSeriedadClp,
        })
      }
    }

    if (valores.antecedentes.visitaTerreno !== 'no_requiere') {
      if (valores.antecedentes.visitaDiasCorridosPublicacion === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['antecedentes', 'visitaDiasCorridosPublicacion'],
          message: 'Indique los días corridos desde la publicación',
          input: valores.antecedentes.visitaDiasCorridosPublicacion,
        })
      }
      if (valores.antecedentes.visitaGuiaNombreCargo.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['antecedentes', 'visitaGuiaNombreCargo'],
          message: 'Indique el nombre y cargo de quien guiará la visita a terreno',
          input: valores.antecedentes.visitaGuiaNombreCargo,
        })
      }
      if (valores.antecedentes.visitaDetalleLugarOEnlace.trim().length < 5) {
        ctx.addIssue({
          code: 'custom',
          path: ['antecedentes', 'visitaDetalleLugarOEnlace'],
          message:
            'Indique el lugar físico o el tipo de enlace y registro de asistencia para la visita',
          input: valores.antecedentes.visitaDetalleLugarOEnlace,
        })
      }
    }

    const minimoComision = obtenerMinimoComisionEvaluadora(montoUtm)
    if (valores.comisionEvaluadora.length < minimoComision) {
      ctx.addIssue({
        code: 'custom',
        path: ['comisionEvaluadora'],
        message: `Para licitaciones mayores a 1.000 UTM se debe designar una comisión de mínimo ${minimoComision} funcionarios`,
        input: valores.comisionEvaluadora,
      })
    }

    if (contarCriteriosTecnicosActivos(valores.criteriosEvaluacion) < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['criteriosEvaluacion', 'ponderacionPrecio'],
        message:
          'Debe seleccionar como mínimo 2 criterios (el económico Precio y al menos 1 técnico)',
        input: valores.criteriosEvaluacion,
      })
    }

    if (
      valores.criteriosEvaluacion.aplicaPlazoEntrega &&
      (valores.criteriosEvaluacion.plazoMaximoEntregaDias === null ||
        valores.criteriosEvaluacion.plazoMaximoEntregaDias < 1)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['criteriosEvaluacion', 'plazoMaximoEntregaDias'],
        message: 'Indique el máximo de días permitido para el plazo de entrega',
        input: valores.criteriosEvaluacion.plazoMaximoEntregaDias,
      })
    }

    if (valores.criteriosEvaluacion.aplicaExperiencia) {
      if (valores.criteriosEvaluacion.especificacionRubroExperiencia.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['criteriosEvaluacion', 'especificacionRubroExperiencia'],
          message: 'Especifique el rubro o tipo de experiencia requerida',
          input: valores.criteriosEvaluacion.especificacionRubroExperiencia,
        })
      }
      if (valores.criteriosEvaluacion.documentosRespaldoExperiencia.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['criteriosEvaluacion', 'documentosRespaldoExperiencia'],
          message: 'Indique los documentos exigidos para respaldar la experiencia',
          input: valores.criteriosEvaluacion.documentosRespaldoExperiencia,
        })
      }
    }

    const sumaCriterios = sumarPonderacionesCriterios(valores.criteriosEvaluacion)
    if (sumaCriterios !== 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['criteriosEvaluacion', 'ponderacionPrecio'],
        message: `La suma de las ponderaciones de los criterios seleccionados debe coincidir con un 100% (actual: ${sumaCriterios}%)`,
        input: sumaCriterios,
      })
    }
  })

export const itemRequeridoTratoDirectoFormSchema = z.object({
  cantidad: z
    .number({ error: 'Ingrese la cantidad requerida' })
    .int('Debe ser entero')
    .positive('Mínimo 1')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
  descripcionDetallada: z
    .string()
    .trim()
    .min(
      5,
      'Detalle las características del bien y/o servicio requerido (materialidad, medidas, condiciones, hitos, etc.)',
    ),
})

export const lineaCotizacionTratoDirectoFormSchema = z.object({
  cantidad: z
    .number({ error: 'Ingrese la cantidad' })
    .int('Debe ser entero')
    .positive('Mínimo 1')
    .nullable()
    .refine((valor): valor is number => valor !== null, { error: 'Ingrese la cantidad' }),
  detalle: z.string().trim().min(3, 'Indique el nombre o detalle de lo requerido'),
  precioUnitarioNeto: z
    .number({ error: 'Ingrese el precio unitario neto' })
    .int('Sin decimales')
    .positive('Mayor a cero')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Ingrese el precio unitario neto',
    }),
})

export const condicionesCompraTratoDirectoFormSchema = z.object({
  plazoEntregaDiasHabiles: z
    .number({ error: 'Indique el plazo de entrega en días hábiles' })
    .int('Días enteros')
    .positive('Mínimo 1 día hábil')
    .nullable()
    .refine((valor): valor is number => valor !== null, {
      error: 'Indique el plazo de entrega en días hábiles',
    }),
  esServicio: z.boolean(),
  fechaInicioServicio: z.string().trim(),
  fechaTerminoServicio: z.string().trim(),
  requiereGarantia: z.boolean(),
  mesesGarantia: z
    .number({ error: 'Indique los meses de garantía' })
    .int('Meses enteros')
    .min(1, 'Mínimo 1 mes')
    .nullable(),
  aplicaDireccionDespacho: z.boolean(),
  direccionDespachoCodigo: z.enum([
    'osorno_fuchslocher',
    'puerto_montt_chinquihue',
    'santiago_republica',
    'ancud_ramirez',
    'castro_mansilla',
    'otra',
  ]),
  direccionDespachoOtra: z.string().trim(),
})

export const tratoDirectoFormSchema = cabeceraComunFormSchema
  .extend({
    campusSede: z.enum(['osorno', 'puerto_montt', 'santiago', 'ancud', 'castro'], {
      error: 'Seleccione el Campus o Sede',
    }),
    fechaFormulario: z
      .date({ error: 'Seleccione la fecha del formulario' })
      .nullable()
      .refine((valor): valor is Date => valor !== null, {
        error: 'Seleccione la fecha del formulario',
      }),
    itemsRequeridos: z
      .array(itemRequeridoTratoDirectoFormSchema)
      .min(1, 'Agregue al menos un ítem en la tabla del punto 1'),
    situacionConvenioMarco: z.enum(
      ['no_disponible', 'condiciones_regionales_o_monto_minimo', 'compra_agil_sin_resultados'],
      { error: 'Seleccione la situación respecto al Catálogo de Convenio Marco' },
    ),
    causal: z.enum(
      [
        'costo_desproporcionado_7b',
        'proveedor_unico',
        'emergencia_urgencia',
        'servicios_confianza',
        'seguridad_o_equipamiento_critico',
      ],
      { error: 'Seleccione la causal del Artículo 71' },
    ),
    objetivoImportancia: z
      .string()
      .trim()
      .min(20, '4.a) Señale el objeto, motivo e importancia de la compra (mínimo 20 caracteres)'),
    motivosEleccionProveedor: z
      .string()
      .trim()
      .min(20, '4.b) Indique los motivos que argumentan la elección del proveedor'),
    justificacionCausalEscogida: z
      .string()
      .trim()
      .min(
        20,
        '4.c) Indique la fundamentación documentada de la causal escogida y por qué no es posible licitar',
      ),
    proveedorNombre: z
      .string()
      .trim()
      .min(3, 'Ingrese la razón social del proveedor')
      .max(160, 'Máximo 160 caracteres'),
    proveedorRut: runChilenoSchema,
    lineasCotizacion: z
      .array(lineaCotizacionTratoDirectoFormSchema)
      .min(1, 'Agregue al menos una línea en el cuadro de cotización del proveedor'),
    afectoIva: z.boolean(),
    condicionesCompra: condicionesCompraTratoDirectoFormSchema,
    otrosIncumplimientos: z.array(otroIncumplimientoFormSchema),
    compromisoEstandarSimpleOc: z.boolean().refine((valor) => valor === true, {
      error:
        '9.a) Debe declarar que el bien/servicio es de estándar simple y objetiva especificación formalizable con OC',
    }),
    compromisoNoFragmentacion: z.boolean().refine((valor) => valor === true, {
      error:
        '9.b) Debe declarar no estar fragmentando la compra para variar el procedimiento de contratación',
    }),
    jefeCrNombre: z.string().trim().min(3, '10) Ingrese el nombre del Jefe de CR'),
    jefeCrCargo: z.string().trim().min(2, 'Ingrese el cargo del Jefe de CR'),
    coordinadorEsMismoJefeCr: z.boolean(),
    archivoCotizacion: z
      .array(fileUploadItemSchema)
      .min(1, '11) Debe adjuntar la Cotización del proveedor (Obligatorio)'),
    archivoDeclaracionJurada: z
      .array(fileUploadItemSchema)
      .min(1, '11) Debe adjuntar la Declaración jurada del proveedor (Obligatorio)'),
    documentosAdicionales: z.array(
      z.enum([
        'certificado_proveedor_unico',
        'certificado_servicio_tecnico',
        'convenio_cooperacion',
        'informe_tecnico',
        'otro',
      ]),
    ),
    otroDocumentoAdicionalDetalle: z.string().trim(),
  })
  .superRefine((valores, ctx) => {
    const totales = calcularTotalesCotizacionTratoDirecto(
      valores.lineasCotizacion,
      valores.afectoIva,
    )
    const montoUtm = calcularMontoUtm(totales.total)

    if (valores.causal === 'costo_desproporcionado_7b' && montoUtm > TOPE_CAUSAL_7B_UTM) {
      ctx.addIssue({
        code: 'custom',
        path: ['causal'],
        message: `La causal 7b permite un máximo de ${TOPE_CAUSAL_7B_UTM} UTM (la cotización actual equivale a ${montoUtm} UTM)`,
        input: valores.causal,
      })
    }

    if (valores.condicionesCompra.esServicio) {
      if (valores.condicionesCompra.fechaInicioServicio.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['condicionesCompra', 'fechaInicioServicio'],
          message: 'Indique la fecha o mes de inicio del servicio (ej. Agosto 2025)',
          input: valores.condicionesCompra.fechaInicioServicio,
        })
      }
      if (valores.condicionesCompra.fechaTerminoServicio.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['condicionesCompra', 'fechaTerminoServicio'],
          message: 'Indique la fecha o mes de término del servicio (ej. Agosto 2026)',
          input: valores.condicionesCompra.fechaTerminoServicio,
        })
      }
    }

    if (
      valores.condicionesCompra.requiereGarantia &&
      (valores.condicionesCompra.mesesGarantia === null ||
        valores.condicionesCompra.mesesGarantia < 1)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicionesCompra', 'mesesGarantia'],
        message: 'Indique los meses de garantía del bien o servicio',
        input: valores.condicionesCompra.mesesGarantia,
      })
    }

    if (
      valores.condicionesCompra.aplicaDireccionDespacho &&
      valores.condicionesCompra.direccionDespachoCodigo === 'otra' &&
      valores.condicionesCompra.direccionDespachoOtra.trim().length < 5
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['condicionesCompra', 'direccionDespachoOtra'],
        message: 'Indique la dirección de despacho o servicio',
        input: valores.condicionesCompra.direccionDespachoOtra,
      })
    }

    if (
      valores.documentosAdicionales.includes('otro') &&
      valores.otroDocumentoAdicionalDetalle.trim().length < 3
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['otroDocumentoAdicionalDetalle'],
        message: 'Indique cuál es el otro documento adjuntado',
        input: valores.otroDocumentoAdicionalDetalle,
      })
    }
  })

export type LicitacionPublicaFormValues = z.input<typeof licitacionPublicaFormSchema>
export type TratoDirectoFormValues = z.input<typeof tratoDirectoFormSchema>
