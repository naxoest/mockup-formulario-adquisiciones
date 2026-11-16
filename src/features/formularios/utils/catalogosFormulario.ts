import type {
  LicitacionPublicaFormValues,
  TratoDirectoFormValues,
} from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import type {
  CampusSedeUlagos,
  CategoriaRequerimientoLicitacion,
  CausalTratoDirecto,
  DireccionDespachoCodigo,
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
  ModalidadFormaPagoLicitacion,
  ModalidadFormulario,
  TipoEvaluacionOfertas,
  TipoFormalizacionLicitacion,
  TipoPresupuestoLicitacion,
  TipoSolicitudEdelfos,
} from '@/features/formularios/types/formularioAdquisicion.types'
import { calcularMontoUtm } from '@/features/formularios/utils/reglasLicitacion'
import type { SelectOption } from '@/types/select'

export interface OpcionRadioConDescripcion {
  value: string
  label: string
  description: string
}

export type NuevoFormularioPayload =
  | Omit<
      Extract<FormularioAdquisicion, { modalidad: 'licitacion_publica' }>,
      'id' | 'folio' | 'estado' | 'creadoEn' | 'actualizadoEn'
    >
  | Omit<
      Extract<FormularioAdquisicion, { modalidad: 'trato_directo' }>,
      'id' | 'folio' | 'estado' | 'creadoEn' | 'actualizadoEn'
    >

export const OPCIONES_CAMPUS_SEDE: SelectOption[] = [
  { value: 'osorno', label: 'Campus Osorno' },
  { value: 'puerto_montt', label: 'Campus Puerto Montt' },
  { value: 'santiago', label: 'Sede Santiago' },
  { value: 'ancud', label: 'Sede Chiloé — Ancud' },
  { value: 'castro', label: 'Sede Chiloé — Castro' },
]

export const OPCIONES_TIPO_SOLICITUD_EDELFOS: SelectOption[] = [
  { value: 'SASERVI', label: 'SASERVI — Gastos indirectos (Servicios)' },
  { value: 'SASERDIR', label: 'SASERDIR — Material de enseñanza (Docencia)' },
  { value: 'SAEXIST', label: 'SAEXIST — Compra de existencias' },
  { value: 'SABIENES', label: 'SABIENES — Compra de bienes y equipamiento' },
]

export const OPCIONES_CATEGORIA_LICITACION: OpcionRadioConDescripcion[] = [
  {
    value: 'productos',
    label: 'Opción 1: Para licitar productos',
    description:
      'Exige unidad de medida, materialidad, medidas, instalación/capacitación, equivalencias y definición de garantía.',
  },
  {
    value: 'servicios',
    label: 'Opción 2: Para licitar servicios',
    description:
      'Requiere detallar características del servicio, fechas, metodología, condiciones, reglamentación e hitos.',
  },
  {
    value: 'bibliografia',
    label: 'Opción 3: Para licitar bibliografía (impresa, electrónica o bases de datos)',
    description:
      'Exige ISBN/ISSN, edición, idioma y planilla de validación de la Dirección de Biblioteca.',
  },
]

export const OPCIONES_FORMALIZACION_LICITACION: OpcionRadioConDescripcion[] = [
  {
    value: 'solo_oc',
    label: 'Opción 1: Sólo con Orden de Compra (OC) aceptada en www.mercadopublico.cl',
    description:
      'Bien, servicio u obra de estándar simple y objetiva especificación (obligatorio < 100 UTM; opcional 100 a 1.000 UTM).',
  },
  {
    value: 'contrato_y_oc',
    label: 'Opción 2: Con Contrato y Orden de Compra aceptada en www.mercadopublico.cl',
    description: 'Obligatorio para compras mayores a 1.000 UTM; elegible entre 100 y 1.000 UTM.',
  },
]

export const OPCIONES_DURACION_CONTRATO: OpcionRadioConDescripcion[] = [
  {
    value: 'plazo_ofertado',
    label: 'Según plazo de ejecución indicado por el oferente en su oferta',
    description:
      'La vigencia se contabilizará a partir de la fecha del Decreto Universitario que aprueba el contrato.',
  },
  {
    value: 'meses_fijos',
    label: 'Por un periodo fijo en meses',
    description:
      'Inicia una vez que se encuentre totalmente tramitado el Decreto que apruebe el contrato respectivo.',
  },
]

export const OPCIONES_DIRECCION_DESPACHO: SelectOption[] = [
  { value: 'osorno_fuchslocher', label: 'Avenida Fuchslocher 1305, Osorno' },
  { value: 'puerto_montt_chinquihue', label: 'Camino a Chinquihue Km 6, Puerto Montt' },
  { value: 'santiago_republica', label: 'República 517, Santiago' },
  { value: 'ancud_ramirez', label: 'Eleuterio Ramírez 348, Ancud' },
  { value: 'castro_mansilla', label: 'Ubaldo Mansilla Barrientos 131, Castro' },
  { value: 'otra', label: 'Otra dirección de despacho (especificar)' },
]

export const OPCIONES_FORMA_PAGO_LICITACION: OpcionRadioConDescripcion[] = [
  {
    value: 'recepcion_conforme_total',
    label: 'Pago a 30 días contra recepción conforme total y factura visada por Jefe de CR',
    description:
      'Cumpliendo en su totalidad las condiciones, forma y lugar de entrega establecidos en las bases.',
  },
  {
    value: 'entrega_parcializada',
    label: 'Pago a 30 días contra entrega parcializada del servicio',
    description: 'Por mes vencido, informe de avance o etapa entregada/cumplida.',
  },
  {
    value: 'financiamiento_leasing',
    label: 'Pago vía financiamiento Leasing',
    description: 'Gestionado institucionalmente por la Universidad de Los Lagos.',
  },
]

export const OPCIONES_ENTREGA_PARCIALIZADA: SelectOption[] = [
  { value: 'mes_vencido', label: 'Mes vencido' },
  { value: 'informe_avance', label: 'Informe de avance aprobado' },
  { value: 'etapa_cumplida', label: 'Etapa entregada o cumplida' },
  { value: 'otra', label: 'Otra modalidad parcializada' },
]

export const OPCIONES_TIPO_PRESUPUESTO: OpcionRadioConDescripcion[] = [
  {
    value: 'disponible',
    label: 'Presupuesto Disponible',
    description: 'No permite adjudicar un monto mayor a lo indicado.',
  },
  {
    value: 'estimado',
    label: 'Presupuesto Estimado',
    description:
      'Permite adjudicar un monto mayor hasta un 30% sin justificación (monto superior requiere informe).',
  },
]

export const OPCIONES_VISITA_TERRENO: OpcionRadioConDescripcion[] = [
  {
    value: 'no_requiere',
    label: 'No requiere o No aplica',
    description: 'La licitación no contempla visita a terreno previa.',
  },
  {
    value: 'obligatoria',
    label: 'Requiere visita a terreno OBLIGATORIA',
    description: 'Requisito excluyente para los oferentes.',
  },
  {
    value: 'voluntaria',
    label: 'Requiere visita a terreno VOLUNTARIA',
    description: 'Instancia opcional de reconocimiento técnico.',
  },
]

export const OPCIONES_FORMATO_VISITA: OpcionRadioConDescripcion[] = [
  {
    value: 'presencial',
    label: 'Presencial en dependencias de la Universidad',
    description: 'Se debe indicar el lugar físico de encuentro.',
  },
  {
    value: 'virtual',
    label: 'Virtual / Online',
    description:
      'Indicar tipo de enlace y cómo se registrará la asistencia (ej. registro fotográfico y/o chat).',
  },
]

export const OPCIONES_TIPO_EVALUACION: OpcionRadioConDescripcion[] = [
  {
    value: 'completa',
    label: 'Evaluación Completa',
    description:
      'Se seleccionará a un único oferente que oferte la totalidad de los productos y/o servicios licitados.',
  },
  {
    value: 'por_linea',
    label: 'Evaluación Por Línea',
    description:
      'Se seleccionará a un único oferente por cada línea de producto y/o servicio licitado.',
  },
]

export const OPCIONES_MECANISMO_PRECIO: OpcionRadioConDescripcion[] = [
  {
    value: 'formula_proporcional',
    label: 'Escala 0 a 100 puntos — Fórmula: (Precio Menor / Precio Oferta) × 100',
    description: 'Asigna 100 puntos a la oferta de menor precio y proporcional al resto.',
  },
  {
    value: 'tramos_ranking',
    label: 'Escala 20 a 100 puntos por orden de precios (Sugerida para licitar servicios)',
    description:
      'Precio mínimo: 100 pts · 2° menor precio: 60 pts · 3° menor precio: 40 pts · 4° o más: 20 pts.',
  },
]

export const OPCIONES_MECANISMO_PLAZO_ENTREGA: OpcionRadioConDescripcion[] = [
  {
    value: 'formula_menor_plazo',
    label: 'Fórmula proporcional: (Plazo Menor Ofertado / Plazo Oferta) × 100',
    description: 'Evalúa con 100 puntos a la propuesta que oferte el menor plazo en días.',
  },
  {
    value: 'rangos_dias',
    label: 'Por rangos de días ofertados',
    description:
      'Menor de 10 días: 100 pts · De 10 a 15 días: 50 pts · Entre 16 y el máximo: 0 pts.',
  },
]

export const OPCIONES_MODO_EXPERIENCIA: OpcionRadioConDescripcion[] = [
  {
    value: 'cantidad_servicios',
    label: 'Por cantidad de trabajos o servicios similares realizados',
    description: 'Asigna 100, 50, 20 o 0 puntos según tramos de cantidad de servicios acreditados.',
  },
  {
    value: 'anios_experiencia',
    label: 'Por años de experiencia en el rubro (un respaldo por año)',
    description: 'Asigna 100, 50, 20 o 0 puntos según tramos de años de experiencia acreditados.',
  },
]

export const OPCIONES_MECANISMO_GARANTIA: OpcionRadioConDescripcion[] = [
  {
    value: 'formula_mayor_garantia',
    label: 'Fórmula proporcional: (Garantía Ofertada / Mayor Garantía Ofertada) × 100',
    description: 'Plazo legal base de 6 meses desde recepción conforme.',
  },
  {
    value: 'rangos_meses',
    label: 'Por rangos de meses ofertados',
    description:
      'Igual o mayor a 12 meses: 100 pts · Mayor a 6 y menor a 12 meses: 50 pts · Igual a 6 meses: 0 pts.',
  },
]

export const OPCIONES_CAUSAL_TRATO_DIRECTO: SelectOption[] = [
  {
    value: 'proveedor_unico',
    label: 'Art. 71 letra d) — Proveedor único o titular exclusivo de derechos',
  },
  {
    value: 'costo_desproporcionado_7b',
    label: 'Art. 71 N° 7 letra b) — Costo de licitación desproporcionado (exige informe de costos)',
  },
  {
    value: 'emergencia_urgencia',
    label: 'Art. 71 letra c) — Emergencia, urgencia o imprevisto calificado',
  },
  {
    value: 'servicios_confianza',
    label: 'Art. 71 letra f) — Servicios de naturaleza confidencial o facultades especiales',
  },
  {
    value: 'convenio_marco_no_disponible',
    label: 'Condiciones regionales o ausencia en Catálogo de Convenio Marco',
  },
]

export const OPCIONES_TOPE_CONTRATO: OpcionRadioConDescripcion[] = [
  {
    value: '10',
    label: 'Tope 10% del valor total del contrato',
    description: 'Límite máximo acumulado de multas para contratos de menor riesgo.',
  },
  {
    value: '20',
    label: 'Tope 20% del valor total del contrato',
    description: 'Límite máximo estándar institucional establecido en el formulario oficial.',
  },
]

export const ETIQUETAS_ESTADO_FORMULARIO: Record<EstadoFormularioAdquisicion, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  aprobado: 'Aprobado',
  observado: 'Observado',
}

export const ETIQUETAS_MODALIDAD_FORMULARIO: Record<ModalidadFormulario, string> = {
  licitacion_publica: 'Licitación Pública',
  trato_directo: 'Trato Directo',
}

export const ETIQUETAS_CAMPUS_SEDE: Record<CampusSedeUlagos, string> = {
  osorno: 'Campus Osorno',
  puerto_montt: 'Campus Puerto Montt',
  santiago: 'Sede Santiago',
  ancud: 'Sede Ancud',
  castro: 'Sede Castro',
}

export const ETIQUETAS_CATEGORIA_LICITACION: Record<CategoriaRequerimientoLicitacion, string> = {
  productos: 'Opción 1: Productos',
  servicios: 'Opción 2: Servicios',
  bibliografia: 'Opción 3: Bibliografía',
}

export const ETIQUETAS_FORMALIZACION: Record<TipoFormalizacionLicitacion, string> = {
  solo_oc: 'Sólo Orden de Compra (OC) aceptada',
  contrato_y_oc: 'Contrato y Orden de Compra (OC) aceptada',
}

export const ETIQUETAS_DIRECCION_DESPACHO: Record<DireccionDespachoCodigo, string> = {
  osorno_fuchslocher: 'Avenida Fuchslocher 1305, Osorno',
  puerto_montt_chinquihue: 'Camino a Chinquihue Km 6, Puerto Montt',
  santiago_republica: 'República 517, Santiago',
  ancud_ramirez: 'Eleuterio Ramírez 348, Ancud',
  castro_mansilla: 'Ubaldo Mansilla Barrientos 131, Castro',
  otra: 'Otra dirección especificada',
}

export const ETIQUETAS_FORMA_PAGO: Record<ModalidadFormaPagoLicitacion, string> = {
  recepcion_conforme_total: 'A 30 días contra recepción conforme total',
  entrega_parcializada: 'A 30 días contra entrega parcializada',
  financiamiento_leasing: 'Vía financiamiento Leasing ULagos',
}

export const ETIQUETAS_TIPO_PRESUPUESTO: Record<TipoPresupuestoLicitacion, string> = {
  disponible: 'Disponible (sin sobreprecio)',
  estimado: 'Estimado (hasta 30% adicional)',
}

export const ETIQUETAS_TIPO_EVALUACION: Record<TipoEvaluacionOfertas, string> = {
  completa: 'Completa (adjudicación única)',
  por_linea: 'Por línea (adjudicación por ítem)',
}

export const ETIQUETAS_CAUSAL_TRATO_DIRECTO: Record<CausalTratoDirecto, string> = {
  proveedor_unico: 'Art. 71 d) Proveedor único',
  costo_desproporcionado_7b: 'Art. 71 7b) Costo desproporcionado',
  emergencia_urgencia: 'Art. 71 c) Emergencia o urgencia',
  servicios_confianza: 'Art. 71 f) Servicios especializados',
  convenio_marco_no_disponible: 'Sin cobertura en Convenio Marco regional',
}

export const ETIQUETAS_TIPO_SOLICITUD: Record<TipoSolicitudEdelfos, string> = {
  SASERVI: 'SASERVI (Servicios)',
  SASERDIR: 'SASERDIR (Material de enseñanza)',
  SAEXIST: 'SAEXIST (Existencias)',
  SABIENES: 'SABIENES (Bienes)',
}

function extraerNombreArchivo(
  items: LicitacionPublicaFormValues['planillaValidacionBiblioteca'],
  porDefecto = '',
): string {
  const primero = items[0]
  if (!primero) return porDefecto
  return primero.kind === 'pending' ? primero.file.name : primero.name
}

export function transformarLicitacionAPayload(
  valores: LicitacionPublicaFormValues,
): NuevoFormularioPayload {
  const montoClp = valores.montoEstimadoClp ?? 0
  return {
    modalidad: 'licitacion_publica',
    titulo: valores.titulo.trim(),
    codigoEdelfos: valores.codigoEdelfos.trim().toUpperCase(),
    tipoSolicitud: valores.tipoSolicitud,
    montoEstimadoClp: montoClp,
    montoEstimadoUtm: calcularMontoUtm(montoClp),
    coordinador: {
      nombreCompleto: valores.coordinador.nombreCompleto.trim(),
      run: valores.coordinador.run.trim(),
      correo: valores.coordinador.correo.trim(),
      cargo: valores.coordinador.cargo.trim(),
      crCodigo: valores.coordinador.crCodigo ?? 1,
      crNombre: valores.coordinador.crNombre.trim(),
    },
    disposiciones: {
      porcentajeMultaDiaria: valores.disposiciones.porcentajeMultaDiaria ?? 0.5,
      topeDiasMulta: valores.disposiciones.topeDiasMulta ?? 20,
      topePorcentajeContrato: valores.disposiciones.topePorcentajeContrato === '10' ? 10 : 20,
      plazoPagoDias: valores.disposiciones.plazoPagoDias ?? 30,
      aceptaTerminoAnticipadoArt130: valores.disposiciones.aceptaTerminoAnticipadoArt130,
    },
    licitacion: {
      categoriaRequerimiento: valores.categoriaRequerimiento,
      productos: valores.productos.map((item) => ({
        cantidad: item.cantidad ?? 1,
        especificacionesTecnicas: item.especificacionesTecnicas.trim(),
        nombreImagenReferencia: extraerNombreArchivo(item.imagenReferencia),
        requiereGarantia: item.requiereGarantia,
        mesesGarantia: item.requiereGarantia ? (item.mesesGarantia ?? 6) : null,
      })),
      especificacionesTecnicasServicio: valores.especificacionesTecnicasServicio.trim(),
      nombrePlanillaValidacionBiblioteca: extraerNombreArchivo(
        valores.planillaValidacionBiblioteca,
      ),
      bibliografia: valores.bibliografia.map((item) => ({
        titulo: item.titulo.trim(),
        autor: item.autor.trim(),
        editorial: item.editorial.trim(),
        numeroEdicion: item.numeroEdicion.trim(),
        idioma: item.idioma.trim(),
        isbnIssn: item.isbnIssn.trim(),
        cantidad: item.cantidad ?? 1,
      })),
      formalizacion: valores.formalizacion,
      modalidadDuracionContrato: valores.modalidadDuracionContrato,
      duracionContratoMeses:
        valores.formalizacion === 'contrato_y_oc' &&
        valores.modalidadDuracionContrato === 'meses_fijos'
          ? (valores.duracionContratoMeses ?? 12)
          : null,
      direccionDespachoCodigo: valores.direccionDespachoCodigo,
      direccionDespachoOtra: valores.direccionDespachoOtra.trim(),
      otrosIncumplimientos: valores.otrosIncumplimientos.map((inc) => ({
        tipoIncumplimiento: inc.tipoIncumplimiento.trim(),
        sancionAplicar: inc.sancionAplicar.trim(),
      })),
      modalidadFormaPago: valores.modalidadFormaPago,
      tipoEntregaParcializada: valores.tipoEntregaParcializada,
      detalleEntregaParcializada: valores.detalleEntregaParcializada.trim(),
      antecedentes: {
        campusSede: valores.antecedentes.campusSede,
        fechaFormulario: valores.antecedentes.fechaFormulario
          ? valores.antecedentes.fechaFormulario.toISOString().slice(0, 10)
          : '',
        formalizaSoloConFormularioLeasingObra:
          valores.antecedentes.formalizaSoloConFormularioLeasingObra,
        jefeCrNombre: valores.antecedentes.jefeCrNombre.trim(),
        jefeCrCargo: valores.antecedentes.jefeCrCargo.trim(),
        coordinadorEsMismoJefeCr: valores.antecedentes.coordinadorEsMismoJefeCr,
        tipoPresupuesto: valores.antecedentes.tipoPresupuesto,
        hacerVisiblePresupuestoEstimado: valores.antecedentes.hacerVisiblePresupuestoEstimado,
        requiereGarantiaSeriedad: valores.antecedentes.requiereGarantiaSeriedad,
        montoGarantiaSeriedadClp: valores.antecedentes.requiereGarantiaSeriedad
          ? (valores.antecedentes.montoGarantiaSeriedadClp ?? null)
          : null,
        visitaTerreno: valores.antecedentes.visitaTerreno,
        visitaDiasCorridosPublicacion:
          valores.antecedentes.visitaTerreno !== 'no_requiere'
            ? (valores.antecedentes.visitaDiasCorridosPublicacion ?? null)
            : null,
        visitaHora: valores.antecedentes.visitaHora.trim(),
        visitaGuiaNombreCargo: valores.antecedentes.visitaGuiaNombreCargo.trim(),
        visitaFormato: valores.antecedentes.visitaFormato,
        visitaDetalleLugarOEnlace: valores.antecedentes.visitaDetalleLugarOEnlace.trim(),
        otrasConsideraciones: valores.antecedentes.otrasConsideraciones.trim(),
      },
      tipoEvaluacion: valores.tipoEvaluacion,
      comisionEvaluadora: valores.comisionEvaluadora.map((integrante) => ({
        nombreCompleto: integrante.nombreCompleto.trim(),
        run: integrante.run.trim(),
        cargo: integrante.cargo.trim(),
        calidadContractual: integrante.calidadContractual.trim(),
        correo: integrante.correo.trim(),
      })),
      criteriosEvaluacion: {
        aplicaRequisitosFormales: valores.criteriosEvaluacion.aplicaRequisitosFormales,
        ponderacionRequisitosFormales: valores.criteriosEvaluacion.aplicaRequisitosFormales
          ? (valores.criteriosEvaluacion.ponderacionRequisitosFormales ?? 0)
          : 0,
        aplicaPactoIntegridad: valores.criteriosEvaluacion.aplicaPactoIntegridad,
        ponderacionPactoIntegridad: valores.criteriosEvaluacion.aplicaPactoIntegridad
          ? (valores.criteriosEvaluacion.ponderacionPactoIntegridad ?? 0)
          : 0,
        ponderacionPrecio: valores.criteriosEvaluacion.ponderacionPrecio ?? 0,
        mecanismoPrecio: valores.criteriosEvaluacion.mecanismoPrecio,
        aplicaPlazoEntrega: valores.criteriosEvaluacion.aplicaPlazoEntrega,
        ponderacionPlazoEntrega: valores.criteriosEvaluacion.aplicaPlazoEntrega
          ? (valores.criteriosEvaluacion.ponderacionPlazoEntrega ?? 0)
          : 0,
        tipoDiasPlazoEntrega: valores.criteriosEvaluacion.tipoDiasPlazoEntrega,
        plazoMaximoEntregaDias: valores.criteriosEvaluacion.plazoMaximoEntregaDias,
        mecanismoPlazoEntrega: valores.criteriosEvaluacion.mecanismoPlazoEntrega,
        aplicaExperiencia: valores.criteriosEvaluacion.aplicaExperiencia,
        ponderacionExperiencia: valores.criteriosEvaluacion.aplicaExperiencia
          ? (valores.criteriosEvaluacion.ponderacionExperiencia ?? 0)
          : 0,
        especificacionRubroExperiencia:
          valores.criteriosEvaluacion.especificacionRubroExperiencia.trim(),
        modoMedicionExperiencia: valores.criteriosEvaluacion.modoMedicionExperiencia,
        rangoMaximoExperiencia: valores.criteriosEvaluacion.rangoMaximoExperiencia.trim(),
        rangoMedioExperiencia: valores.criteriosEvaluacion.rangoMedioExperiencia.trim(),
        rangoMinimoExperiencia: valores.criteriosEvaluacion.rangoMinimoExperiencia.trim(),
        documentosRespaldoExperiencia:
          valores.criteriosEvaluacion.documentosRespaldoExperiencia.trim(),
        aplicaPlazoGarantia: valores.criteriosEvaluacion.aplicaPlazoGarantia,
        ponderacionPlazoGarantia: valores.criteriosEvaluacion.aplicaPlazoGarantia
          ? (valores.criteriosEvaluacion.ponderacionPlazoGarantia ?? 0)
          : 0,
        mecanismoPlazoGarantia: valores.criteriosEvaluacion.mecanismoPlazoGarantia,
        otrosCriterios: valores.criteriosEvaluacion.otrosCriterios.map((crit) => ({
          nombre: crit.nombre.trim(),
          ponderacion: crit.ponderacion ?? 0,
          mecanismoAsignacion: crit.mecanismoAsignacion.trim(),
        })),
      },
    },
  }
}

export function transformarTratoDirectoAPayload(
  valores: TratoDirectoFormValues,
): NuevoFormularioPayload {
  const montoClp = valores.montoEstimadoClp ?? 0
  const primerCotizacion = valores.archivoCotizacion[0]
  const primerDeclaracion = valores.archivoDeclaracionJurada[0]

  const nombreCotizacion =
    primerCotizacion?.kind === 'pending'
      ? primerCotizacion.file.name
      : (primerCotizacion?.name ?? 'cotizacion.pdf')

  const nombreDeclaracion =
    primerDeclaracion?.kind === 'pending'
      ? primerDeclaracion.file.name
      : (primerDeclaracion?.name ?? 'declaracion_jurada.pdf')

  return {
    modalidad: 'trato_directo',
    titulo: valores.titulo.trim(),
    codigoEdelfos: valores.codigoEdelfos.trim().toUpperCase(),
    tipoSolicitud: valores.tipoSolicitud,
    montoEstimadoClp: montoClp,
    montoEstimadoUtm: calcularMontoUtm(montoClp),
    coordinador: {
      nombreCompleto: valores.coordinador.nombreCompleto.trim(),
      run: valores.coordinador.run.trim(),
      correo: valores.coordinador.correo.trim(),
      cargo: valores.coordinador.cargo.trim(),
      crCodigo: valores.coordinador.crCodigo ?? 1,
      crNombre: valores.coordinador.crNombre.trim(),
    },
    disposiciones: {
      porcentajeMultaDiaria: valores.disposiciones.porcentajeMultaDiaria ?? 0.5,
      topeDiasMulta: valores.disposiciones.topeDiasMulta ?? 20,
      topePorcentajeContrato: valores.disposiciones.topePorcentajeContrato === '10' ? 10 : 20,
      plazoPagoDias: valores.disposiciones.plazoPagoDias ?? 30,
      aceptaTerminoAnticipadoArt130: valores.disposiciones.aceptaTerminoAnticipadoArt130,
    },
    tratoDirecto: {
      proveedorNombre: valores.proveedorNombre.trim(),
      proveedorRut: valores.proveedorRut.trim(),
      causal: valores.causal,
      objetivoImportancia: valores.objetivoImportancia.trim(),
      justificacionProveedorUnico: valores.justificacionProveedorUnico.trim(),
      informeCostos7b: valores.informeCostos7b.trim(),
      certificaNoConvenioMarco: valores.certificaNoConvenioMarco,
      compromisoNoFragmentacion: valores.compromisoNoFragmentacion,
      nombreArchivoCotizacion: nombreCotizacion,
      nombreArchivoDeclaracionJurada: nombreDeclaracion,
    },
  }
}
