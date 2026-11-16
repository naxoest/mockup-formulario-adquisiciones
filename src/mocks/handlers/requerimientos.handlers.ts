import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { nuevaImportacionRequestSchema } from '@/features/requerimientos/schemas/importacionRequest.schema'
import type {
  CambioRequerimiento,
  EventoRequerimiento,
  TipoEventoRequerimiento,
} from '@/features/requerimientos/types/evento.types'
import type {
  Importacion,
  ResultadoFila,
  RevisionImportacion,
} from '@/features/requerimientos/types/importacion.types'
import type {
  EstadoRequerimiento,
  OpcionEstadoRequerimiento,
  Requerimiento,
  SolicitanteRequerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import { formatearSolicitante } from '@/features/requerimientos/utils/formato'
import { modalidadOptions } from '@/mocks/data/listas.mock'
import {
  AUTOR_SIMULADO,
  estadosImportacionMock,
  estadosRequerimientoMock,
  eventosRequerimientosMock,
  importacionesRequerimientosMock,
  requerimientosMock,
  revisionesPendientesMock,
  type CambioAlmacenado,
  type EventoAlmacenado,
  type FilaRevisionAlmacenada,
  type ImportacionAlmacenada,
  type RequerimientoAlmacenado,
  type RevisionPendienteAlmacenada,
} from '@/mocks/data/requerimientos.mock'
import { opcionesDeSedes } from '@/mocks/data/unidadesSolicitantes.mock'
import { buscarUnidadSolicitante } from '@/mocks/handlers/unidadesSolicitantes.estado'
import { interpretarFilas } from '@/mocks/handlers/requerimientos.importacion'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import type { SelectOption } from '@/types/select'
import { toCivilDate } from '@/utils/date'

const RUTA = `${API_BASE_URL}/api/requerimientos`

interface Opcion {
  value: string
  label: string
}

interface Cronologico {
  id: number
  fecha: string
}

type ActualizacionRequerimiento = Partial<Omit<RequerimientoAlmacenado, 'id' | 'solicitanteId'>>

function buscarOpcion<T extends Opcion>(opciones: T[], valor: string): T {
  const opcion = opciones.find((candidata) => candidata.value === valor)

  if (opcion === undefined) {
    throw new Error(`El valor ${valor} no existe en el catálogo simulado`)
  }

  return opcion
}

function aOpcionEstado(valor: EstadoRequerimiento | null): OpcionEstadoRequerimiento | null {
  return valor === null ? null : buscarOpcion(estadosRequerimientoMock, valor)
}

function aOpcionModalidad(valor: string | null): SelectOption | null {
  return valor === null ? null : buscarOpcion(modalidadOptions, valor)
}

function buscarSolicitante(solicitanteId: number): SolicitanteRequerimiento {
  const unidad = buscarUnidadSolicitante(solicitanteId)

  if (unidad === undefined) {
    throw new Error(`El solicitante ${solicitanteId} no existe en los datos simulados`)
  }

  return {
    id: unidad.id,
    cr: unidad.cr,
    nombre: unidad.nombre,
    sedes: opcionesDeSedes(unidad.sedes),
    tipo: unidad.tipo,
  }
}

function buscarImportacion(importacionId: number): ImportacionAlmacenada {
  const importacion = importacionesRequerimientosMock.find(
    (candidata) => candidata.id === importacionId,
  )

  if (importacion === undefined) {
    throw new Error(`La importación ${importacionId} no existe en los datos simulados`)
  }

  return importacion
}

function compararDelMasReciente(a: Cronologico, b: Cronologico): number {
  if (a.fecha !== b.fecha) {
    return a.fecha < b.fecha ? 1 : -1
  }

  return b.id - a.id
}

function instanteActual(): string {
  const ahora = new Date()
  const hora = String(ahora.getHours()).padStart(2, '0')
  const minuto = String(ahora.getMinutes()).padStart(2, '0')
  const segundo = String(ahora.getSeconds()).padStart(2, '0')
  return `${toCivilDate(ahora)}T${hora}:${minuto}:${segundo}`
}

function siguienteId(registros: readonly { id: number }[]): number {
  return registros.reduce((maximo, registro) => Math.max(maximo, registro.id), 0) + 1
}

function versionSolicitante(solicitanteId: number): number {
  const propias = new Set(
    requerimientosMock
      .filter((requerimiento) => requerimiento.solicitanteId === solicitanteId)
      .map((requerimiento) => requerimiento.id),
  )

  return eventosRequerimientosMock.reduce(
    (version, evento) =>
      propias.has(evento.requerimientoId) ? Math.max(version, evento.id) : version,
    0,
  )
}

function aRespuestaRequerimiento(registro: RequerimientoAlmacenado): Requerimiento {
  return {
    id: registro.id,
    identificador: registro.identificador,
    solicitante: buscarSolicitante(registro.solicitanteId),
    materiales: registro.materiales,
    descripcion: registro.descripcion,
    cantidad: registro.cantidad,
    estado: buscarOpcion(estadosRequerimientoMock, registro.estado),
    modalidad: aOpcionModalidad(registro.modalidad),
    ordenDeCompra: registro.ordenDeCompra,
    fechaMaximaLlegada: registro.fechaMaximaLlegada,
    fechaLlegada: registro.fechaLlegada,
    observaciones: registro.observaciones,
    carpeta: registro.carpeta,
    actualizadoEn: registro.actualizadoEn,
    eliminado: registro.eliminado,
  }
}

function aRespuestaCambio(cambio: CambioAlmacenado): CambioRequerimiento {
  switch (cambio.campo) {
    case 'estado':
      return {
        campo: 'estado',
        anterior: aOpcionEstado(cambio.anterior),
        nuevo: aOpcionEstado(cambio.nuevo),
      }
    case 'modalidad':
      return {
        campo: 'modalidad',
        anterior: aOpcionModalidad(cambio.anterior),
        nuevo: aOpcionModalidad(cambio.nuevo),
      }
    default:
      return cambio
  }
}

function aRespuestaEvento(evento: EventoAlmacenado): EventoRequerimiento {
  const importacion = buscarImportacion(evento.importacionId)

  return {
    id: evento.id,
    tipo: evento.tipo,
    fecha: evento.fecha,
    autor: evento.autor,
    origen: {
      importacionId: importacion.id,
      fila: evento.fila,
      nombreArchivo: importacion.nombreArchivo,
    },
    cambios: evento.cambios.map(aRespuestaCambio),
  }
}

function aRespuestaImportacion(registro: ImportacionAlmacenada): Importacion {
  return {
    id: registro.id,
    fecha: registro.fecha,
    autor: registro.autor,
    solicitante: buscarSolicitante(registro.solicitanteId),
    nombreArchivo: registro.nombreArchivo,
    estado: buscarOpcion(estadosImportacionMock, registro.estado),
    filasNuevas: registro.filasNuevas,
    filasRestauradas: registro.filasRestauradas,
    filasConCambios: registro.filasConCambios,
    filasSinCambios: registro.filasSinCambios,
    filasConErrores: registro.filasConErrores,
    requerimientosEliminados: registro.requerimientosEliminados,
  }
}

function aRespuestaRevision(
  registro: ImportacionAlmacenada,
  filas: readonly FilaRevisionAlmacenada[],
  eliminaciones: readonly RequerimientoAlmacenado[],
  avisos: string[],
): RevisionImportacion {
  return {
    ...aRespuestaImportacion(registro),
    eliminaciones: eliminaciones.map((requerimiento) => ({
      requerimientoId: requerimiento.id,
      identificador: requerimiento.identificador,
      materiales: requerimiento.materiales,
    })),
    avisos,
    filas: filas.map((fila) => ({
      fila: fila.fila,
      identificador: fila.identificador,
      requerimientoId: fila.requerimientoId,
      materiales: fila.materiales,
      resultado: fila.resultado,
      errores: fila.errores,
      cambios: fila.cambios.map(aRespuestaCambio),
    })),
  }
}

function avisosDelArchivo(huella: string): string[] {
  const identica = importacionesRequerimientosMock.find(
    (importacion) => importacion.estado === 'confirmada' && importacion.huellaArchivo === huella,
  )

  return identica === undefined
    ? []
    : [`Este archivo es idéntico al de la importación #${identica.id}, ya confirmada.`]
}

function actualizarRequerimiento(
  requerimientoId: number,
  actualizacion: ActualizacionRequerimiento,
): void {
  const indice = requerimientosMock.findIndex(
    (requerimiento) => requerimiento.id === requerimientoId,
  )

  if (indice === -1) {
    throw new Error(`El requerimiento ${requerimientoId} no existe en los datos simulados`)
  }

  requerimientosMock[indice] = {
    ...requerimientosMock[indice],
    ...actualizacion,
  }
}

function aplicarRevision(
  importacion: ImportacionAlmacenada,
  pendiente: RevisionPendienteAlmacenada,
): void {
  const fecha = instanteActual()
  let siguienteRequerimiento = siguienteId(requerimientosMock)
  let siguienteEvento = siguienteId(eventosRequerimientosMock)

  const registrarEvento = (
    requerimientoId: number,
    fila: number | null,
    tipo: TipoEventoRequerimiento,
    cambios: CambioAlmacenado[],
  ) => {
    eventosRequerimientosMock.push({
      id: siguienteEvento,
      requerimientoId,
      importacionId: importacion.id,
      fila,
      tipo,
      fecha,
      autor: AUTOR_SIMULADO,
      cambios,
    })
    siguienteEvento += 1
  }

  for (const revision of pendiente.filas) {
    if (revision.valores === null || revision.resultado === 'sin_cambios') {
      continue
    }

    if (revision.requerimientoId === null) {
      const requerimientoId = siguienteRequerimiento
      siguienteRequerimiento += 1
      requerimientosMock.push({
        id: requerimientoId,
        solicitanteId: importacion.solicitanteId,
        ...revision.valores,
        actualizadoEn: fecha,
        eliminado: false,
      })
      registrarEvento(requerimientoId, revision.fila, 'creacion', revision.cambios)
      continue
    }

    actualizarRequerimiento(revision.requerimientoId, {
      ...revision.valores,
      actualizadoEn: fecha,
      eliminado: false,
    })
    registrarEvento(
      revision.requerimientoId,
      revision.fila,
      revision.resultado === 'restaurada' ? 'restauracion' : 'actualizacion',
      revision.cambios,
    )
  }

  for (const requerimientoId of pendiente.eliminaciones) {
    actualizarRequerimiento(requerimientoId, { actualizadoEn: fecha, eliminado: true })
    registrarEvento(requerimientoId, null, 'eliminacion', [])
  }
}

function resolverImportacion(
  importacionId: number,
  estado: 'confirmada' | 'descartada',
): ImportacionAlmacenada {
  const indice = importacionesRequerimientosMock.findIndex(
    (importacion) => importacion.id === importacionId,
  )
  const resuelta: ImportacionAlmacenada = {
    ...importacionesRequerimientosMock[indice],
    estado,
  }

  importacionesRequerimientosMock[indice] = resuelta
  revisionesPendientesMock.delete(importacionId)

  return resuelta
}

export const requerimientosHandlers = [
  http.get(`${RUTA}/estados`, () => HttpResponse.json(estadosRequerimientoMock)),

  http.get(`${RUTA}/importaciones`, () =>
    HttpResponse.json(
      [...importacionesRequerimientosMock].sort(compararDelMasReciente).map(aRespuestaImportacion),
    ),
  ),

  http.post(`${RUTA}/importaciones`, async ({ request }) => {
    const resultado = nuevaImportacionRequestSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    const solicitante = buscarUnidadSolicitante(datos.solicitanteId)

    if (solicitante === undefined) {
      return responderError(
        'El solicitante no existe',
        422,
        'solicitante_inexistente',
        'solicitanteId',
      )
    }

    if (!solicitante.activo) {
      return responderError(
        'La carrera o unidad está inactiva',
        409,
        'solicitante_inactivo',
        'solicitanteId',
      )
    }

    const existentes = requerimientosMock.filter(
      (requerimiento) => requerimiento.solicitanteId === datos.solicitanteId,
    )
    const {
      filas,
      eliminaciones,
      avisos: avisosDeFilas,
    } = interpretarFilas(
      datos.filas,
      existentes,
      formatearSolicitante(buscarSolicitante(datos.solicitanteId)),
    )
    const contar = (buscado: ResultadoFila) =>
      filas.filter((fila) => fila.resultado === buscado).length
    const avisos = [...avisosDelArchivo(datos.archivo.huella), ...avisosDeFilas]

    const importacion: ImportacionAlmacenada = {
      id: siguienteId(importacionesRequerimientosMock),
      fecha: instanteActual(),
      autor: AUTOR_SIMULADO,
      solicitanteId: datos.solicitanteId,
      nombreArchivo: datos.archivo.nombre,
      tamanoArchivo: datos.archivo.tamano,
      huellaArchivo: datos.archivo.huella,
      estado: 'pendiente',
      filasNuevas: contar('nueva'),
      filasRestauradas: contar('restaurada'),
      filasConCambios: contar('con_cambios'),
      filasSinCambios: contar('sin_cambios'),
      filasConErrores: contar('error'),
      requerimientosEliminados: eliminaciones.length,
    }

    importacionesRequerimientosMock.push(importacion)
    revisionesPendientesMock.set(importacion.id, {
      versionSolicitante: versionSolicitante(datos.solicitanteId),
      filas,
      eliminaciones: eliminaciones.map((requerimiento) => requerimiento.id),
    })

    return HttpResponse.json(aRespuestaRevision(importacion, filas, eliminaciones, avisos), {
      status: 201,
    })
  }),

  http.post(`${RUTA}/importaciones/:importacionId/confirmar`, ({ params }) => {
    const importacionId = Number(params.importacionId)
    const importacion = importacionesRequerimientosMock.find(
      (candidata) => candidata.id === importacionId,
    )

    if (importacion === undefined) {
      return responderError('La importación no existe', 404)
    }

    const pendiente = revisionesPendientesMock.get(importacionId)

    if (importacion.estado !== 'pendiente' || pendiente === undefined) {
      return responderError(
        'La importación ya fue confirmada o descartada',
        409,
        'importacion_resuelta',
      )
    }

    if (importacion.filasConErrores > 0) {
      return responderError(
        'La importación tiene filas con errores y no se puede confirmar',
        409,
        'importacion_con_errores',
      )
    }

    if (pendiente.versionSolicitante !== versionSolicitante(importacion.solicitanteId)) {
      return responderError(
        'Los requerimientos cambiaron después de esta revisión. Cargue nuevamente la planilla.',
        409,
        'revision_desactualizada',
      )
    }

    aplicarRevision(importacion, pendiente)

    return HttpResponse.json(
      aRespuestaImportacion(resolverImportacion(importacionId, 'confirmada')),
    )
  }),

  http.post(`${RUTA}/importaciones/:importacionId/descartar`, ({ params }) => {
    const importacionId = Number(params.importacionId)
    const importacion = importacionesRequerimientosMock.find(
      (candidata) => candidata.id === importacionId,
    )

    if (importacion === undefined) {
      return responderError('La importación no existe', 404)
    }

    if (importacion.estado !== 'pendiente') {
      return responderError(
        'La importación ya fue confirmada o descartada',
        409,
        'importacion_resuelta',
      )
    }

    return HttpResponse.json(
      aRespuestaImportacion(resolverImportacion(importacionId, 'descartada')),
    )
  }),

  http.get(RUTA, () => HttpResponse.json(requerimientosMock.map(aRespuestaRequerimiento))),

  http.get(`${RUTA}/:requerimientoId/eventos`, ({ params }) => {
    const requerimientoId = Number(params.requerimientoId)
    const existe = requerimientosMock.some((registro) => registro.id === requerimientoId)

    if (!existe) {
      return responderError('El requerimiento no existe', 404)
    }

    const eventos = eventosRequerimientosMock
      .filter((evento) => evento.requerimientoId === requerimientoId)
      .sort(compararDelMasReciente)
      .map(aRespuestaEvento)

    return HttpResponse.json(eventos)
  }),
]
