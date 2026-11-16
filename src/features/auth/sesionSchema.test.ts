import { authSessionSchema, heartbeatResponseSchema } from '@/features/auth/sesionSchema'
import { createMockAuthSession, createMockSesion, MOCK_CSRF_TOKEN } from '@/mocks/data/auth.mock'

const respuestaBackend = {
  csrf_token: 'token-de-prueba',
  roles: [
    { id: 1, nombre: 'analista' },
    { id: 2, nombre: 'administrador' },
  ],
  sesion: { remaining_seconds: 1800, should_warn: false },
  usuario: {
    apellido_materno: 'Ejemplo',
    apellido_paterno: 'Apellido',
    digito_verificador: '5',
    email_estudiantil: null,
    email_institucional: 'persona@ejemplo.cl',
    es_estudiante: false,
    nombres: 'Persona',
    run: 12345678,
  },
}

describe('authSessionSchema', () => {
  it('deja la foto y la portada en nulo si el backend no las envia', () => {
    expect(authSessionSchema.parse(respuestaBackend)).toEqual({
      ...respuestaBackend,
      usuario: { ...respuestaBackend.usuario, foto_url: null, portada: null },
    })
  })

  it('conserva la URL de la foto cuando el backend la entrega', () => {
    const url = 'https://sistema.ejemplo.cl/api/usuarios/12345678/foto?v=abc'
    const sesion = {
      ...respuestaBackend,
      usuario: { ...respuestaBackend.usuario, foto_url: url },
    }

    expect(authSessionSchema.parse(sesion).usuario.foto_url).toBe(url)
  })

  it('conserva la clave de la portada cuando el backend la entrega', () => {
    const sesion = {
      ...respuestaBackend,
      usuario: { ...respuestaBackend.usuario, portada: 'volcan-osorno' },
    }

    expect(authSessionSchema.parse(sesion).usuario.portada).toBe('volcan-osorno')
  })

  it('acepta una sesion sin roles asignados', () => {
    const sesion = createMockAuthSession({ roles: [] })

    expect(authSessionSchema.parse(sesion).roles).toEqual([])
  })

  it('acepta nombres de rol que el frontend no conoce', () => {
    const sesion = createMockAuthSession({ roles: [{ id: 9, nombre: 'auditor' }] })

    expect(authSessionSchema.parse(sesion).roles).toEqual([{ id: 9, nombre: 'auditor' }])
  })

  it('acepta apellidos vacios', () => {
    const sesion = {
      ...respuestaBackend,
      usuario: { ...respuestaBackend.usuario, apellido_materno: '' },
    }

    expect(authSessionSchema.parse(sesion).usuario.apellido_materno).toBe('')
  })

  it('rechaza una respuesta sin roles', () => {
    const completa = createMockAuthSession()
    const sinRoles = {
      usuario: completa.usuario,
      sesion: completa.sesion,
      csrf_token: completa.csrf_token,
    }

    expect(() => authSessionSchema.parse(sinRoles)).toThrow()
  })

  it('rechaza el contrato anterior del usuario', () => {
    expect(() =>
      authSessionSchema.parse({
        ...respuestaBackend,
        usuario: {
          rut: 12345678,
          email_institucional: 'persona@ejemplo.cl',
          email_estudiantil: null,
          nombres: 'Persona',
          apellidos: 'Apellido Ejemplo',
          es_estudiante: false,
        },
      }),
    ).toThrow()
  })
})

describe('heartbeatResponseSchema', () => {
  it('acepta la respuesta del heartbeat', () => {
    const respuesta = { sesion: createMockSesion(), csrf_token: MOCK_CSRF_TOKEN }

    expect(heartbeatResponseSchema.parse(respuesta)).toEqual(respuesta)
  })

  it('rechaza una respuesta sin sesion', () => {
    expect(() => heartbeatResponseSchema.parse({ csrf_token: MOCK_CSRF_TOKEN })).toThrow()
  })
})
