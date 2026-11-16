import { beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { getMe } from '@/features/auth/api'
import {
  eliminarFotoPerfil,
  quitarFotoDeUsuario,
  subirFotoPerfil,
} from '@/features/usuarios/api/fotoPerfil'
import { ApiError } from '@/lib/apiClient'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).buffer

function patronDeFoto(run: number): RegExp {
  const prefijo = `${API_BASE_URL}/api/usuarios/${run}/foto?v=`.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
  return new RegExp(`^${prefijo}.+$`)
}

beforeEach(() => {
  iniciarSesionSimuladaPorRun(12345678)
})

describe('subirFotoPerfil', () => {
  it('sube la foto y entrega su URL versionada', async () => {
    const url = await subirFotoPerfil({ datos: JPEG, tipo: 'image/jpeg' })

    expect(url).toMatch(patronDeFoto(12345678))
  })

  it('propaga el rechazo de un formato no admitido', async () => {
    const error = await subirFotoPerfil({ datos: JPEG, tipo: 'image/gif' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error instanceof ApiError && error.status).toBe(415)
  })
})

describe('eliminarFotoPerfil', () => {
  it('quita la foto de la sesion', async () => {
    await subirFotoPerfil({ datos: JPEG, tipo: 'image/jpeg' })
    await eliminarFotoPerfil()

    const sesion = await getMe()

    expect(sesion.usuario.foto_url).toBeNull()
  })
})

describe('quitarFotoDeUsuario', () => {
  it('permite al administrador quitar la foto de otra persona', async () => {
    iniciarSesionSimuladaPorRun(12345675)
    await subirFotoPerfil({ datos: JPEG, tipo: 'image/jpeg' })

    iniciarSesionSimuladaPorRun(12345678)
    await quitarFotoDeUsuario(12345675)

    iniciarSesionSimuladaPorRun(12345675)
    const sesion = await getMe()

    expect(sesion.usuario.foto_url).toBeNull()
  })

  it('rechaza a quien no es administrador', async () => {
    iniciarSesionSimuladaPorRun(9876543)

    const error = await quitarFotoDeUsuario(12345678).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error instanceof ApiError && error.status).toBe(403)
  })
})
