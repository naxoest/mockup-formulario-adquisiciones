import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { API_BASE_URL } from '@/config/env'
import { eliminarFoto, guardarFoto, obtenerFoto } from '@/mocks/handlers/imagenes.estado'
import { leerCuerpo, responderError } from '@/mocks/handlers/respuestas'
import { obtenerSesionSimulada } from '@/mocks/handlers/sesion.estado'
import { buscarUsuario, reemplazarUsuario } from '@/mocks/handlers/usuarios.estado'
import { leerRun, rutaInexistente } from '@/mocks/handlers/usuarios.handlers'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const RUTA_PERFIL = `${API_BASE_URL}/api/perfil`
const RUTA_USUARIOS = `${API_BASE_URL}/api/usuarios`

const TAMANO_MAXIMO = 2 * 1024 * 1024

const TIPOS_ADMITIDOS = ['image/jpeg', 'image/png', 'image/webp'] as const

type TipoAdmitido = (typeof TIPOS_ADMITIDOS)[number]

const FORMATO_CLAVE_PORTADA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const LARGO_MAXIMO_CLAVE_PORTADA = 50

const cuerpoPortadaSchema = z.object({
  portada: z.string(),
})

function coincide(bytes: Uint8Array, desde: number, esperados: readonly number[]): boolean {
  return esperados.every((valor, indice) => bytes[desde + indice] === valor)
}

const FIRMAS: Record<TipoAdmitido, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': (bytes) => coincide(bytes, 0, [0xff, 0xd8, 0xff]),
  'image/png': (bytes) => coincide(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/webp': (bytes) =>
    coincide(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && coincide(bytes, 8, [0x57, 0x45, 0x42, 0x50]),
}

function esTipoAdmitido(tipo: string): tipo is TipoAdmitido {
  return (TIPOS_ADMITIDOS as readonly string[]).includes(tipo)
}

function esClaveDePortadaValida(clave: string): boolean {
  return clave.length <= LARGO_MAXIMO_CLAVE_PORTADA && FORMATO_CLAVE_PORTADA.test(clave)
}

function leerTipoDeContenido(request: Request): string {
  const encabezado = request.headers.get('Content-Type') ?? ''
  return encabezado.split(';')[0].trim().toLowerCase()
}

function usuarioDeLaSesion(): Usuario | undefined {
  const sesion = obtenerSesionSimulada()
  return sesion === null ? undefined : buscarUsuario(sesion.run)
}

function esAdministrador(usuario: Usuario): boolean {
  return usuario.roles.some((rol) => rol.nombre === 'administrador')
}

function urlDeFoto(run: number, version: string): string {
  return `${RUTA_USUARIOS}/${run}/foto?v=${version}`
}

function autenticacionRequerida() {
  return responderError('Autenticación requerida', 401)
}

function sinPermisos() {
  return responderError('No tienes permisos para realizar esta acción', 403)
}

export const imagenesHandlers = [
  http.put(`${RUTA_PERFIL}/foto`, async ({ request }) => {
    const usuario = usuarioDeLaSesion()
    if (!usuario) return autenticacionRequerida()

    const tipo = leerTipoDeContenido(request)

    if (!esTipoAdmitido(tipo)) {
      return responderError('El formato de la imagen no es compatible', 415)
    }

    const datos = await request.arrayBuffer()

    if (datos.byteLength === 0) {
      return responderError('No se recibió ninguna imagen', 400)
    }

    if (datos.byteLength > TAMANO_MAXIMO) {
      return responderError('La imagen supera el tamaño permitido', 413)
    }

    if (!FIRMAS[tipo](new Uint8Array(datos))) {
      return responderError('El archivo no es una imagen válida', 422)
    }

    const { version } = guardarFoto(usuario.run, datos, tipo)
    const fotoUrl = urlDeFoto(usuario.run, version)

    reemplazarUsuario({ ...usuario, fotoUrl })

    return HttpResponse.json({ fotoUrl })
  }),

  http.delete(`${RUTA_PERFIL}/foto`, () => {
    const usuario = usuarioDeLaSesion()
    if (!usuario) return autenticacionRequerida()

    eliminarFoto(usuario.run)
    reemplazarUsuario({ ...usuario, fotoUrl: null })

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${RUTA_USUARIOS}/:run/foto`, ({ params, request }) => {
    const run = leerRun(params.run)
    if (run === null) return rutaInexistente()

    const usuario = usuarioDeLaSesion()
    if (!usuario) return autenticacionRequerida()

    if (usuario.run !== run && !esAdministrador(usuario)) {
      return sinPermisos()
    }

    const foto = obtenerFoto(run)
    const version = new URL(request.url).searchParams.get('v')

    if (!foto || foto.version !== version) {
      return responderError('Imagen no encontrada', 404)
    }

    return HttpResponse.arrayBuffer(foto.datos, {
      headers: {
        'Content-Type': foto.tipoContenido,
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }),

  http.delete(`${RUTA_USUARIOS}/:run/foto`, ({ params }) => {
    const run = leerRun(params.run)
    if (run === null) return rutaInexistente()

    const solicitante = usuarioDeLaSesion()
    if (!solicitante) return autenticacionRequerida()

    if (!esAdministrador(solicitante)) {
      return sinPermisos()
    }

    const usuario = buscarUsuario(run)
    if (!usuario) return responderError('Usuario no encontrado', 404)

    eliminarFoto(run)
    reemplazarUsuario({ ...usuario, fotoUrl: null })

    return new HttpResponse(null, { status: 204 })
  }),

  http.put(`${RUTA_PERFIL}/portada`, async ({ request }) => {
    const usuario = usuarioDeLaSesion()
    if (!usuario) return autenticacionRequerida()

    const cuerpo = cuerpoPortadaSchema.safeParse(await leerCuerpo(request))

    if (!cuerpo.success || !esClaveDePortadaValida(cuerpo.data.portada)) {
      return responderError('La clave de la portada no es válida', 422, undefined, 'portada')
    }

    reemplazarUsuario({ ...usuario, portada: cuerpo.data.portada })

    return HttpResponse.json({ portada: cuerpo.data.portada })
  }),

  http.delete(`${RUTA_PERFIL}/portada`, () => {
    const usuario = usuarioDeLaSesion()
    if (!usuario) return autenticacionRequerida()

    reemplazarUsuario({ ...usuario, portada: null })

    return new HttpResponse(null, { status: 204 })
  }),
]
