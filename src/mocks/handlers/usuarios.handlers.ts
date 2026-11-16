import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { MOTIVO_DESACTIVACION, MOTIVO_PERDIDA_DE_ROL } from '@/mocks/data/asignaciones.mock'
import { rolesMock } from '@/mocks/data/roles.mock'
import { contarAsignacionesDe, terminarAsignacionesDe } from '@/mocks/handlers/analistas.asignacion'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { autorizarAdministrador, exigirAdministrador } from '@/mocks/handlers/autorizacion'
import { responderError } from '@/mocks/handlers/respuestas'
import {
  agregarUsuario,
  buscarUsuario,
  obtenerUsuarios,
  reemplazarUsuario,
} from '@/mocks/handlers/usuarios.estado'
import { toCivilDate } from '@/utils/date'
import type { Rol, Usuario, UsuarioCreacionRequest } from '@/features/usuarios/types/usuario.types'

type ParametroDeRuta = string | readonly string[] | undefined

type CampoCorreo = 'emailInstitucional' | 'emailEstudiantil'

type CuerpoEdicion = Partial<
  Omit<UsuarioCreacionRequest, 'run' | 'digitoVerificador' | 'roles'>
> & {
  roles?: number[] | null
}

const RUTA = `${API_BASE_URL}/api/usuarios`

const PAGINA_POR_DEFECTO = 1
const POR_PAGINA_POR_DEFECTO = 20
const POR_PAGINA_MAXIMO = 100
const ENTERO_SIN_SIGNO = /^\d+$/
const ROL_ANALISTA = 'analista'

const PAGINACION_INVALIDA = 'Los parámetros de paginación no son válidos'
const RUTA_INEXISTENTE =
  'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.'

function marcaDeTiempoLocal(fecha: Date): string {
  const horas = String(fecha.getHours()).padStart(2, '0')
  const minutos = String(fecha.getMinutes()).padStart(2, '0')
  const segundos = String(fecha.getSeconds()).padStart(2, '0')
  return `${toCivilDate(fecha)}T${horas}:${minutos}:${segundos}`
}

function leerEnteroDeConsulta(valor: string | null, porDefecto: number): number | null {
  if (valor === null || valor === '') return porDefecto
  return ENTERO_SIN_SIGNO.test(valor) ? Number(valor) : null
}

export function leerRun(valor: ParametroDeRuta): number | null {
  return typeof valor === 'string' && ENTERO_SIN_SIGNO.test(valor) ? Number(valor) : null
}

export function rutaInexistente() {
  return responderError(RUTA_INEXISTENTE, 404)
}

function usuarioNoEncontrado() {
  return responderError('Usuario no encontrado', 404)
}

function correoRegistrado() {
  return responderError('El correo ya está registrado', 409)
}

function tieneRolAnalista(roles: Rol[]): boolean {
  return roles.some((rol) => rol.nombre === ROL_ANALISTA)
}

function resolverRoles(ids: number[]): Rol[] | null {
  if (new Set(ids).size !== ids.length) return null

  const resueltos: Rol[] = []

  for (const id of ids) {
    const rol = rolesMock.find((item) => item.id === id)
    if (!rol) return null
    resueltos.push({ id: rol.id, nombre: rol.nombre })
  }

  return resueltos
}

function correoOcupado(campo: CampoCorreo, valor: string | null, runExcluido?: number): boolean {
  if (valor === null) return false
  return obtenerUsuarios().some(
    (usuario) => usuario.run !== runExcluido && usuario[campo] === valor,
  )
}

function correosOcupados(correos: Pick<Usuario, CampoCorreo>, runExcluido?: number): boolean {
  return (
    correoOcupado('emailInstitucional', correos.emailInstitucional, runExcluido) ||
    correoOcupado('emailEstudiantil', correos.emailEstudiantil, runExcluido)
  )
}

function cambiarEstado(valor: ParametroDeRuta, estaActivo: boolean) {
  const run = leerRun(valor)
  if (run === null) return rutaInexistente()

  const autorizacion = autorizarAdministrador()
  if (autorizacion.rechazo !== null) return autorizacion.rechazo

  const actual = buscarUsuario(run)
  if (!actual) return usuarioNoEncontrado()

  const actualizado: Usuario = {
    ...actual,
    estaActivo,
    actualizadoEn: marcaDeTiempoLocal(new Date()),
  }

  reemplazarUsuario(actualizado)

  if (!estaActivo) {
    terminarAsignacionesDe(run, nombreDeAnalista(autorizacion.usuario), MOTIVO_DESACTIVACION)
  }

  return HttpResponse.json(actualizado)
}

export const usuariosHandlers = [
  http.get(`${RUTA}/roles`, () => exigirAdministrador() ?? HttpResponse.json(rolesMock)),

  http.get(RUTA, ({ request }) => {
    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    const parametros = new URL(request.url).searchParams
    const pagina = leerEnteroDeConsulta(parametros.get('pagina'), PAGINA_POR_DEFECTO)

    if (pagina === null || pagina < 1) {
      return responderError(PAGINACION_INVALIDA, 422, undefined, 'pagina')
    }

    const porPagina = leerEnteroDeConsulta(parametros.get('por_pagina'), POR_PAGINA_POR_DEFECTO)

    if (porPagina === null || porPagina < 1 || porPagina > POR_PAGINA_MAXIMO) {
      return responderError(PAGINACION_INVALIDA, 422, undefined, 'por_pagina')
    }

    const ordenados = [...obtenerUsuarios()].sort((a, b) => a.run - b.run)
    const inicio = (pagina - 1) * porPagina

    return HttpResponse.json({
      datos: ordenados.slice(inicio, inicio + porPagina),
      paginacion: { pagina, por_pagina: porPagina, total: ordenados.length },
    })
  }),

  http.get(`${RUTA}/:run`, ({ params }) => {
    const run = leerRun(params.run)
    if (run === null) return rutaInexistente()

    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    const usuario = buscarUsuario(run)
    return usuario ? HttpResponse.json(usuario) : usuarioNoEncontrado()
  }),

  http.get(`${RUTA}/:run/asignaciones`, ({ params }) => {
    const run = leerRun(params.run)
    if (run === null) return rutaInexistente()

    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    return buscarUsuario(run) ? HttpResponse.json(contarAsignacionesDe(run)) : usuarioNoEncontrado()
  }),

  http.post(RUTA, async ({ request }) => {
    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    const cuerpo = (await request.json()) as UsuarioCreacionRequest

    if (buscarUsuario(cuerpo.run)) {
      return responderError('El run ya está registrado', 409)
    }

    if (correosOcupados(cuerpo)) {
      return correoRegistrado()
    }

    const roles = resolverRoles(cuerpo.roles)

    if (roles === null) {
      return correoRegistrado()
    }

    const ahora = marcaDeTiempoLocal(new Date())

    const creado: Usuario = {
      run: cuerpo.run,
      digitoVerificador: cuerpo.digitoVerificador,
      emailInstitucional: cuerpo.emailInstitucional,
      emailEstudiantil: cuerpo.emailEstudiantil,
      nombres: cuerpo.nombres,
      apellidoPaterno: cuerpo.apellidoPaterno,
      apellidoMaterno: cuerpo.apellidoMaterno,
      esEstudiante: cuerpo.esEstudiante,
      estaActivo: true,
      fotoUrl: null,
      portada: null,
      creadoEn: ahora,
      actualizadoEn: ahora,
      roles,
    }

    agregarUsuario(creado)

    return HttpResponse.json(creado, { status: 201 })
  }),

  http.patch(`${RUTA}/:run`, async ({ params, request }) => {
    const run = leerRun(params.run)
    if (run === null) return rutaInexistente()

    const autorizacion = autorizarAdministrador()
    if (autorizacion.rechazo !== null) return autorizacion.rechazo

    const cuerpo = (await request.json()) as CuerpoEdicion
    const actual = buscarUsuario(run)

    if (!actual) {
      return Array.isArray(cuerpo.roles) && cuerpo.roles.length > 0
        ? correoRegistrado()
        : usuarioNoEncontrado()
    }

    let roles = actual.roles

    if (Array.isArray(cuerpo.roles)) {
      const resueltos = resolverRoles(cuerpo.roles)
      if (resueltos === null) return correoRegistrado()
      roles = resueltos
      reemplazarUsuario({ ...actual, roles })

      if (!tieneRolAnalista(roles)) {
        terminarAsignacionesDe(run, nombreDeAnalista(autorizacion.usuario), MOTIVO_PERDIDA_DE_ROL)
      }
    }

    const actualizado: Usuario = {
      ...actual,
      emailInstitucional:
        cuerpo.emailInstitucional === undefined
          ? actual.emailInstitucional
          : cuerpo.emailInstitucional,
      emailEstudiantil:
        cuerpo.emailEstudiantil === undefined ? actual.emailEstudiantil : cuerpo.emailEstudiantil,
      nombres: cuerpo.nombres ?? actual.nombres,
      apellidoPaterno: cuerpo.apellidoPaterno ?? actual.apellidoPaterno,
      apellidoMaterno: cuerpo.apellidoMaterno ?? actual.apellidoMaterno,
      esEstudiante: cuerpo.esEstudiante ?? actual.esEstudiante,
      roles,
      actualizadoEn: marcaDeTiempoLocal(new Date()),
    }

    if (correosOcupados(actualizado, run)) {
      return correoRegistrado()
    }

    reemplazarUsuario(actualizado)

    return HttpResponse.json(actualizado)
  }),

  http.post(`${RUTA}/:run/activar`, ({ params }) => cambiarEstado(params.run, true)),

  http.post(`${RUTA}/:run/desactivar`, ({ params }) => cambiarEstado(params.run, false)),
]
