import { beforeEach, describe, expect, it } from 'vitest'
import { getMe } from '@/features/auth/api'
import { elegirPortada, quitarPortada } from '@/features/usuarios/api/portadaPerfil'
import { ApiError } from '@/lib/apiClient'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'

beforeEach(() => {
  iniciarSesionSimuladaPorRun(12345678)
})

describe('elegirPortada', () => {
  it('guarda la clave y la refleja en la sesion', async () => {
    expect(await elegirPortada('volcan-osorno')).toBe('volcan-osorno')

    const sesion = await getMe()

    expect(sesion.usuario.portada).toBe('volcan-osorno')
  })

  it('propaga el rechazo de una clave con formato invalido', async () => {
    const error = await elegirPortada('Volcán Osorno').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error instanceof ApiError && error.status).toBe(422)
  })
})

describe('quitarPortada', () => {
  it('deja la sesion sin portada', async () => {
    await elegirPortada('santiago')
    await quitarPortada()

    const sesion = await getMe()

    expect(sesion.usuario.portada).toBeNull()
  })
})
