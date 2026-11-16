import type { SelectOption } from '@/types/select'
import type { PeriodoPresupuestario } from '@/features/transacciones/types/transaccion.types'

export const financiamientoOptions: SelectOption[] = [
  { value: 'institucional', label: 'Institucional' },
  { value: 'proyectos', label: 'Proyectos' },
]

export const tipoSolicitudOptions: SelectOption[] = [
  { value: 'SASERVI', label: 'SASERVI' },
  { value: 'SABIENES', label: 'SABIENES' },
]

export const estadoTransaccionOptions: SelectOption[] = [
  { value: 'en_cotizacion', label: 'En cotización' },
  { value: 'cotizada', label: 'Cotizada' },
  { value: 'presupuesto_solicitado', label: 'Presupuesto solicitado' },
  { value: 'presupuesto_asignado', label: 'Presupuesto asignado' },
  { value: 'enviada_a_adquisiciones', label: 'Enviada a adquisiciones' },
  { value: 'analista_asignado', label: 'Analista asignado' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'aprobada_con_observaciones', label: 'Aprobada con observaciones' },
  { value: 'subsanada', label: 'Subsanada' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'evaluada', label: 'Evaluada' },
  { value: 'facturada', label: 'Facturada' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'rechazada', label: 'Rechazada' },
]

export const estadoSolicitudOptions: SelectOption[] = [
  { value: 'enviada', label: 'Enviada' },
  { value: 'asignado', label: 'Asignado' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completada', label: 'Completada' },
  { value: 'rechazada', label: 'Rechazada' },
]

export const modalidadOptions: SelectOption[] = [
  { value: 'agil', label: 'Compra Ágil' },
  { value: 'privada', label: 'Licitación privada' },
  { value: 'publica', label: 'Licitación publica' },
  { value: 'directo', label: 'Trato directo' },
  { value: 'conveniosuministro', label: 'Convenio de suministro' },
  { value: 'conveniomarco', label: 'Convenio marco' },
]

export const estadoEvaluacionOptions: SelectOption[] = [
  { value: 'sindefinir', label: 'Sin definir' },
  { value: 'en_evaluacion', label: 'En evaluación' },
  { value: 'evaluado', label: 'Evaluado' },
  { value: 'norequiere', label: 'No requiere' },
]

export const estadoFacturaOptions: SelectOption[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aceptada', label: 'Aceptada' },
  { value: 'rechazada', label: 'Rechazada' },
]

export const tipoSolicitanteOptions: SelectOption[] = [
  { value: 'carrera', label: 'Carrera' },
  { value: 'unidad', label: 'Unidad' },
]

export const periodoPresupuestarioOptions: PeriodoPresupuestario[] = [
  { value: '2025', label: '2025', anio: 2025, enCurso: false },
  { value: '2026', label: '2026', anio: 2026, enCurso: true },
  { value: '2027', label: '2027', anio: 2027, enCurso: false },
  { value: '2028', label: '2028', anio: 2028, enCurso: false },
]
