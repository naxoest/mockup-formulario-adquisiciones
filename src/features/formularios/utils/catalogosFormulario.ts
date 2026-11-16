import type {
  LicitacionPublicaFormValues,
  TratoDirectoFormValues,
} from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import type {
  CategoriaRequerimientoLicitacion,
  CausalTratoDirecto,
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
  ModalidadFormulario,
  TipoFormalizacionLicitacion,
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

export const OPCIONES_TIPO_SOLICITUD_EDELFOS: SelectOption[] = [
  { value: 'SASERVI', label: 'SASERVI — Gastos indirectos (Servicios)' },
  { value: 'SASERDIR', label: 'SASERDIR — Material de enseñanza (Docencia)' },
  { value: 'SAEXIST', label: 'SAEXIST — Compra de existencias' },
  { value: 'SABIENES', label: 'SABIENES — Compra de bienes y equipamiento' },
]

export const OPCIONES_CATEGORIA_LICITACION: OpcionRadioConDescripcion[] = [
  {
    value: 'productos',
    label: '1. Productos y Bienes',
    description: 'Exige unidad de medida, materialidad, equivalencias, garantías e instalación.',
  },
  {
    value: 'servicios',
    label: '2. Servicios',
    description: 'Requiere metodología, fechas estimadas, hitos de entrega y normativas.',
  },
  {
    value: 'bibliografia',
    label: '3. Bibliografía',
    description: 'Exige ISBN/ISSN, autor, editorial y visación de la Dirección de Biblioteca.',
  },
]

export const OPCIONES_FORMALIZACION_LICITACION: OpcionRadioConDescripcion[] = [
  {
    value: 'solo_oc',
    label: 'Solo Orden de Compra (OC) aceptada',
    description: 'Obligatorio en compras menores a 100 UTM; opcional entre 100 y 1.000 UTM.',
  },
  {
    value: 'contrato_y_oc',
    label: 'Contrato + Orden de Compra aceptada',
    description: 'Obligatorio en compras mayores a 1.000 UTM; opcional entre 100 y 1.000 UTM.',
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
    description: 'Límite máximo estándar institucional antes de término anticipado.',
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

export const ETIQUETAS_CATEGORIA_LICITACION: Record<CategoriaRequerimientoLicitacion, string> = {
  productos: 'Productos',
  servicios: 'Servicios',
  bibliografia: 'Bibliografía',
}

export const ETIQUETAS_FORMALIZACION: Record<TipoFormalizacionLicitacion, string> = {
  solo_oc: 'Solo Orden de Compra (OC)',
  contrato_y_oc: 'Contrato + Orden de Compra',
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
      formalizacion: valores.formalizacion,
      productos: valores.productos.map((item) => ({
        descripcion: item.descripcion.trim(),
        cantidad: item.cantidad ?? 1,
        unidadMedida: item.unidadMedida.trim(),
        materialidad: item.materialidad.trim(),
        permiteEquivalentes: item.permiteEquivalentes,
        mesesGarantia: item.mesesGarantia ?? 6,
        requiereInstalacion: item.requiereInstalacion,
      })),
      servicios: valores.servicios.map((item) => ({
        nombreServicio: item.nombreServicio.trim(),
        metodologiaExigida: item.metodologiaExigida.trim(),
        hitosPrincipales: item.hitosPrincipales.trim(),
        fechaInicioEstimada: item.fechaInicioEstimada
          ? item.fechaInicioEstimada.toISOString().slice(0, 10)
          : '',
        fechaTerminoEstimada: item.fechaTerminoEstimada
          ? item.fechaTerminoEstimada.toISOString().slice(0, 10)
          : '',
        normativasAplicables: item.normativasAplicables.trim(),
      })),
      bibliografia: valores.bibliografia.map((item) => ({
        titulo: item.titulo.trim(),
        autor: item.autor.trim(),
        editorial: item.editorial.trim(),
        isbnIssn: item.isbnIssn.trim(),
        edicionAnio: item.edicionAnio ?? 2026,
        cantidadEjemplares: item.cantidadEjemplares ?? 1,
        visadoDireccionBiblioteca: item.visadoDireccionBiblioteca,
      })),
      comisionEvaluadora: valores.comisionEvaluadora.map((integrante) => ({
        nombreCompleto: integrante.nombreCompleto.trim(),
        run: integrante.run.trim(),
        cargo: integrante.cargo.trim(),
        unidad: integrante.unidad.trim(),
      })),
      criteriosEvaluacion: {
        ponderacionAdministrativa: valores.criteriosEvaluacion.ponderacionAdministrativa ?? 0,
        ponderacionEconomica: valores.criteriosEvaluacion.ponderacionEconomica ?? 0,
        ponderacionPlazoEntrega: valores.criteriosEvaluacion.ponderacionPlazoEntrega ?? 0,
        ponderacionExperiencia: valores.criteriosEvaluacion.ponderacionExperiencia ?? 0,
        ponderacionGarantia: valores.criteriosEvaluacion.ponderacionGarantia ?? 0,
        mesesGarantiaMinima: valores.criteriosEvaluacion.mesesGarantiaMinima ?? 6,
        exigePactoIntegridad: valores.criteriosEvaluacion.exigePactoIntegridad,
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
