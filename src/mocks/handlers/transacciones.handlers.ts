import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import {
  obtenerMonitoreo,
  obtenerTransacciones,
  registrarEvento,
  siguienteIdEvento,
  siguienteIdSolicitud,
  siguienteIdTransaccion,
} from '@/mocks/handlers/transacciones.estado'
import {
  estadoTransaccionOptions,
  financiamientoOptions,
  modalidadOptions,
  tipoSolicitudOptions,
} from '@/mocks/data/listas.mock'
import { derivarTransaccion, estadoDe } from '@/mocks/handlers/transacciones.derivacion'
import {
  esPasoProceso,
  etiquetaPaso,
  motivoBloqueoDe,
  pasosAplicablesDe,
  siguientesDe,
} from '@/mocks/handlers/transacciones.proceso'
import { EXPLICACION_HITO } from '@/mocks/handlers/historial.generacion'
import { toCivilDate } from '@/utils/date'
import { analistasDe, participacionDe, principalDe } from '@/mocks/handlers/analistas.derivacion'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import { esAnalistaElegible, reemplazarEquipo } from '@/mocks/handlers/analistas.asignacion'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { autorizarTransacciones, puedeVerTransaccion } from '@/mocks/handlers/autorizacion'
import { buscarUnidadSolicitante } from '@/mocks/handlers/unidadesSolicitantes.estado'
import {
  deshacerPasoSchema,
  registrarPasoSchema,
  transaccionBorradorSchema,
  transaccionEdicionSchema,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import { existeEnCatalogo } from '@/mocks/handlers/catalogos'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { anotar } from '@/mocks/handlers/bitacora'
import { validarPrecompromisos } from '@/mocks/handlers/precompromisos.validacion'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'
import type {
  Transaccion,
  TransaccionListado,
} from '@/features/transacciones/types/transaccion.types'
import type { ResumenCriticidad } from '@/features/transacciones/types/monitoreo.types'
import type { SelectOption } from '@/types/select'

const PER_PAGE_DEFECTO = 25
const VALOR_SIN_EVALUAR = 'sin_evaluar'
const VALOR_SIN_PRINCIPAL = 'sin_principal'

function etiquetar(valor: string, opciones: SelectOption[]): SelectOption {
  return opciones.find((opcion) => opcion.value === valor) ?? { value: valor, label: valor }
}

function criticidadDe(transaccionId: number): ResumenCriticidad | null {
  const registro = obtenerMonitoreo().find((item) => item.transaccionId === transaccionId)

  if (!registro || registro.factores === null) {
    return null
  }

  const { indice, nivel } = calcularEvaluacion(registro.factores)

  return { indice, nivel }
}

function aListado(transaccion: Transaccion, runEnSesion: number | null): TransaccionListado {
  const tipos = Array.from(
    new Set(transaccion.solicitudes.map((solicitud) => solicitud.tipoSolicitud)),
  )

  const carreras = transaccion.solicitudes.filter(
    (solicitud) => solicitud.unidad.tipo === 'carrera',
  ).length

  return {
    id: transaccion.id,
    nombre: transaccion.nombre,
    linkCarpetaAntecedentes: transaccion.linkCarpetaAntecedentes,
    fecha: transaccion.fecha,
    modalidad: etiquetar(transaccion.modalidad, modalidadOptions),
    estado:
      transaccion.estado === null ? null : etiquetar(transaccion.estado, estadoTransaccionOptions),
    tipos: tipos.map((tipo) => etiquetar(tipo, tipoSolicitudOptions)),
    montoCotizado: transaccion.montoCotizado,
    montoComprometido: transaccion.montoComprometido,
    montoFacturado: transaccion.montoFacturado,
    solicitudes: {
      total: transaccion.solicitudes.length,
      carreras,
      unidades: transaccion.solicitudes.length - carreras,
    },
    analistas: analistasDe(transaccion.id),
    miParticipacion: participacionDe(transaccion.id, runEnSesion),
    criticidad: criticidadDe(transaccion.id),
  }
}

function coincideBusqueda(transaccion: Transaccion, termino: string) {
  const texto = termino.trim().toLowerCase()

  if (texto.length === 0) {
    return true
  }

  return (
    String(transaccion.id).includes(texto) ||
    transaccion.nombre.toLowerCase().includes(texto) ||
    transaccion.ordenesDeCompra.some((orden) => orden.codigo.toLowerCase().includes(texto)) ||
    transaccion.solicitudes.some((solicitud) =>
      solicitud.unidad.nombre.toLowerCase().includes(texto),
    )
  )
}

function coincideFiltro(valores: string[], obtenidos: string[]) {
  return valores.length === 0 || obtenidos.some((valor) => valores.includes(valor))
}

function valoresPrincipal(transaccionId: number): string[] {
  const principal = principalDe(transaccionId)

  return [principal === null ? VALOR_SIN_PRINCIPAL : String(principal.run)]
}

function valoresCriticidad(transaccionId: number): string[] {
  const criticidad = criticidadDe(transaccionId)

  return [criticidad === null ? VALOR_SIN_EVALUAR : criticidad.nivel]
}

function comparar(a: Transaccion, b: Transaccion, campo: string): number {
  switch (campo) {
    case 'nombre':
      return a.nombre.localeCompare(b.nombre, 'es')
    case 'fecha':
      return a.fecha.localeCompare(b.fecha)
    case 'modalidad':
      return a.modalidad.localeCompare(b.modalidad)
    case 'estado':
      return (a.estado ?? '').localeCompare(b.estado ?? '')
    case 'montoCotizado':
      return a.montoCotizado - b.montoCotizado
    case 'montoComprometido':
      return a.montoComprometido - b.montoComprometido
    case 'montoFacturado':
      return a.montoFacturado - b.montoFacturado
    default:
      return a.id - b.id
  }
}

function compararNulosAlFinal(a: number | null, b: number | null, descendente: boolean): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return descendente ? b - a : a - b
}

function ordenar(a: Transaccion, b: Transaccion, campo: string, descendente: boolean): number {
  if (campo === 'criticidad') {
    return compararNulosAlFinal(
      criticidadDe(a.id)?.indice ?? null,
      criticidadDe(b.id)?.indice ?? null,
      descendente,
    )
  }

  const resultado = comparar(a, b, campo)

  return descendente ? -resultado : resultado
}

export const transaccionesHandlers = [
  http.get(`${API_BASE_URL}/api/transacciones`, ({ request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const usuario = autorizacion.usuario
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('perPage') ?? String(PER_PAGE_DEFECTO))
    const sort = url.searchParams.get('sort') ?? '-fecha'
    const busqueda = url.searchParams.get('q') ?? ''
    const campus = url.searchParams.getAll('campus')
    const modalidad = url.searchParams.getAll('modalidad')
    const tipo = url.searchParams.getAll('tipo')
    const criticidad = url.searchParams.getAll('criticidad')
    const principal = url.searchParams.getAll('principal')

    const descendente = sort.startsWith('-')
    const campoOrden = descendente ? sort.slice(1) : sort

    const filtradas = obtenerTransacciones()
      .filter((almacenada) => almacenada.confirmadaEn !== null)
      .filter((almacenada) => puedeVerTransaccion(usuario, almacenada.id))
      .map(derivarTransaccion)
      .filter((transaccion) => coincideBusqueda(transaccion, busqueda))
      .filter((transaccion) =>
        coincideFiltro(
          campus,
          transaccion.solicitudes.flatMap((solicitud) =>
            solicitud.unidad.sedes.map((sede) => sede.value),
          ),
        ),
      )
      .filter((transaccion) => coincideFiltro(modalidad, [transaccion.modalidad]))
      .filter((transaccion) =>
        coincideFiltro(
          tipo,
          transaccion.solicitudes.map((solicitud) => solicitud.tipoSolicitud),
        ),
      )
      .filter((transaccion) => coincideFiltro(criticidad, valoresCriticidad(transaccion.id)))
      .filter((transaccion) => coincideFiltro(principal, valoresPrincipal(transaccion.id)))
      .sort((a, b) => ordenar(a, b, campoOrden, descendente))

    const total = filtradas.length
    const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 0
    const inicio = (page - 1) * perPage

    return HttpResponse.json({
      data: filtradas
        .slice(inicio, inicio + perPage)
        .map((transaccion) => aListado(transaccion, usuario.run)),
      meta: { page, perPage, total, totalPages },
    })
  }),

  http.get(`${API_BASE_URL}/api/transacciones/:id`, ({ params }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const almacenada = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!almacenada || !puedeVerTransaccion(autorizacion.usuario, almacenada.id)) {
      return HttpResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(derivarTransaccion(almacenada))
  }),

  http.post(`${API_BASE_URL}/api/transacciones`, async ({ request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const creador = autorizacion.usuario
    const cuerpo = await leerCuerpo(request)
    const resultado = transaccionBorradorSchema.safeParse(cuerpo)

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (!existeEnCatalogo(datos.modalidad, modalidadOptions)) {
      return responderError('La modalidad no existe', 400, 'modalidad_inexistente', 'modalidad')
    }

    const tipoInvalido = datos.solicitudes.findIndex(
      (solicitud) => !existeEnCatalogo(solicitud.tipoSolicitud, tipoSolicitudOptions),
    )

    if (tipoInvalido !== -1) {
      return responderError(
        'El tipo de solicitud no existe',
        400,
        'tipo_solicitud_inexistente',
        `solicitudes.${tipoInvalido}.tipoSolicitud`,
      )
    }

    const unidadInvalida = datos.solicitudes.findIndex(
      (solicitud) => buscarUnidadSolicitante(solicitud.unidadId) === undefined,
    )

    if (unidadInvalida !== -1) {
      return responderError(
        'La unidad solicitante no existe',
        400,
        'unidad_inexistente',
        `solicitudes.${unidadInvalida}.unidadId`,
      )
    }

    const unidadInactiva = datos.solicitudes.findIndex(
      (solicitud) => buscarUnidadSolicitante(solicitud.unidadId)?.activo === false,
    )

    if (unidadInactiva !== -1) {
      return responderError(
        'La carrera o unidad está inactiva',
        409,
        'unidad_inactiva',
        `solicitudes.${unidadInactiva}.unidadId`,
      )
    }

    const financiamientoInvalido = datos.solicitudes.findIndex(
      (solicitud) =>
        solicitud.financiamiento !== null &&
        solicitud.financiamiento !== undefined &&
        !existeEnCatalogo(solicitud.financiamiento, financiamientoOptions),
    )

    if (financiamientoInvalido !== -1) {
      return responderError(
        'El financiamiento no existe',
        400,
        'financiamiento_inexistente',
        `solicitudes.${financiamientoInvalido}.financiamiento`,
      )
    }

    for (const [indice, solicitud] of datos.solicitudes.entries()) {
      const rechazo = validarPrecompromisos(
        solicitud.precompromisos ?? [],
        `solicitudes.${indice}.`,
      )

      if (rechazo !== null) {
        return rechazo
      }
    }

    const transaccion: TransaccionAlmacenada = {
      id: siguienteIdTransaccion(),
      nombre: datos.nombre,
      linkCarpetaAntecedentes: datos.linkCarpetaAntecedentes ?? null,
      fecha: datos.fecha,
      modalidad: datos.modalidad,
      creadaEn: new Date().toISOString(),
      confirmadaEn: null,
      pasos: [],
      solicitudes: datos.solicitudes.map((solicitud) => ({
        id: siguienteIdSolicitud(),
        unidadId: solicitud.unidadId,
        tipoSolicitud: solicitud.tipoSolicitud,
        codigoSaserviSabienes: solicitud.codigoSaserviSabienes ?? null,
        financiamiento: solicitud.financiamiento ?? null,
        estado: null,
        estadoEvaluacion: null,
        precompromisos: (solicitud.precompromisos ?? []).map((precompromiso) => ({
          anio: precompromiso.anio,
          monto: precompromiso.monto,
        })),
      })),
      ordenesDeCompra: [],
      facturas: [],
    }

    obtenerTransacciones().push(transaccion)

    anotar(transaccion.id, 'Transacción creada', datos.observacion)

    if (esAnalistaElegible(creador)) {
      reemplazarEquipo(
        transaccion.id,
        [{ transaccionId: transaccion.id, run: creador.run, participacion: 'principal' }],
        nombreDeAnalista(creador),
      )
    }

    return HttpResponse.json(derivarTransaccion(transaccion), {
      status: 201,
      headers: { Location: `${API_BASE_URL}/api/transacciones/${transaccion.id}` },
    })
  }),

  http.patch(`${API_BASE_URL}/api/transacciones/:id`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const almacenada = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!almacenada || !puedeVerTransaccion(autorizacion.usuario, almacenada.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const cuerpo = await leerCuerpo(request)
    const resultado = transaccionEdicionSchema.safeParse(cuerpo)

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (datos.modalidad !== undefined && !existeEnCatalogo(datos.modalidad, modalidadOptions)) {
      return responderError('La modalidad no existe', 400, 'modalidad_inexistente', 'modalidad')
    }

    if (datos.modalidad !== undefined && datos.modalidad !== almacenada.modalidad) {
      const aplicables = pasosAplicablesDe(datos.modalidad, almacenada.pasos)
      const incompatibles = almacenada.pasos.filter(
        (registrado) => !aplicables.includes(registrado.paso),
      )

      if (incompatibles.length > 0) {
        const pasos = incompatibles.map((registrado) => etiquetaPaso(registrado.paso)).join(', ')

        return responderError(
          `La modalidad seleccionada no admite pasos ya registrados del proceso de adquisición (${pasos}). Deshaga esos pasos antes de cambiar la modalidad.`,
          409,
          'modalidad_incompatible_con_proceso',
          'modalidad',
        )
      }
    }

    if (datos.fecha !== undefined) {
      almacenada.fecha = datos.fecha
    }

    if (datos.modalidad !== undefined) {
      almacenada.modalidad = datos.modalidad
    }

    if (datos.nombre !== undefined) {
      almacenada.nombre = datos.nombre
    }

    if (datos.linkCarpetaAntecedentes !== undefined) {
      almacenada.linkCarpetaAntecedentes = datos.linkCarpetaAntecedentes
    }

    anotar(almacenada.id, 'Datos de la transacción modificados', datos.observacion)

    return HttpResponse.json(derivarTransaccion(almacenada))
  }),

  http.post(`${API_BASE_URL}/api/transacciones/:id/confirmar`, ({ params }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const almacenada = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!almacenada || !puedeVerTransaccion(autorizacion.usuario, almacenada.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    if (almacenada.confirmadaEn !== null) {
      return responderError('La transacción ya fue confirmada', 409, 'transaccion_ya_confirmada')
    }

    const activas = almacenada.solicitudes.filter((solicitud) => solicitud.estado !== 'rechazada')

    if (activas.length === 0) {
      return responderError(
        'La transacción no tiene solicitudes activas',
        409,
        'sin_solicitudes_activas',
        'solicitudes',
      )
    }

    almacenada.confirmadaEn = new Date().toISOString()

    almacenada.solicitudes.forEach((solicitud) => {
      if (solicitud.estado === null) {
        solicitud.estado = 'enviada'
      }
    })

    anotar(almacenada.id, 'Transacción confirmada')

    return HttpResponse.json(derivarTransaccion(almacenada))
  }),

  http.post(`${API_BASE_URL}/api/transacciones/:id/deshacer-paso`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const almacenada = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!almacenada || !puedeVerTransaccion(autorizacion.usuario, almacenada.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const resultado = deshacerPasoSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (!esPasoProceso(datos.paso)) {
      return responderError('El paso no existe', 400, 'paso_inexistente', 'paso')
    }

    const ultimo = almacenada.pasos.at(-1)

    if (ultimo === undefined) {
      return responderError(
        'El proceso de adquisición no tiene pasos registrados',
        409,
        'proceso_no_iniciado',
      )
    }

    if (ultimo.paso !== datos.paso) {
      return responderError(
        'El paso indicado ya no es el último registrado',
        409,
        'paso_no_es_el_ultimo',
        'paso',
      )
    }

    const estadoPrevio = estadoDe(almacenada)
    const fecha = new Date().toISOString()

    almacenada.pasos.pop()

    registrarEvento(almacenada.id, {
      clase: 'paso',
      id: siguienteIdEvento(),
      fecha,
      accion: 'deshecho',
      paso: ultimo.paso,
      titulo: `Paso deshecho: ${etiquetaPaso(ultimo.paso)}`,
      fechaHecho: null,
      observacion: datos.observacion,
      autor: nombreDeAnalista(autorizacion.usuario),
    })

    const estado = estadoDe(almacenada)

    if (estado !== null && estado !== estadoPrevio) {
      registrarEvento(almacenada.id, {
        clase: 'hito',
        id: siguienteIdEvento(),
        fecha,
        estado: etiquetar(estado, estadoTransaccionOptions).label,
        explicacion: EXPLICACION_HITO[estado],
      })
    }

    return HttpResponse.json(derivarTransaccion(almacenada))
  }),

  http.post(`${API_BASE_URL}/api/transacciones/:id/registrar-paso`, async ({ params, request }) => {
    const autorizacion = autorizarTransacciones()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const almacenada = obtenerTransacciones().find((item) => item.id === Number(params.id))

    if (!almacenada || !puedeVerTransaccion(autorizacion.usuario, almacenada.id)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const resultado = registrarPasoSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const datos = resultado.data

    if (!esPasoProceso(datos.paso)) {
      return responderError('El paso no existe', 400, 'paso_inexistente', 'paso')
    }

    const motivo = motivoBloqueoDe(almacenada)

    if (motivo !== null) {
      return responderError(motivo.mensaje, 409, motivo.codigo)
    }

    if (!siguientesDe(almacenada.modalidad, almacenada.pasos).includes(datos.paso)) {
      return responderError(
        'El paso no corresponde en este momento del proceso',
        409,
        'transicion_ilegal',
        'paso',
      )
    }

    if (datos.paso === 'aprobada_con_observaciones' && datos.observacion === null) {
      return responderError(
        'La aprobación con observaciones requiere indicar las observaciones',
        400,
        'observacion_requerida',
        'observacion',
      )
    }

    if (datos.fecha > toCivilDate(new Date())) {
      return responderError(
        'La fecha del hecho no puede ser posterior a hoy',
        400,
        'fecha_futura',
        'fecha',
      )
    }

    const previo = almacenada.pasos.at(-1)

    if (previo !== undefined && datos.fecha < previo.fecha) {
      return responderError(
        'La fecha del hecho no puede ser anterior a la del paso previo',
        400,
        'fecha_anterior_al_paso_previo',
        'fecha',
      )
    }

    const estadoPrevio = estadoDe(almacenada)
    const registradoEn = new Date().toISOString()

    almacenada.pasos.push({
      paso: datos.paso,
      fecha: datos.fecha,
      observacion: datos.observacion,
      registradoEn,
      registradoPor: autorizacion.usuario.run,
    })

    registrarEvento(almacenada.id, {
      clase: 'paso',
      id: siguienteIdEvento(),
      fecha: registradoEn,
      accion: 'registrado',
      paso: datos.paso,
      titulo: `Paso registrado: ${etiquetaPaso(datos.paso)}`,
      fechaHecho: datos.fecha,
      observacion: datos.observacion,
      autor: nombreDeAnalista(autorizacion.usuario),
    })

    const estado = estadoDe(almacenada)

    if (estado !== null && estado !== estadoPrevio) {
      registrarEvento(almacenada.id, {
        clase: 'hito',
        id: siguienteIdEvento(),
        fecha: registradoEn,
        estado: etiquetar(estado, estadoTransaccionOptions).label,
        explicacion: EXPLICACION_HITO[estado],
      })
    }

    return HttpResponse.json(derivarTransaccion(almacenada))
  }),
]
