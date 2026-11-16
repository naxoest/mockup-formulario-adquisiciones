import { beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import {
  conCuerpo,
  pedirError,
  pedirFotoPerfil,
  pedirPortadaPerfil,
  pedirSesion,
  pedirSinCuerpo,
  pedirUsuario,
} from '@/mocks/pruebas'
import { cerrarSesionSimulada, iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'

const RUTA_FOTO = '/api/perfil/foto'
const RUTA_PORTADA = '/api/perfil/portada'
const CLAVE_INVALIDA = 'La clave de la portada no es válida'
const SIN_PERMISOS = 'No tienes permisos para realizar esta acción'

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
])
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])

function patronDeFoto(run: number): RegExp {
  const prefijo = `${API_BASE_URL}/api/usuarios/${run}/foto?v=`.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
  return new RegExp(`^${prefijo}.+$`)
}

function conImagen(datos: BufferSource, tipo: string): RequestInit {
  return { method: 'PUT', headers: { 'Content-Type': tipo }, body: datos }
}

async function subirFoto(datos: BufferSource = JPEG, tipo = 'image/jpeg'): Promise<string> {
  const { cuerpo } = await pedirFotoPerfil(RUTA_FOTO, conImagen(datos, tipo))
  return cuerpo.fotoUrl
}

beforeEach(() => {
  iniciarSesionSimuladaPorRun(12345678)
})

describe('PUT /perfil/foto', () => {
  it('guarda la foto y la refleja en la sesion y en el usuario', async () => {
    const { respuesta, cuerpo } = await pedirFotoPerfil(RUTA_FOTO, conImagen(JPEG, 'image/jpeg'))

    expect(respuesta.status).toBe(200)
    expect(cuerpo.fotoUrl).toMatch(patronDeFoto(12345678))

    const { cuerpo: sesion } = await pedirSesion('/auth/me')
    const { cuerpo: usuario } = await pedirUsuario('/api/usuarios/12345678')

    expect(sesion.usuario.foto_url).toBe(cuerpo.fotoUrl)
    expect(usuario.fotoUrl).toBe(cuerpo.fotoUrl)
  })

  it('acepta png y webp', async () => {
    expect(await subirFoto(PNG, 'image/png')).toMatch(patronDeFoto(12345678))
    expect(await subirFoto(WEBP, 'image/webp')).toMatch(patronDeFoto(12345678))
  })

  it('cambia la URL al reemplazar la foto y deja de servir la anterior', async () => {
    const anterior = await subirFoto()
    const nueva = await subirFoto()

    expect(nueva).not.toBe(anterior)
    expect((await fetch(anterior)).status).toBe(404)
    expect((await fetch(nueva)).status).toBe(200)
  })

  it('rechaza un formato no admitido con 415', async () => {
    const { respuesta, cuerpo } = await pedirError(RUTA_FOTO, conImagen(GIF, 'image/gif'))

    expect(respuesta.status).toBe(415)
    expect(cuerpo).toEqual({ error: 'El formato de la imagen no es compatible' })
  })

  it('rechaza un contenido que no corresponde al tipo declarado con 422', async () => {
    const { respuesta, cuerpo } = await pedirError(RUTA_FOTO, conImagen(PNG, 'image/jpeg'))

    expect(respuesta.status).toBe(422)
    expect(cuerpo).toEqual({ error: 'El archivo no es una imagen válida' })
  })

  it('rechaza un cuerpo vacio con 400', async () => {
    const { respuesta, cuerpo } = await pedirError(
      RUTA_FOTO,
      conImagen(new Uint8Array(0), 'image/jpeg'),
    )

    expect(respuesta.status).toBe(400)
    expect(cuerpo).toEqual({ error: 'No se recibió ninguna imagen' })
  })

  it('rechaza una imagen de mas de 2 MB con 413', async () => {
    const grande = new Uint8Array(2 * 1024 * 1024 + 1)
    grande.set(JPEG)

    const { respuesta, cuerpo } = await pedirError(RUTA_FOTO, conImagen(grande, 'image/jpeg'))

    expect(respuesta.status).toBe(413)
    expect(cuerpo).toEqual({ error: 'La imagen supera el tamaño permitido' })
  })

  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta, cuerpo } = await pedirError(RUTA_FOTO, conImagen(JPEG, 'image/jpeg'))

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'Autenticación requerida' })
  })
})

describe('DELETE /perfil/foto', () => {
  it('quita la foto de la sesion y deja de servir la URL anterior', async () => {
    const anterior = await subirFoto()

    const respuesta = await pedirSinCuerpo(RUTA_FOTO, { method: 'DELETE' })

    expect(respuesta.status).toBe(204)

    const { cuerpo: sesion } = await pedirSesion('/auth/me')

    expect(sesion.usuario.foto_url).toBeNull()
    expect((await fetch(anterior)).status).toBe(404)
  })

  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta } = await pedirError(RUTA_FOTO, { method: 'DELETE' })

    expect(respuesta.status).toBe(401)
  })
})

describe('GET /usuarios/:run/foto', () => {
  it('entrega los bytes con su tipo y cache inmutable', async () => {
    const url = await subirFoto()

    const respuesta = await fetch(url)

    expect(respuesta.status).toBe(200)
    expect(respuesta.headers.get('Content-Type')).toBe('image/jpeg')
    expect(respuesta.headers.get('Cache-Control')).toBe('private, max-age=31536000, immutable')
    expect(respuesta.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(Array.from(new Uint8Array(await respuesta.arrayBuffer()))).toEqual(Array.from(JPEG))
  })

  it('permite leer la foto a su dueño y al administrador, pero no a otros', async () => {
    iniciarSesionSimuladaPorRun(12345675)
    const url = await subirFoto()

    expect((await fetch(url)).status).toBe(200)

    iniciarSesionSimuladaPorRun(9876543)
    expect((await fetch(url)).status).toBe(403)

    iniciarSesionSimuladaPorRun(12345678)
    expect((await fetch(url)).status).toBe(200)
  })

  it('responde 404 cuando el usuario no tiene foto', async () => {
    expect((await pedirSinCuerpo('/api/usuarios/12345678/foto?v=inexistente')).status).toBe(404)
  })

  it('responde el 404 del enrutador para un run no numerico', async () => {
    expect((await pedirSinCuerpo('/api/usuarios/abc/foto')).status).toBe(404)
  })

  it('responde 401 sin sesion', async () => {
    const url = await subirFoto()
    cerrarSesionSimulada()

    expect((await fetch(url)).status).toBe(401)
  })
})

describe('DELETE /usuarios/:run/foto', () => {
  it('permite al administrador quitar la foto de otra persona', async () => {
    iniciarSesionSimuladaPorRun(12345675)
    const url = await subirFoto()

    iniciarSesionSimuladaPorRun(12345678)
    const respuesta = await pedirSinCuerpo('/api/usuarios/12345675/foto', { method: 'DELETE' })

    expect(respuesta.status).toBe(204)

    const { cuerpo: usuario } = await pedirUsuario('/api/usuarios/12345675')

    expect(usuario.fotoUrl).toBeNull()
    expect((await fetch(url)).status).toBe(404)
  })

  it('responde 403 a quien no es administrador', async () => {
    iniciarSesionSimuladaPorRun(9876543)

    const { respuesta, cuerpo } = await pedirError('/api/usuarios/12345678/foto', {
      method: 'DELETE',
    })

    expect(respuesta.status).toBe(403)
    expect(cuerpo).toEqual({ error: SIN_PERMISOS })
  })

  it('responde 404 para un usuario inexistente', async () => {
    const { respuesta, cuerpo } = await pedirError('/api/usuarios/1/foto', { method: 'DELETE' })

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: 'Usuario no encontrado' })
  })

  it('responde el 404 del enrutador para un run no numerico', async () => {
    const respuesta = await pedirSinCuerpo('/api/usuarios/abc/foto', { method: 'DELETE' })

    expect(respuesta.status).toBe(404)
  })

  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta } = await pedirError('/api/usuarios/12345678/foto', { method: 'DELETE' })

    expect(respuesta.status).toBe(401)
  })
})

describe('PUT /perfil/portada', () => {
  it('guarda la clave y la refleja en la sesion y en el usuario', async () => {
    const { respuesta, cuerpo } = await pedirPortadaPerfil(
      RUTA_PORTADA,
      conCuerpo('PUT', { portada: 'volcan-osorno' }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toEqual({ portada: 'volcan-osorno' })

    const { cuerpo: sesion } = await pedirSesion('/auth/me')
    const { cuerpo: usuario } = await pedirUsuario('/api/usuarios/12345678')

    expect(sesion.usuario.portada).toBe('volcan-osorno')
    expect(usuario.portada).toBe('volcan-osorno')
  })

  it('acepta una clave con formato valido aunque no este en el catalogo', async () => {
    const { respuesta } = await pedirPortadaPerfil(
      RUTA_PORTADA,
      conCuerpo('PUT', { portada: 'clave-desconocida' }),
    )

    expect(respuesta.status).toBe(200)
  })

  it.each(['Volcán Osorno', 'volcan_osorno', '-volcan', 'a'.repeat(51), ''])(
    'rechaza la clave "%s" con 422',
    async (portada) => {
      const { respuesta, cuerpo } = await pedirError(RUTA_PORTADA, conCuerpo('PUT', { portada }))

      expect(respuesta.status).toBe(422)
      expect(cuerpo).toEqual({ error: CLAVE_INVALIDA, field: 'portada' })
    },
  )

  it('rechaza un cuerpo sin portada con 422', async () => {
    const { respuesta, cuerpo } = await pedirError(RUTA_PORTADA, conCuerpo('PUT', {}))

    expect(respuesta.status).toBe(422)
    expect(cuerpo).toEqual({ error: CLAVE_INVALIDA, field: 'portada' })
  })

  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta } = await pedirError(RUTA_PORTADA, conCuerpo('PUT', { portada: 'santiago' }))

    expect(respuesta.status).toBe(401)
  })
})

describe('DELETE /perfil/portada', () => {
  it('deja la sesion sin portada', async () => {
    await pedirPortadaPerfil(RUTA_PORTADA, conCuerpo('PUT', { portada: 'santiago' }))

    const respuesta = await pedirSinCuerpo(RUTA_PORTADA, { method: 'DELETE' })

    expect(respuesta.status).toBe(204)

    const { cuerpo: sesion } = await pedirSesion('/auth/me')

    expect(sesion.usuario.portada).toBeNull()
  })

  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta } = await pedirError(RUTA_PORTADA, { method: 'DELETE' })

    expect(respuesta.status).toBe(401)
  })
})

describe('estado de las imagenes simuladas', () => {
  it('parte sin foto ni portada en cada prueba', async () => {
    const { cuerpo } = await pedirSesion('/auth/me')

    expect(cuerpo.usuario.foto_url).toBeNull()
    expect(cuerpo.usuario.portada).toBeNull()
  })
})
