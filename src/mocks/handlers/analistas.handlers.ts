import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { asignacionAnalistasSchema } from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { AnalistaReferencia } from '@/features/transacciones/types/transaccion.types'
import type { AsignacionAlmacenada } from '@/mocks/data/asignaciones.mock'
import {
  asignacionDe,
  esAnalistaElegible,
  reemplazarEquipo,
} from '@/mocks/handlers/analistas.asignacion'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { autorizarAdministrador, exigirAdministrador } from '@/mocks/handlers/autorizacion'
import { leerCuerpo, responderCuerpoInvalido, responderError } from '@/mocks/handlers/respuestas'
import { obtenerTransacciones } from '@/mocks/handlers/transacciones.estado'
import { buscarUsuario, obtenerUsuarios } from '@/mocks/handlers/usuarios.estado'

function runElegible(run: number): boolean {
  const usuario = buscarUsuario(run)
  return usuario !== undefined && esAnalistaElegible(usuario)
}

function analistasElegibles(): AnalistaReferencia[] {
  return obtenerUsuarios()
    .filter(esAnalistaElegible)
    .map((usuario) => ({ run: usuario.run, nombre: nombreDeAnalista(usuario) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-CL'))
}

function existeTransaccion(transaccionId: number): boolean {
  return obtenerTransacciones().some((transaccion) => transaccion.id === transaccionId)
}

export const analistasHandlers = [
  http.get(
    `${API_BASE_URL}/api/analistas`,
    () => exigirAdministrador() ?? HttpResponse.json(analistasElegibles()),
  ),

  http.get(`${API_BASE_URL}/api/transacciones/:id/analistas`, ({ params }) => {
    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    const transaccionId = Number(params.id)

    if (!existeTransaccion(transaccionId)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    return HttpResponse.json(asignacionDe(transaccionId))
  }),

  http.put(`${API_BASE_URL}/api/transacciones/:id/analistas`, async ({ params, request }) => {
    const autorizacion = autorizarAdministrador()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const transaccionId = Number(params.id)

    if (!existeTransaccion(transaccionId)) {
      return responderError('Transacción no encontrada', 404, 'transaccion_inexistente')
    }

    const resultado = asignacionAnalistasSchema.safeParse(await leerCuerpo(request))

    if (!resultado.success) {
      return responderCuerpoInvalido(resultado.error)
    }

    const { principal, apoyo, observacion } = resultado.data

    const repetido =
      new Set(apoyo).size !== apoyo.length || (principal !== null && apoyo.includes(principal))

    if (repetido) {
      return responderError(
        'Un analista no puede figurar más de una vez en la transacción',
        400,
        'analista_duplicado',
        'apoyo',
      )
    }

    if (principal !== null && !runElegible(principal)) {
      return responderError(
        'El analista no está activo o no tiene el rol analista',
        400,
        'analista_no_elegible',
        'principal',
      )
    }

    const apoyoInvalido = apoyo.findIndex((run) => !runElegible(run))

    if (apoyoInvalido !== -1) {
      return responderError(
        'El analista no está activo o no tiene el rol analista',
        400,
        'analista_no_elegible',
        `apoyo.${apoyoInvalido}`,
      )
    }

    const nuevas: AsignacionAlmacenada[] = [
      ...(principal === null
        ? []
        : [{ transaccionId, run: principal, participacion: 'principal' as const }]),
      ...apoyo.map((run) => ({ transaccionId, run, participacion: 'apoyo' as const })),
    ]

    return HttpResponse.json(
      reemplazarEquipo(transaccionId, nuevas, nombreDeAnalista(autorizacion.usuario), observacion),
    )
  }),
]
