import type {
  CambioCantidad,
  CambioFecha,
  CambioTexto,
  TipoEventoRequerimiento,
} from '@/features/requerimientos/types/evento.types'
import type {
  EstadoImportacion,
  OpcionEstadoImportacion,
  ResultadoFila,
} from '@/features/requerimientos/types/importacion.types'
import type {
  EstadoRequerimiento,
  OpcionEstadoRequerimiento,
} from '@/features/requerimientos/types/requerimiento.types'

export interface RequerimientoAlmacenado {
  id: number
  identificador: string
  solicitanteId: number
  materiales: string
  descripcion: string | null
  cantidad: number
  estado: EstadoRequerimiento
  modalidad: string | null
  ordenDeCompra: string | null
  fechaMaximaLlegada: string | null
  fechaLlegada: string | null
  observaciones: string | null
  carpeta: string | null
  actualizadoEn: string
  eliminado: boolean
}

export type ValoresRequerimiento = Omit<
  RequerimientoAlmacenado,
  'id' | 'solicitanteId' | 'actualizadoEn' | 'eliminado'
>

export type CambioAlmacenado =
  | CambioTexto
  | CambioFecha
  | CambioCantidad
  | {
      campo: 'estado'
      anterior: EstadoRequerimiento | null
      nuevo: EstadoRequerimiento | null
    }
  | { campo: 'modalidad'; anterior: string | null; nuevo: string | null }

export interface EventoAlmacenado {
  id: number
  requerimientoId: number
  importacionId: number
  fila: number | null
  tipo: TipoEventoRequerimiento
  fecha: string
  autor: string
  cambios: CambioAlmacenado[]
}

export interface ImportacionAlmacenada {
  id: number
  fecha: string
  autor: string
  solicitanteId: number
  nombreArchivo: string
  tamanoArchivo: number
  huellaArchivo: string
  estado: EstadoImportacion
  filasNuevas: number
  filasRestauradas: number
  filasConCambios: number
  filasSinCambios: number
  filasConErrores: number
  requerimientosEliminados: number
}

export interface FilaRevisionAlmacenada {
  fila: number
  identificador: string
  requerimientoId: number | null
  materiales: string | null
  resultado: ResultadoFila
  errores: string[]
  cambios: CambioAlmacenado[]
  valores: ValoresRequerimiento | null
}

export interface RevisionPendienteAlmacenada {
  versionSolicitante: number
  filas: FilaRevisionAlmacenada[]
  eliminaciones: number[]
}

interface FilaDeEjemplo {
  cantidad: number
  estadoInicial: EstadoRequerimiento
  estadoActual: EstadoRequerimiento
  ordenDeCompraInicial: string | null
  ordenDeCompraActual: string
  fechaMaximaLlegada: string | null
  carpeta: string | null
}

export const AUTOR_SIMULADO = 'Usuario de prueba'

const SOLICITANTE_ID = 1
const MODALIDAD = 'agil'
const ARCHIVO_ORIGINAL = 'Excel-Carrera_sin_nombre.xlsx'
const ARCHIVO_CON_IDENTIFICADORES = 'planilla-con-identificadores.xlsx'
const PRIMERA_CARGA = '2026-09-15T10:24:00'
const CARGA_DESCARTADA = '2026-09-22T16:41:00'
const CARGA_ACTUALIZACION = '2026-09-29T09:05:00'
const FECHA_MAXIMA_COMPRADAS = '2026-10-05'

export const estadosRequerimientoMock: OpcionEstadoRequerimiento[] = [
  { value: 'comprado', label: 'Comprado' },
  { value: 'en_bodega', label: 'En bodega' },
  { value: 'no_comprado', label: 'No comprado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'desestimado', label: 'Desestimado' },
]

export const estadosImportacionMock: OpcionEstadoImportacion[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'descartada', label: 'Descartada' },
]

function entregada(cantidad: number): FilaDeEjemplo {
  return {
    cantidad,
    estadoInicial: 'comprado',
    estadoActual: 'entregado',
    ordenDeCompraInicial: '5413',
    ordenDeCompraActual: '5413',
    fechaMaximaLlegada: null,
    carpeta: null,
  }
}

function comprada(cantidad: number, ordenDeCompra: string): FilaDeEjemplo {
  return {
    cantidad,
    estadoInicial: 'no_comprado',
    estadoActual: 'comprado',
    ordenDeCompraInicial: null,
    ordenDeCompraActual: ordenDeCompra,
    fechaMaximaLlegada: FECHA_MAXIMA_COMPRADAS,
    carpeta: `https://drive.google.com/drive/folders/carpeta-${ordenDeCompra.toLowerCase()}`,
  }
}

const FILAS_DE_EJEMPLO: FilaDeEjemplo[] = [
  entregada(30),
  entregada(15),
  entregada(2),
  entregada(2),
  entregada(2),
  entregada(2),
  entregada(1000),
  entregada(1000),
  entregada(1000),
  comprada(4, 'G32'),
  comprada(3, 'G33'),
  comprada(1, 'G34'),
]

function nombreMaterial(requerimientoId: number): string {
  return `Material ${requerimientoId}`
}

function cambiosIniciales(fila: FilaDeEjemplo, requerimientoId: number): CambioAlmacenado[] {
  const cambios: CambioAlmacenado[] = [
    { campo: 'materiales', anterior: null, nuevo: nombreMaterial(requerimientoId) },
    { campo: 'cantidad', anterior: null, nuevo: fila.cantidad },
    { campo: 'estado', anterior: null, nuevo: fila.estadoInicial },
    { campo: 'modalidad', anterior: null, nuevo: MODALIDAD },
  ]

  if (fila.ordenDeCompraInicial !== null) {
    cambios.push({ campo: 'ordenDeCompra', anterior: null, nuevo: fila.ordenDeCompraInicial })
  }

  return cambios
}

function cambiosActualizacion(fila: FilaDeEjemplo): CambioAlmacenado[] {
  const cambios: CambioAlmacenado[] = [
    { campo: 'estado', anterior: fila.estadoInicial, nuevo: fila.estadoActual },
  ]

  if (fila.ordenDeCompraInicial !== fila.ordenDeCompraActual) {
    cambios.push({
      campo: 'ordenDeCompra',
      anterior: fila.ordenDeCompraInicial,
      nuevo: fila.ordenDeCompraActual,
    })
  }

  if (fila.fechaMaximaLlegada !== null) {
    cambios.push({ campo: 'fechaMaximaLlegada', anterior: null, nuevo: fila.fechaMaximaLlegada })
  }

  if (fila.carpeta !== null) {
    cambios.push({ campo: 'carpeta', anterior: null, nuevo: fila.carpeta })
  }

  return cambios
}

function crearRequerimientosIniciales(): RequerimientoAlmacenado[] {
  return FILAS_DE_EJEMPLO.map(
    (fila, indice): RequerimientoAlmacenado => ({
      id: indice + 1,
      identificador: String(indice + 1),
      solicitanteId: SOLICITANTE_ID,
      materiales: nombreMaterial(indice + 1),
      descripcion: null,
      cantidad: fila.cantidad,
      estado: fila.estadoActual,
      modalidad: MODALIDAD,
      ordenDeCompra: fila.ordenDeCompraActual,
      fechaMaximaLlegada: fila.fechaMaximaLlegada,
      fechaLlegada: null,
      observaciones: null,
      carpeta: fila.carpeta,
      actualizadoEn: CARGA_ACTUALIZACION,
      eliminado: false,
    }),
  )
}

function crearEventosIniciales(): EventoAlmacenado[] {
  return FILAS_DE_EJEMPLO.flatMap((fila, indice): EventoAlmacenado[] => {
    const requerimientoId = indice + 1
    const filaDePlanilla = indice + 2

    return [
      {
        id: requerimientoId,
        requerimientoId,
        importacionId: 1,
        fila: filaDePlanilla,
        tipo: 'creacion',
        fecha: PRIMERA_CARGA,
        autor: AUTOR_SIMULADO,
        cambios: cambiosIniciales(fila, requerimientoId),
      },
      {
        id: FILAS_DE_EJEMPLO.length + requerimientoId,
        requerimientoId,
        importacionId: 3,
        fila: filaDePlanilla,
        tipo: 'actualizacion',
        fecha: CARGA_ACTUALIZACION,
        autor: AUTOR_SIMULADO,
        cambios: cambiosActualizacion(fila),
      },
    ]
  })
}

function crearImportacionesIniciales(): ImportacionAlmacenada[] {
  return [
    {
      id: 1,
      fecha: PRIMERA_CARGA,
      autor: AUTOR_SIMULADO,
      solicitanteId: SOLICITANTE_ID,
      nombreArchivo: ARCHIVO_ORIGINAL,
      tamanoArchivo: 13642,
      huellaArchivo: '1'.repeat(64),
      estado: 'confirmada',
      filasNuevas: 12,
      filasRestauradas: 0,
      filasConCambios: 0,
      filasSinCambios: 0,
      filasConErrores: 0,
      requerimientosEliminados: 0,
    },
    {
      id: 2,
      fecha: CARGA_DESCARTADA,
      autor: AUTOR_SIMULADO,
      solicitanteId: SOLICITANTE_ID,
      nombreArchivo: ARCHIVO_CON_IDENTIFICADORES,
      tamanoArchivo: 9974,
      huellaArchivo: '2'.repeat(64),
      estado: 'descartada',
      filasNuevas: 0,
      filasRestauradas: 0,
      filasConCambios: 11,
      filasSinCambios: 0,
      filasConErrores: 1,
      requerimientosEliminados: 0,
    },
    {
      id: 3,
      fecha: CARGA_ACTUALIZACION,
      autor: AUTOR_SIMULADO,
      solicitanteId: SOLICITANTE_ID,
      nombreArchivo: ARCHIVO_CON_IDENTIFICADORES,
      tamanoArchivo: 10012,
      huellaArchivo: '3'.repeat(64),
      estado: 'confirmada',
      filasNuevas: 0,
      filasRestauradas: 0,
      filasConCambios: 12,
      filasSinCambios: 0,
      filasConErrores: 0,
      requerimientosEliminados: 0,
    },
  ]
}

function reemplazarContenido<T>(destino: T[], contenido: T[]): void {
  destino.splice(0, destino.length, ...contenido)
}

export const requerimientosMock: RequerimientoAlmacenado[] = crearRequerimientosIniciales()

export const eventosRequerimientosMock: EventoAlmacenado[] = crearEventosIniciales()

export const importacionesRequerimientosMock: ImportacionAlmacenada[] =
  crearImportacionesIniciales()

export const revisionesPendientesMock = new Map<number, RevisionPendienteAlmacenada>()

export function restablecerRequerimientosMock(): void {
  reemplazarContenido(requerimientosMock, crearRequerimientosIniciales())
  reemplazarContenido(eventosRequerimientosMock, crearEventosIniciales())
  reemplazarContenido(importacionesRequerimientosMock, crearImportacionesIniciales())
  revisionesPendientesMock.clear()
}
