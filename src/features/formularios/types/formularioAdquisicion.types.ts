export type TipoSolicitudEdelfos = 'SASERVI' | 'SASERDIR' | 'SAEXIST' | 'SABIENES'
export type ModalidadFormulario = 'licitacion_publica' | 'trato_directo'
export type EstadoFormularioAdquisicion = 'borrador' | 'en_revision' | 'aprobado' | 'observado'
export type CategoriaRequerimientoLicitacion = 'productos' | 'servicios' | 'bibliografia'
export type TipoFormalizacionLicitacion = 'solo_oc' | 'contrato_y_oc'

export type CausalTratoDirecto =
  | 'proveedor_unico'
  | 'emergencia_urgencia'
  | 'costo_desproporcionado_7b'
  | 'servicios_confianza'
  | 'convenio_marco_no_disponible'

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
  descripcion: string
  cantidad: number
  unidadMedida: string
  materialidad: string
  permiteEquivalentes: boolean
  mesesGarantia: number
  requiereInstalacion: boolean
}
export interface ItemServicioLicitacion {
  nombreServicio: string
  metodologiaExigida: string
  hitosPrincipales: string
  fechaInicioEstimada: string
  fechaTerminoEstimada: string
  normativasAplicables: string
}
export interface ItemBibliografiaLicitacion {
  titulo: string
  autor: string
  editorial: string
  isbnIssn: string
  edicionAnio: number
  cantidadEjemplares: number
  visadoDireccionBiblioteca: boolean
}
export interface IntegranteComision {
  nombreCompleto: string
  run: string
  cargo: string
  unidad: string
}
export interface CriteriosEvaluacionLicitacion {
  ponderacionAdministrativa: number
  ponderacionEconomica: number
  ponderacionPlazoEntrega: number
  ponderacionExperiencia: number
  ponderacionGarantia: number
  mesesGarantiaMinima: number
  exigePactoIntegridad: boolean
}
export interface DetalleLicitacionPublica {
  categoriaRequerimiento: CategoriaRequerimientoLicitacion
  formalizacion: TipoFormalizacionLicitacion
  productos: ItemProductoLicitacion[]
  servicios: ItemServicioLicitacion[]
  bibliografia: ItemBibliografiaLicitacion[]
  comisionEvaluadora: IntegranteComision[]
  criteriosEvaluacion: CriteriosEvaluacionLicitacion
}
export interface DetalleTratoDirecto {
  proveedorNombre: string
  proveedorRut: string
  causal: CausalTratoDirecto
  objetivoImportancia: string
  justificacionProveedorUnico: string
  informeCostos7b: string
  certificaNoConvenioMarco: boolean
  compromisoNoFragmentacion: boolean
  nombreArchivoCotizacion: string
  nombreArchivoDeclaracionJurada: string
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
