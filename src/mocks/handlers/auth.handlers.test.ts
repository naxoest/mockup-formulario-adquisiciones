import { describe, expect, it } from 'vitest'
import { CLAVE_SIMULADA, createMockUsuario } from '@/mocks/data/auth.mock'
import {
  conCuerpo,
  pedirError,
  pedirHeartbeat,
  pedirSesion,
  pedirSinCuerpo,
  pedirUsuario,
} from '@/mocks/pruebas'
import { cerrarSesionSimulada } from '@/mocks/handlers/sesion.estado'

function credenciales(correo: string, clave = CLAVE_SIMULADA) {
  return conCuerpo('POST', { email_intento: correo, password: clave })
}

async function iniciarComo(correo: string) {
  return pedirSesion('/auth/login', credenciales(correo))
}

describe('POST /auth/login', () => {
  it('inicia la sesion con la forma que valida el esquema del frontend', async () => {
    const { respuesta, cuerpo } = await iniciarComo('ana.rojas@ejemplo.cl')

    expect(respuesta.status).toBe(200)
    expect(cuerpo.usuario).toEqual(createMockUsuario())
    expect(cuerpo.roles).toEqual([{ id: 2, nombre: 'administrador' }])
  })

  it('reconoce el correo sin distinguir mayusculas ni espacios en los extremos', async () => {
    const { respuesta } = await iniciarComo('  Ana.Rojas@Ejemplo.cl ')

    expect(respuesta.status).toBe(200)
  })

  it('permite iniciar sesion con el correo estudiantil', async () => {
    const { cuerpo } = await iniciarComo('fernanda.carcamo@alumnos.ejemplo.cl')

    expect(cuerpo.usuario.run).toBe(22345678)
  })

  it('rechaza una clave incorrecta con el mensaje del backend', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/auth/login',
      credenciales('ana.rojas@ejemplo.cl', 'otra'),
    )

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'Correo o contraseña incorrectos' })
  })

  it('rechaza un correo desconocido con el mismo mensaje', async () => {
    const { respuesta, cuerpo } = await pedirError('/auth/login', credenciales('nadie@ejemplo.cl'))

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'Correo o contraseña incorrectos' })
  })

  it('rechaza una cuenta desactivada con el 403 del backend', async () => {
    const { respuesta, cuerpo } = await pedirError(
      '/auth/login',
      credenciales('valentina.soto@ejemplo.cl'),
    )

    expect(respuesta.status).toBe(403)
    expect(cuerpo).toEqual({ error: 'Tu cuenta está desactivada' })
  })

  it('entrega roles vacios a una cuenta sin roles, como el backend', async () => {
    const { respuesta, cuerpo } = await iniciarComo('gloria.pizarro@ejemplo.cl')

    expect(respuesta.status).toBe(200)
    expect(cuerpo.roles).toEqual([])
  })

  it('responde 422 ante un cuerpo sin credenciales', async () => {
    const { respuesta } = await pedirError('/auth/login', conCuerpo('POST', {}))

    expect(respuesta.status).toBe(422)
  })
})

describe('GET /auth/me', () => {
  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta, cuerpo } = await pedirError('/auth/me')

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'No autenticado' })
  })

  it('entrega la sesion iniciada', async () => {
    await iniciarComo('sebastian.aravena@ejemplo.cl')

    const { cuerpo } = await pedirSesion('/auth/me')

    expect(cuerpo.usuario.run).toBe(9876543)
    expect(cuerpo.roles).toEqual([{ id: 1, nombre: 'analista' }])
  })

  it('conserva los datos personales del momento del login, como el backend', async () => {
    await iniciarComo('ana.rojas@ejemplo.cl')
    await pedirUsuario('/api/usuarios/12345678', conCuerpo('PATCH', { nombres: 'Ana María' }))

    const { cuerpo } = await pedirSesion('/auth/me')

    expect(cuerpo.usuario.nombres).toBe('Ana')
  })

  it('consulta los roles vigentes en cada llamada', async () => {
    await iniciarComo('ana.rojas@ejemplo.cl')
    await pedirUsuario('/api/usuarios/12345678', conCuerpo('PATCH', { roles: [1, 2] }))

    const { cuerpo } = await pedirSesion('/auth/me')

    expect([...cuerpo.roles].sort((a, b) => a.id - b.id)).toEqual([
      { id: 1, nombre: 'analista' },
      { id: 2, nombre: 'administrador' },
    ])
  })

  it('mantiene la sesion abierta de una cuenta desactivada, como el backend', async () => {
    await iniciarComo('ana.rojas@ejemplo.cl')
    await pedirUsuario('/api/usuarios/12345678/desactivar', { method: 'POST' })

    const { respuesta } = await pedirSesion('/auth/me')

    expect(respuesta.status).toBe(200)
  })
})

describe('POST /auth/logout', () => {
  it('cierra la sesion', async () => {
    await iniciarComo('ana.rojas@ejemplo.cl')

    const cierre = await pedirSinCuerpo('/auth/logout', { method: 'POST' })

    expect(cierre.status).toBe(200)

    const { respuesta } = await pedirError('/auth/me')

    expect(respuesta.status).toBe(401)
  })
})

describe('GET /auth/heartbeat', () => {
  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta, cuerpo } = await pedirError('/auth/heartbeat')

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'Autenticación requerida' })
  })

  it('renueva la sesion iniciada', async () => {
    await iniciarComo('ana.rojas@ejemplo.cl')

    const { respuesta, cuerpo } = await pedirHeartbeat('/auth/heartbeat')

    expect(respuesta.status).toBe(200)
    expect(cuerpo.sesion.remaining_seconds).toBe(1800)
  })
})
