import { beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { asignacionAnalistasResponseSchema } from '@/features/transacciones/schemas/analistaResponse.schema'
import { historialResponseSchema } from '@/features/transacciones/schemas/historialResponse.schema'
import { asignacionesUsuarioResponseSchema } from '@/features/usuarios/schemas/asignacionesUsuarioResponse.schema'
import { MOTIVO_DESACTIVACION, MOTIVO_PERDIDA_DE_ROL } from '@/mocks/data/asignaciones.mock'
import { createMockUsuario } from '@/mocks/data/auth.mock'
import {
  conCuerpo,
  pedirError,
  pedirPaginaUsuarios,
  pedirRoles,
  pedirUsuario,
} from '@/mocks/pruebas'
import { cerrarSesionSimulada, iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'

const RUTA = '/api/usuarios'
const FECHA_HORA_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
const PAGINACION_INVALIDA = 'Los parámetros de paginación no son válidos'
const RUTA_INEXISTENTE =
  'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.'

const RUNS_ORDENADOS = [
  8765432, 9876543, 12345675, 12345678, 13579246, 15432109, 16234875, 17890123, 18765432, 19456782,
  20123456, 21098765, 22345678,
]

const TOTAL_REGISTRO = RUNS_ORDENADOS.length

const nuevoUsuario = {
  run: 14725836,
  digitoVerificador: '4',
  emailInstitucional: 'tomas.saez@ejemplo.cl',
  emailEstudiantil: null,
  nombres: 'Tomás',
  apellidoPaterno: 'Sáez',
  apellidoMaterno: 'Vidal',
  esEstudiante: false,
  roles: [1],
}

const edicion = {
  emailInstitucional: 'gloria.pizarro@ejemplo.cl',
  emailEstudiantil: null,
  nombres: 'Gloria Andrea',
  apellidoPaterno: 'Pizarro',
  apellidoMaterno: 'Núñez',
  esEstudiante: false,
  roles: [3],
}

beforeEach(() => {
  iniciarSesionSimuladaPorRun(12345678)
})

describe('GET /usuarios/roles', () => {
  it('entrega los roles reales sin confundir la ruta con un run', async () => {
    const { respuesta, cuerpo } = await pedirRoles(`${RUTA}/roles`)

    expect(respuesta.status).toBe(200)
    expect([...cuerpo].sort((a, b) => a.id - b.id)).toEqual([
      { id: 1, nombre: 'analista' },
      { id: 2, nombre: 'administrador' },
      { id: 3, nombre: 'solicitante' },
    ])
  })
})

describe('GET /usuarios', () => {
  it('responde con la forma que valida el esquema del frontend, ordenada por run', async () => {
    const { respuesta, cuerpo } = await pedirPaginaUsuarios(RUTA)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.datos.map((usuario) => usuario.run)).toEqual(RUNS_ORDENADOS)
    expect(cuerpo.paginacion).toEqual({ pagina: 1, por_pagina: 20, total: TOTAL_REGISTRO })
  })

  it('entrega la pagina pedida en orden de run', async () => {
    const { cuerpo } = await pedirPaginaUsuarios(`${RUTA}?pagina=2&por_pagina=5`)

    expect(cuerpo.paginacion).toEqual({ pagina: 2, por_pagina: 5, total: TOTAL_REGISTRO })
    expect(cuerpo.datos.map((usuario) => usuario.run)).toEqual([
      15432109, 16234875, 17890123, 18765432, 19456782,
    ])
  })

  it('usa los valores por defecto cuando los parametros vienen vacios', async () => {
    const { cuerpo } = await pedirPaginaUsuarios(`${RUTA}?pagina=&por_pagina=`)

    expect(cuerpo.paginacion).toEqual({ pagina: 1, por_pagina: 20, total: TOTAL_REGISTRO })
  })

  it('entrega una pagina vacia fuera de rango', async () => {
    const { respuesta, cuerpo } = await pedirPaginaUsuarios(`${RUTA}?pagina=9`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.datos).toEqual([])
  })

  it('rechaza una pagina menor que uno', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}?pagina=0`)

    expect(respuesta.status).toBe(422)
    expect(cuerpo).toEqual({ error: PAGINACION_INVALIDA, field: 'pagina' })
  })

  it('rechaza una pagina que no es entera', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}?pagina=dos`)

    expect(respuesta.status).toBe(422)
    expect(cuerpo).toEqual({ error: PAGINACION_INVALIDA, field: 'pagina' })
  })

  it('rechaza mas de cien registros por pagina', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}?por_pagina=101`)

    expect(respuesta.status).toBe(422)
    expect(cuerpo).toEqual({ error: PAGINACION_INVALIDA, field: 'por_pagina' })
  })
})

describe('GET /usuarios/:run', () => {
  it('mantiene la misma identidad que la sesion simulada', async () => {
    const sesion = createMockUsuario()
    const { respuesta, cuerpo } = await pedirUsuario(`${RUTA}/${sesion.run}`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toMatchObject({
      run: sesion.run,
      digitoVerificador: sesion.digito_verificador,
      emailInstitucional: sesion.email_institucional,
      emailEstudiantil: sesion.email_estudiantil,
      nombres: sesion.nombres,
      apellidoPaterno: sesion.apellido_paterno,
      apellidoMaterno: sesion.apellido_materno,
      esEstudiante: sesion.es_estudiante,
      roles: [{ id: 2, nombre: 'administrador' }],
    })
  })

  it('entrega las fechas en hora local sin zona ni fraccion de segundo', async () => {
    const { cuerpo } = await pedirUsuario(`${RUTA}/12345678`)

    expect(cuerpo.creadoEn).toMatch(FECHA_HORA_LOCAL)
    expect(cuerpo.actualizadoEn).toMatch(FECHA_HORA_LOCAL)
  })

  it('responde 404 para un run inexistente', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/1`)

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: 'Usuario no encontrado' })
  })

  it('responde el 404 del enrutador para un run no numerico', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/abc`)

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: RUTA_INEXISTENTE })
  })
})

describe('POST /usuarios', () => {
  it('crea un usuario activo con sus roles y lo agrega al listado', async () => {
    const { respuesta, cuerpo } = await pedirUsuario(RUTA, conCuerpo('POST', nuevoUsuario))

    expect(respuesta.status).toBe(201)
    expect(cuerpo).toMatchObject({
      run: 14725836,
      estaActivo: true,
      roles: [{ id: 1, nombre: 'analista' }],
    })
    expect(cuerpo.creadoEn).toMatch(FECHA_HORA_LOCAL)

    const { cuerpo: pagina } = await pedirPaginaUsuarios(RUTA)

    expect(pagina.paginacion.total).toBe(TOTAL_REGISTRO + 1)
  })

  it('rechaza un run ya registrado sin code ni field', async () => {
    const { respuesta, cuerpo } = await pedirError(
      RUTA,
      conCuerpo('POST', { ...nuevoUsuario, run: 12345678, digitoVerificador: '5' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toEqual({ error: 'El run ya está registrado' })
  })

  it('rechaza un correo ya registrado sin code ni field', async () => {
    const { respuesta, cuerpo } = await pedirError(
      RUTA,
      conCuerpo('POST', { ...nuevoUsuario, emailInstitucional: 'ana.rojas@ejemplo.cl' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toEqual({ error: 'El correo ya está registrado' })
  })
})

describe('PATCH /usuarios/:run', () => {
  it('actualiza los datos y los roles', async () => {
    const { respuesta, cuerpo } = await pedirUsuario(
      `${RUTA}/18765432`,
      conCuerpo('PATCH', edicion),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toMatchObject({
      nombres: 'Gloria Andrea',
      roles: [{ id: 3, nombre: 'solicitante' }],
    })
    expect(cuerpo.actualizadoEn).toMatch(FECHA_HORA_LOCAL)
  })

  it('conserva el correo estudiantil y la condicion de estudiante cuando la edicion no los envia', async () => {
    const { respuesta, cuerpo } = await pedirUsuario(
      `${RUTA}/22345678`,
      conCuerpo('PATCH', {
        emailInstitucional: null,
        nombres: 'Fernanda',
        apellidoPaterno: 'Cárcamo',
        apellidoMaterno: 'Uribe',
        roles: [3],
      }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toMatchObject({
      emailInstitucional: null,
      emailEstudiantil: 'fernanda.carcamo@alumnos.ejemplo.cl',
      esEstudiante: true,
      roles: [{ id: 3, nombre: 'solicitante' }],
    })
  })

  it('rechaza un correo de otro usuario y conserva el cambio de roles, como el backend', async () => {
    const { respuesta, cuerpo } = await pedirError(
      `${RUTA}/18765432`,
      conCuerpo('PATCH', { ...edicion, emailInstitucional: 'ana.rojas@ejemplo.cl' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toEqual({ error: 'El correo ya está registrado' })

    const { cuerpo: usuario } = await pedirUsuario(`${RUTA}/18765432`)

    expect(usuario.roles).toEqual([{ id: 3, nombre: 'solicitante' }])
    expect(usuario.emailInstitucional).toBe('gloria.pizarro@ejemplo.cl')
    expect(usuario.nombres).toBe('Gloria')
  })

  it('responde 404 para un run inexistente cuando no asigna roles', async () => {
    const { respuesta, cuerpo } = await pedirError(
      `${RUTA}/1`,
      conCuerpo('PATCH', { ...edicion, roles: [] }),
    )

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: 'Usuario no encontrado' })
  })

  it('responde 409 para un run inexistente cuando asigna roles, como el backend', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/1`, conCuerpo('PATCH', edicion))

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toEqual({ error: 'El correo ya está registrado' })
  })
})

describe('POST /usuarios/:run/desactivar y /activar', () => {
  it('cambia el estado del usuario', async () => {
    const desactivado = await pedirUsuario(`${RUTA}/12345678/desactivar`, { method: 'POST' })

    expect(desactivado.cuerpo.estaActivo).toBe(false)

    const activado = await pedirUsuario(`${RUTA}/12345678/activar`, { method: 'POST' })

    expect(activado.cuerpo.estaActivo).toBe(true)
  })

  it('responde 404 para un run inexistente', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/1/activar`, { method: 'POST' })

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: 'Usuario no encontrado' })
  })
})

describe('estado de los usuarios simulados', () => {
  it('parte desde el registro base en cada prueba', async () => {
    const { cuerpo } = await pedirPaginaUsuarios(RUTA)

    expect(cuerpo.paginacion.total).toBe(TOTAL_REGISTRO)
  })
})

describe('autorizacion de /usuarios', () => {
  it('responde 401 sin sesion', async () => {
    cerrarSesionSimulada()

    const { respuesta, cuerpo } = await pedirError(RUTA)

    expect(respuesta.status).toBe(401)
    expect(cuerpo).toEqual({ error: 'Autenticación requerida' })
  })

  it('responde 403 a una sesion sin rol de administrador', async () => {
    iniciarSesionSimuladaPorRun(9876543)

    const { respuesta, cuerpo } = await pedirError(`${RUTA}/roles`)

    expect(respuesta.status).toBe(403)
    expect(cuerpo).toEqual({ error: 'No tienes permisos para realizar esta acción' })
  })

  it('aplica la perdida del rol de administrador en la peticion siguiente', async () => {
    await pedirUsuario(`${RUTA}/12345678`, conCuerpo('PATCH', { roles: [1] }))

    const { respuesta } = await pedirError(RUTA)

    expect(respuesta.status).toBe(403)
  })

  it('resuelve la ruta antes de exigir la sesion, como el enrutador del backend', async () => {
    cerrarSesionSimulada()

    const { respuesta, cuerpo } = await pedirError(`${RUTA}/abc`)

    expect(respuesta.status).toBe(404)
    expect(cuerpo).toEqual({ error: RUTA_INEXISTENTE })
  })
})

describe('asignaciones de analistas del usuario', () => {
  const RUN_ARAVENA = 9876543
  const RUN_FERRADA = 16234875
  const RUN_PAILLAN = 17890123
  const RUN_OYARZUN = 19456782

  async function pedirAsignacionesDe(run: number) {
    const respuesta = await fetch(`${API_BASE_URL}${RUTA}/${run}/asignaciones`)
    return asignacionesUsuarioResponseSchema.parse(await respuesta.json())
  }

  async function pedirEquipo(transaccionId: number) {
    const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${transaccionId}/analistas`)
    return asignacionAnalistasResponseSchema.parse(await respuesta.json())
  }

  async function pedirRegistros(transaccionId: number) {
    const respuesta = await fetch(`${API_BASE_URL}/api/transacciones/${transaccionId}/historial`)
    const { eventos } = historialResponseSchema.parse(await respuesta.json())

    return eventos.flatMap((evento) =>
      evento.clase === 'registro'
        ? [{ titulo: evento.titulo, observacion: evento.observacion }]
        : [],
    )
  }

  it('informa en cuantas transacciones participa el usuario', async () => {
    expect(await pedirAsignacionesDe(RUN_OYARZUN)).toEqual({ principal: 2, apoyo: 1 })
    expect(await pedirAsignacionesDe(12345678)).toEqual({ principal: 0, apoyo: 0 })
  })

  it('termina las asignaciones al desactivar y no las restaura al reactivar', async () => {
    await pedirUsuario(`${RUTA}/${RUN_FERRADA}/desactivar`, { method: 'POST' })

    expect(await pedirAsignacionesDe(RUN_FERRADA)).toEqual({ principal: 0, apoyo: 0 })
    expect((await pedirEquipo(1)).principal).toBeNull()
    expect(await pedirRegistros(1)).toContainEqual({
      titulo: 'Terminó la asignación de Camila Ferrada como analista principal',
      observacion: MOTIVO_DESACTIVACION,
    })

    await pedirUsuario(`${RUTA}/${RUN_FERRADA}/activar`, { method: 'POST' })

    expect(await pedirAsignacionesDe(RUN_FERRADA)).toEqual({ principal: 0, apoyo: 0 })
  })

  it('termina las asignaciones solo cuando el usuario pierde el rol analista', async () => {
    await pedirUsuario(`${RUTA}/${RUN_PAILLAN}`, conCuerpo('PATCH', { roles: [1, 3] }))
    await pedirUsuario(`${RUTA}/${RUN_ARAVENA}`, conCuerpo('PATCH', { roles: [3] }))

    expect(await pedirAsignacionesDe(RUN_PAILLAN)).toEqual({ principal: 3, apoyo: 0 })
    expect(await pedirAsignacionesDe(RUN_ARAVENA)).toEqual({ principal: 0, apoyo: 0 })
    expect((await pedirEquipo(8)).apoyo).toEqual([])
    expect(await pedirRegistros(8)).toContainEqual({
      titulo: 'Terminó la asignación de Sebastián Aravena como analista de apoyo',
      observacion: MOTIVO_PERDIDA_DE_ROL,
    })
  })
})
