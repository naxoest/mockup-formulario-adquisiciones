import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import {
  unidadSolicitanteEdicionSchema,
  unidadSolicitanteRequestSchema,
} from '@/features/mantenedor/schemas/unidadSolicitante.schema'
import {
  proyectoEdicionSchema,
  proyectoRequestSchema,
} from '@/features/mantenedor/schemas/proyecto.schema'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'
import { nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { tipoSolicitanteOptions } from '@/mocks/data/listas.mock'
import { requerimientosMock } from '@/mocks/data/requerimientos.mock'
import { campusMock } from '@/mocks/data/unidadesSolicitantes.mock'
import { autorizarAdministrador, exigirAdministrador } from '@/mocks/handlers/autorizacion'
import { existeEnCatalogo } from '@/mocks/handlers/catalogos'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { obtenerTransacciones } from '@/mocks/handlers/transacciones.estado'
import {
  agregarUnidadSolicitante,
  buscarUnidadSolicitante,
  obtenerUnidadesSolicitantes,
  reemplazarUnidadSolicitante,
  siguienteIdUnidadSolicitante,
  type UnidadSolicitanteAlmacenada,
} from '@/mocks/handlers/unidadesSolicitantes.estado'
import {
  agregarProyecto,
  buscarProyecto,
  obtenerProyectos,
  reemplazarProyecto,
  siguienteIdProyecto,
  type ProyectoAlmacenado,
} from '@/mocks/handlers/proyectos.estado'
import { formatFullName } from '@/utils/personName'
import type { SelectOption } from '@/types/select'

type ParametroDeRuta = string | readonly string[] | undefined

interface DatosUnidad {
  cr?: number
  nombre?: string
  tipo?: string
  sedes?: string[]
}

const RUTA = `${API_BASE_URL}/api/mantenedor/unidades-solicitantes`
const RUTA_PROYECTOS = `${API_BASE_URL}/api/mantenedor/proyectos`
const PER_PAGE_DEFECTO = 10
const ORDEN_DEFECTO = 'nombre'

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
    .toLowerCase()
}

function buscarOpcion(opciones: SelectOption[], valor: string): SelectOption {
  return opciones.find((opcion) => opcion.value === valor) ?? { value: valor, label: valor }
}

function contarSolicitudes(unidadId: number): number {
  return obtenerTransacciones()
    .flatMap((transaccion) => transaccion.solicitudes)
    .filter((solicitud) => solicitud.unidadId === unidadId).length
}

function contarRequerimientos(unidadId: number): number {
  return requerimientosMock.filter(
    (requerimiento) => requerimiento.solicitanteId === unidadId && !requerimiento.eliminado,
  ).length
}

function representarUnidad(unidad: UnidadSolicitanteAlmacenada): UnidadSolicitante {
  return {
    id: unidad.id,
    cr: unidad.cr,
    nombre: unidad.nombre,
    tipo: buscarOpcion(tipoSolicitanteOptions, unidad.tipo),
    sedes: unidad.sedes.map((sede) => buscarOpcion(campusMock, sede)),
    activo: unidad.activo,
    solicitudes: contarSolicitudes(unidad.id),
    requerimientos: contarRequerimientos(unidad.id),
    registradoPor: unidad.registradoPor,
    fechaRegistro: unidad.fechaRegistro,
  }
}

function coincideBusqueda(unidad: UnidadSolicitante, termino: string): boolean {
  const texto = normalizarTexto(termino)

  if (texto.length === 0) {
    return true
  }

  return [
    unidad.nombre,
    unidad.tipo.label,
    String(unidad.cr),
    ...unidad.sedes.map((sede) => sede.label),
  ].some((valor) => normalizarTexto(valor).includes(texto))
}

function coincideFiltro(valores: string[], obtenidos: string[]): boolean {
  return valores.length === 0 || obtenidos.some((valor) => valores.includes(valor))
}

function valorEstado(unidad: UnidadSolicitante): string {
  return unidad.activo ? 'activa' : 'inactiva'
}

function comparar(a: UnidadSolicitante, b: UnidadSolicitante, campo: string): number {
  switch (campo) {
    case 'cr':
      return a.cr - b.cr
    case 'solicitudes':
      return a.solicitudes - b.solicitudes
    case 'requerimientos':
      return a.requerimientos - b.requerimientos
    case 'activo':
      return Number(a.activo) - Number(b.activo)
    default:
      return a.nombre.localeCompare(b.nombre, 'es')
  }
}

function ordenar(
  a: UnidadSolicitante,
  b: UnidadSolicitante,
  campo: string,
  descendente: boolean,
): number {
  const resultado = comparar(a, b, campo)

  return (descendente ? -resultado : resultado) || a.id - b.id
}

function unidadNoEncontrada() {
  return responderError('La carrera o unidad no existe', 404, 'unidad_inexistente')
}

function validarUnidad(datos: DatosUnidad, actual?: UnidadSolicitanteAlmacenada): Response | null {
  if (datos.tipo !== undefined && !existeEnCatalogo(datos.tipo, tipoSolicitanteOptions)) {
    return responderError(
      'El tipo de solicitante no existe',
      400,
      'tipo_solicitante_inexistente',
      'tipo',
    )
  }

  if (datos.sedes?.some((sede) => !existeEnCatalogo(sede, campusMock))) {
    return responderError('La sede no existe', 400, 'sede_inexistente', 'sedes')
  }

  const otras = obtenerUnidadesSolicitantes().filter((unidad) => unidad.id !== actual?.id)

  if (otras.some((unidad) => unidad.cr === datos.cr)) {
    return responderError('El CR ya está registrado', 409, 'cr_duplicado', 'cr')
  }

  const nombre = normalizarTexto(datos.nombre ?? actual?.nombre ?? '')
  const tipo = datos.tipo ?? actual?.tipo
  const sedes = datos.sedes ?? actual?.sedes ?? []

  const nombreOcupado = otras.some(
    (unidad) =>
      unidad.tipo === tipo &&
      normalizarTexto(unidad.nombre) === nombre &&
      unidad.sedes.some((sede) => sedes.includes(sede)),
  )

  if (nombreOcupado) {
    return responderError(
      'Ya existe un registro con este tipo y nombre en una de las sedes elegidas',
      409,
      'nombre_duplicado_en_sede',
      'nombre',
    )
  }

  return null
}

function cambiarEstado(valor: ParametroDeRuta, activo: boolean) {
  const rechazo = exigirAdministrador()
  if (rechazo !== null) return rechazo

  const actual = buscarUnidadSolicitante(Number(valor))

  if (!actual) {
    return unidadNoEncontrada()
  }

  const actualizada: UnidadSolicitanteAlmacenada = { ...actual, activo }

  reemplazarUnidadSolicitante(actualizada)

  return HttpResponse.json(representarUnidad(actualizada))
}

function proyectoNoEncontrado() {
  return responderError('El proyecto no existe', 404, 'proyecto_inexistente')
}

function contarSolicitudesProyecto(proyectoId: number): number {
  return obtenerTransacciones()
    .flatMap((transaccion) => transaccion.solicitudes)
    .filter((solicitud) => (solicitud as { proyectoId?: number | null }).proyectoId === proyectoId)
    .length
}

function representarProyecto(proyecto: ProyectoAlmacenado): Proyecto {
  return {
    id: proyecto.id,
    cr: proyecto.cr,
    nombre: proyecto.nombre,
    activo: proyecto.activo,
    solicitudes: contarSolicitudesProyecto(proyecto.id),
    registradoPor: proyecto.registradoPor,
    fechaRegistro: proyecto.fechaRegistro,
  }
}

function coincideBusquedaProyecto(proyecto: Proyecto, termino: string): boolean {
  const texto = normalizarTexto(termino)

  if (texto.length === 0) {
    return true
  }

  return [proyecto.nombre, String(proyecto.cr)].some((valor) =>
    normalizarTexto(valor).includes(texto),
  )
}

function valorEstadoProyecto(proyecto: Proyecto): string {
  return proyecto.activo ? 'activo' : 'inactivo'
}

function compararProyecto(a: Proyecto, b: Proyecto, campo: string): number {
  switch (campo) {
    case 'cr':
      return a.cr - b.cr
    case 'solicitudes':
      return a.solicitudes - b.solicitudes
    case 'activo':
      return Number(a.activo) - Number(b.activo)
    default:
      return a.nombre.localeCompare(b.nombre, 'es')
  }
}

function ordenarProyecto(a: Proyecto, b: Proyecto, campo: string, descendente: boolean): number {
  const resultado = compararProyecto(a, b, campo)

  return (descendente ? -resultado : resultado) || a.id - b.id
}

function validarProyecto(datos: { cr?: number }, actual?: ProyectoAlmacenado): Response | null {
  const otros = obtenerProyectos().filter((proyecto) => proyecto.id !== actual?.id)

  if (datos.cr !== undefined && otros.some((proyecto) => proyecto.cr === datos.cr)) {
    return responderError('El CR ya está registrado', 409, 'cr_duplicado', 'cr')
  }

  return null
}

function cambiarEstadoProyecto(valor: ParametroDeRuta, activo: boolean) {
  const rechazo = exigirAdministrador()
  if (rechazo !== null) return rechazo

  const actual = buscarProyecto(Number(valor))

  if (!actual) {
    return proyectoNoEncontrado()
  }

  const actualizada: ProyectoAlmacenado = { ...actual, activo }

  reemplazarProyecto(actualizada)

  return HttpResponse.json(representarProyecto(actualizada))
}

export const mantenedorHandlers = [
  http.get(RUTA, ({ request }) => {
    const rechazo = exigirAdministrador()
    if (rechazo !== null) return rechazo

    const parametros = new URL(request.url).searchParams
    const page = Number(parametros.get('page') ?? '1')
    const perPage = Number(parametros.get('perPage') ?? String(PER_PAGE_DEFECTO))
    const sort = parametros.get('sort') ?? ORDEN_DEFECTO
    const busqueda = parametros.get('q') ?? ''
    const tipo = parametros.getAll('tipo')
    const sede = parametros.getAll('sede')
    const estado = parametros.getAll('estado')

    const descendente = sort.startsWith('-')
    const campoOrden = descendente ? sort.slice(1) : sort

    const unidades = obtenerUnidadesSolicitantes().map(representarUnidad)
    const filtradas = unidades
      .filter((unidad) => coincideBusqueda(unidad, busqueda))
      .filter((unidad) => coincideFiltro(tipo, [unidad.tipo.value]))
      .filter((unidad) =>
        coincideFiltro(
          sede,
          unidad.sedes.map((item) => item.value),
        ),
      )
      .filter((unidad) => coincideFiltro(estado, [valorEstado(unidad)]))
      .sort((a, b) => ordenar(a, b, campoOrden, descendente))

    const total = filtradas.length
    const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0
    const inicio = (page - 1) * perPage

    return HttpResponse.json({
      data: filtradas.slice(inicio, inicio + perPage),
      meta: { page, perPage, total, totalPages },
      resumen: {
        registros: unidades.length,
        inactivos: unidades.filter((unidad) => !unidad.activo).length,
      },
    })
  }),

  http.post(RUTA, async ({ request }) => {
    const autorizacion = autorizarAdministrador()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const resultado = unidadSolicitanteRequestSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data
    const rechazo = validarUnidad(datos)

    if (rechazo !== null) {
      return rechazo
    }

    const creada: UnidadSolicitanteAlmacenada = {
      id: siguienteIdUnidadSolicitante(),
      cr: datos.cr,
      nombre: datos.nombre,
      tipo: datos.tipo,
      sedes: [...new Set(datos.sedes)],
      activo: true,
      registradoPor: formatFullName(nombreDeUsuario(autorizacion.usuario)),
      fechaRegistro: new Date().toISOString(),
    }

    agregarUnidadSolicitante(creada)

    return HttpResponse.json(representarUnidad(creada), {
      status: 201,
      headers: { Location: `${RUTA}/${creada.id}` },
    })
  }),

  http.patch(`${RUTA}/:id`, async ({ params, request }) => {
    const rechazoSesion = exigirAdministrador()
    if (rechazoSesion !== null) return rechazoSesion

    const id = Number(params.id)
    const actual = buscarUnidadSolicitante(id)

    if (!actual) {
      return unidadNoEncontrada()
    }

    const resultado = unidadSolicitanteEdicionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data
    const rechazo = validarUnidad(datos, actual)

    if (rechazo !== null) {
      return rechazo
    }

    const actualizada: UnidadSolicitanteAlmacenada = {
      ...actual,
      cr: datos.cr ?? actual.cr,
      nombre: datos.nombre ?? actual.nombre,
      tipo: datos.tipo ?? actual.tipo,
      sedes: datos.sedes ? [...new Set(datos.sedes)] : actual.sedes,
    }

    reemplazarUnidadSolicitante(actualizada)

    return HttpResponse.json(representarUnidad(actualizada))
  }),

  http.post(`${RUTA}/:id/activar`, ({ params }) => cambiarEstado(params.id, true)),

  http.post(`${RUTA}/:id/desactivar`, ({ params }) => cambiarEstado(params.id, false)),

  http.get(RUTA_PROYECTOS, ({ request }) => {
    const rechazo = exigirAdministrador()
    if (rechazo !== null) return rechazo

    const parametros = new URL(request.url).searchParams
    const page = Number(parametros.get('page') ?? '1')
    const perPage = Number(parametros.get('perPage') ?? String(PER_PAGE_DEFECTO))
    const sort = parametros.get('sort') ?? ORDEN_DEFECTO
    const busqueda = parametros.get('q') ?? ''
    const estado = parametros.getAll('estado')

    const descendente = sort.startsWith('-')
    const campoOrden = descendente ? sort.slice(1) : sort

    const proyectos = obtenerProyectos().map(representarProyecto)
    const filtrados = proyectos
      .filter((proyecto) => coincideBusquedaProyecto(proyecto, busqueda))
      .filter((proyecto) =>
        coincideFiltro(estado, [
          valorEstadoProyecto(proyecto),
          proyecto.activo ? 'activa' : 'inactiva',
        ]),
      )
      .sort((a, b) => ordenarProyecto(a, b, campoOrden, descendente))

    const total = filtrados.length
    const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0
    const inicio = (page - 1) * perPage

    return HttpResponse.json({
      data: filtrados.slice(inicio, inicio + perPage),
      meta: { page, perPage, total, totalPages },
      resumen: {
        registros: proyectos.length,
        inactivos: proyectos.filter((proyecto) => !proyecto.activo).length,
      },
    })
  }),

  http.post(RUTA_PROYECTOS, async ({ request }) => {
    const autorizacion = autorizarAdministrador()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const resultado = proyectoRequestSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data
    const rechazo = validarProyecto(datos)

    if (rechazo !== null) {
      return rechazo
    }

    const creado: ProyectoAlmacenado = {
      id: siguienteIdProyecto(),
      cr: datos.cr,
      nombre: datos.nombre,
      activo: true,
      registradoPor: formatFullName(nombreDeUsuario(autorizacion.usuario)),
      fechaRegistro: new Date().toISOString(),
    }

    agregarProyecto(creado)

    return HttpResponse.json(representarProyecto(creado), {
      status: 201,
      headers: { Location: `${RUTA_PROYECTOS}/${creado.id}` },
    })
  }),

  http.patch(`${RUTA_PROYECTOS}/:id`, async ({ params, request }) => {
    const rechazoSesion = exigirAdministrador()
    if (rechazoSesion !== null) return rechazoSesion

    const id = Number(params.id)
    const actual = buscarProyecto(id)

    if (!actual) {
      return proyectoNoEncontrado()
    }

    const resultado = proyectoEdicionSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data
    const rechazo = validarProyecto(datos, actual)

    if (rechazo !== null) {
      return rechazo
    }

    const actualizado: ProyectoAlmacenado = {
      ...actual,
      cr: datos.cr ?? actual.cr,
      nombre: datos.nombre ?? actual.nombre,
    }

    reemplazarProyecto(actualizado)

    return HttpResponse.json(representarProyecto(actualizado))
  }),

  http.post(`${RUTA_PROYECTOS}/:id/activar`, ({ params }) =>
    cambiarEstadoProyecto(params.id, true),
  ),

  http.post(`${RUTA_PROYECTOS}/:id/desactivar`, ({ params }) =>
    cambiarEstadoProyecto(params.id, false),
  ),
]
