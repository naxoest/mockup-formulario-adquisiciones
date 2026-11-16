export type TipoSolicitudEdelfos = 'SASERVI' | 'SASERDIR' | 'SAEXIST' | 'SABIENES'

export type ModalidadFormulario = 'licitacion_publica' | 'trato_directo'

export type EstadoFormularioAdquisicion = 'borrador' | 'en_revision' | 'aprobado' | 'observado'

export type CampusSedeUlagos = 'osorno' | 'puerto_montt' | 'santiago' | 'ancud' | 'castro'

export type CategoriaRequerimientoLicitacion = 'productos' | 'servicios' | 'bibliografia'

export type TipoFormalizacionLicitacion = 'solo_oc' | 'contrato_y_oc'

export type ModalidadDuracionContrato = 'plazo_ofertado' | 'meses_fijos'

export type DireccionDespachoCodigo =
  | 'osorno_fuchslocher'
  | 'puerto_montt_chinquihue'
  | 'santiago_republica'
  | 'ancud_ramirez'
  | 'castro_mansilla'
  | 'otra'

export type ModalidadFormaPagoLicitacion =
  | 'recepcion_conforme_total'
  | 'entrega_parcializada'
  | 'financiamiento_leasing'

export type TipoEntregaParcializada = 'mes_vencido' | 'informe_avance' | 'etapa_cumplida' | 'otra'

export type TipoPresupuestoLicitacion = 'disponible' | 'estimado'

export type ModalidadVisitaTerreno = 'no_requiere' | 'obligatoria' | 'voluntaria'

export type FormatoVisitaTerreno = 'presencial' | 'virtual'

export type TipoEvaluacionOfertas = 'completa' | 'por_linea'

export type MecanismoPrecioEconomico = 'formula_proporcional' | 'tramos_ranking'

export type TipoDiasPlazo = 'habiles' | 'corridos'

export type MecanismoPlazoEntrega = 'formula_menor_plazo' | 'rangos_dias'

export type ModoMedicionExperiencia = 'cantidad_servicios' | 'anios_experiencia'

export type MecanismoPlazoGarantia = 'formula_mayor_garantia' | 'rangos_meses'

export type SituacionConvenioMarco =
  | 'no_disponible'
  | 'condiciones_regionales_o_monto_minimo'
  | 'compra_agil_sin_resultados'

export type CausalTratoDirecto =
  | 'costo_desproporcionado_7b'
  | 'proveedor_unico'
  | 'emergencia_urgencia'
  | 'servicios_confianza'
  | 'seguridad_o_equipamiento_critico'

export type DocumentoAcreditacionAdicional =
  | 'certificado_proveedor_unico'
  | 'certificado_servicio_tecnico'
  | 'convenio_cooperacion'
  | 'informe_tecnico'
  | 'otro'

export interface DatosCoordinadorContrato {
  nombreCompleto: string
  run: string
  correo: string
  cargo: string
  crCodigo: number
  crNombre: string
}

export interface DisposicionesContractuales {
  porcentajeMultaDiaria: number
  topeDiasMulta: number
  topePorcentajeContrato: 10 | 20
  plazoPagoDias: number
  aceptaTerminoAnticipadoArt130: boolean
}

export interface ItemProductoLicitacion {
  cantidad: number
  especificacionesTecnicas: string
  nombreImagenReferencia: string
  requiereGarantia: boolean
  mesesGarantia: number | null
}

export interface ItemBibliografiaLicitacion {
  titulo: string
  autor: string
  editorial: string
  numeroEdicion: string
  idioma: string
  isbnIssn: string
  cantidad: number
}

export interface OtroIncumplimientoLicitacion {
  tipoIncumplimiento: string
  sancionAplicar: string
}

export interface AntecedentesGeneralesLicitacion {
  campusSede: CampusSedeUlagos
  fechaFormulario: string
  formalizaSoloConFormularioLeasingObra: boolean
  jefeCrNombre: string
  jefeCrCargo: string
  coordinadorEsMismoJefeCr: boolean
  tipoPresupuesto: TipoPresupuestoLicitacion
  hacerVisiblePresupuestoEstimado: boolean
  requiereGarantiaSeriedad: boolean
  montoGarantiaSeriedadClp: number | null
  visitaTerreno: ModalidadVisitaTerreno
  visitaDiasCorridosPublicacion: number | null
  visitaHora: string
  visitaGuiaNombreCargo: string
  visitaFormato: FormatoVisitaTerreno
  visitaDetalleLugarOEnlace: string
  otrasConsideraciones: string
}

export interface IntegranteComision {
  nombreCompleto: string
  run: string
  cargo: string
  calidadContractual: string
  correo: string
}

export interface CriterioAdicionalLicitacion {
  nombre: string
  ponderacion: number
  mecanismoAsignacion: string
}

export interface CriteriosEvaluacionLicitacion {
  aplicaRequisitosFormales: boolean
  ponderacionRequisitosFormales: number
  aplicaPactoIntegridad: boolean
  ponderacionPactoIntegridad: number
  ponderacionPrecio: number
  mecanismoPrecio: MecanismoPrecioEconomico
  aplicaPlazoEntrega: boolean
  ponderacionPlazoEntrega: number
  tipoDiasPlazoEntrega: TipoDiasPlazo
  plazoMaximoEntregaDias: number | null
  mecanismoPlazoEntrega: MecanismoPlazoEntrega
  aplicaExperiencia: boolean
  ponderacionExperiencia: number
  especificacionRubroExperiencia: string
  modoMedicionExperiencia: ModoMedicionExperiencia
  rangoMaximoExperiencia: string
  rangoMedioExperiencia: string
  rangoMinimoExperiencia: string
  documentosRespaldoExperiencia: string
  aplicaPlazoGarantia: boolean
  ponderacionPlazoGarantia: number
  mecanismoPlazoGarantia: MecanismoPlazoGarantia
  otrosCriterios: CriterioAdicionalLicitacion[]
}

export interface DetalleLicitacionPublica {
  categoriaRequerimiento: CategoriaRequerimientoLicitacion
  productos: ItemProductoLicitacion[]
  especificacionesTecnicasServicio: string
  nombrePlanillaValidacionBiblioteca: string
  bibliografia: ItemBibliografiaLicitacion[]
  formalizacion: TipoFormalizacionLicitacion
  modalidadDuracionContrato: ModalidadDuracionContrato
  duracionContratoMeses: number | null
  direccionDespachoCodigo: DireccionDespachoCodigo
  direccionDespachoOtra: string
  otrosIncumplimientos: OtroIncumplimientoLicitacion[]
  modalidadFormaPago: ModalidadFormaPagoLicitacion
  tipoEntregaParcializada: TipoEntregaParcializada
  detalleEntregaParcializada: string
  antecedentes: AntecedentesGeneralesLicitacion
  tipoEvaluacion: TipoEvaluacionOfertas
  comisionEvaluadora: IntegranteComision[]
  criteriosEvaluacion: CriteriosEvaluacionLicitacion
}

export interface ItemRequeridoTratoDirecto {
  cantidad: number
  descripcionDetallada: string
}

export interface LineaCotizacionTratoDirecto {
  cantidad: number
  detalle: string
  precioUnitarioNeto: number
  precioTotalNeto: number
}

export interface CondicionesCompraTratoDirecto {
  plazoEntregaDiasHabiles: number
  esServicio: boolean
  fechaInicioServicio: string
  fechaTerminoServicio: string
  requiereGarantia: boolean
  mesesGarantia: number | null
  aplicaDireccionDespacho: boolean
  direccionDespachoCodigo: DireccionDespachoCodigo
  direccionDespachoOtra: string
}

export interface DetalleTratoDirecto {
  campusSede: CampusSedeUlagos
  fechaFormulario: string
  itemsRequeridos: ItemRequeridoTratoDirecto[]
  situacionConvenioMarco: SituacionConvenioMarco
  causal: CausalTratoDirecto
  objetivoImportancia: string
  motivosEleccionProveedor: string
  justificacionCausalEscogida: string
  proveedorNombre: string
  proveedorRut: string
  lineasCotizacion: LineaCotizacionTratoDirecto[]
  afectoIva: boolean
  montoNetoClp: number
  montoIvaClp: number
  montoTotalClp: number
  condicionesCompra: CondicionesCompraTratoDirecto
  otrosIncumplimientos: OtroIncumplimientoLicitacion[]
  compromisoEstandarSimpleOc: boolean
  compromisoNoFragmentacion: boolean
  jefeCrNombre: string
  jefeCrCargo: string
  coordinadorEsMismoJefeCr: boolean
  nombreArchivoCotizacion: string
  nombreArchivoDeclaracionJurada: string
  documentosAdicionales: DocumentoAcreditacionAdicional[]
  otroDocumentoAdicionalDetalle: string
}

export interface FormularioAdquisicionBase {
  id: string
  folio: string
  titulo: string
  codigoEdelfos: string
  tipoSolicitud: TipoSolicitudEdelfos
  estado: EstadoFormularioAdquisicion
  montoEstimadoClp: number
  montoEstimadoUtm: number
  coordinador: DatosCoordinadorContrato
  disposiciones: DisposicionesContractuales
  creadoEn: string
  actualizadoEn: string
}

export type FormularioAdquisicion =
  | (FormularioAdquisicionBase & {
      modalidad: 'licitacion_publica'
      licitacion: DetalleLicitacionPublica
    })
  | (FormularioAdquisicionBase & {
      modalidad: 'trato_directo'
      tratoDirecto: DetalleTratoDirecto
    })
