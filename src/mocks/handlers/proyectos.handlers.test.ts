import { describe, expect, it } from 'vitest'
import { esAdministrador } from '@/mocks/handlers/autorizacion'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { obtenerUsuarios } from '@/mocks/handlers/usuarios.estado'
import {
  conCuerpo,
  pedirError,
  pedirProyectoMantenedor,
  pedirProyectosMantenedor,
} from '@/mocks/pruebas'

const RUTA_PROYECTOS = '/api/mantenedor/proyectos'
const NUEVO_PROYECTO = {
  cr: 888,
  nombre: 'Proyecto de Prueba Fondecyt',
}

function iniciarSesionSinAdministracion(): void {
  const usuario = obtenerUsuarios().find((item) => item.estaActivo && !esAdministrador(item))

  if (usuario === undefined) {
    throw new Error('Los datos simulados no incluyen un usuario activo sin rol administrador')
  }

  iniciarSesionSimuladaPorRun(usuario.run)
}

describe('GET /api/mantenedor/proyectos', () => {
  it('entrega la lista de proyectos con paginacion y resumen', async () => {
    const { respuesta, cuerpo } = await pedirProyectosMantenedor(RUTA_PROYECTOS)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.data.length).toBeGreaterThan(0)
    expect(cuerpo.meta).toMatchObject({ page: 1, perPage: 10 })
    expect(cuerpo.resumen.registros).toBeGreaterThan(0)
  })

  it('ordena por CR descendente', async () => {
    const { cuerpo } = await pedirProyectosMantenedor(`${RUTA_PROYECTOS}?sort=-cr&perPage=2`)

    expect(cuerpo.data[0].cr).toBeGreaterThan(cuerpo.data[1].cr)
  })

  it('busca por nombre y por CR', async () => {
    const porNombre = await pedirProyectosMantenedor(`${RUTA_PROYECTOS}?q=FONDECYT`)
    expect(porNombre.cuerpo.data).toHaveLength(1)
    expect(porNombre.cuerpo.data[0].cr).toBe(201)

    const porCr = await pedirProyectosMantenedor(`${RUTA_PROYECTOS}?q=202`)
    expect(porCr.cuerpo.data).toHaveLength(1)
    expect(porCr.cuerpo.data[0].nombre).toContain('FIC R')
  })

  it('filtra por estado activo e inactivo', async () => {
    const inactivos = await pedirProyectosMantenedor(`${RUTA_PROYECTOS}?estado=inactivo`)
    expect(inactivos.cuerpo.data.every((proyecto) => !proyecto.activo)).toBe(true)

    const activos = await pedirProyectosMantenedor(`${RUTA_PROYECTOS}?estado=activo`)
    expect(activos.cuerpo.data.every((proyecto) => proyecto.activo)).toBe(true)
  })
})

describe('POST /api/mantenedor/proyectos', () => {
  it('crea un nuevo proyecto y responde 201 con cabecera Location', async () => {
    const { respuesta, cuerpo } = await pedirProyectoMantenedor(
      RUTA_PROYECTOS,
      conCuerpo('POST', NUEVO_PROYECTO),
    )
    expect(respuesta.status).toBe(201)
    expect(respuesta.headers.get('Location')).toMatch(/\/api\/mantenedor\/proyectos\/\d+$/)

    expect(cuerpo).toMatchObject({
      cr: NUEVO_PROYECTO.cr,
      nombre: NUEVO_PROYECTO.nombre,
      activo: true,
      solicitudes: 0,
    })
  })

  it('rechaza un CR duplicado con 409', async () => {
    const { respuesta, cuerpo } = await pedirError(
      RUTA_PROYECTOS,
      conCuerpo('POST', { cr: 201, nombre: 'Proyecto duplicado' }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toMatchObject({ code: 'cr_duplicado', field: 'cr' })
  })

  it('exige sesion de administrador', async () => {
    iniciarSesionSinAdministracion()

    const { respuesta } = await pedirError(RUTA_PROYECTOS, conCuerpo('POST', NUEVO_PROYECTO))
    expect(respuesta.status).toBe(403)
  })
})

describe('PATCH /api/mantenedor/proyectos/:id', () => {
  it('modifica el nombre y CR de un proyecto existente', async () => {
    const { respuesta, cuerpo } = await pedirProyectoMantenedor(
      `${RUTA_PROYECTOS}/1`,
      conCuerpo('PATCH', { nombre: 'Proyecto Actualizado', cr: 777 }),
    )
    expect(respuesta.status).toBe(200)
    expect(cuerpo).toMatchObject({
      id: 1,
      cr: 777,
      nombre: 'Proyecto Actualizado',
    })
  })

  it('rechaza el CR de otro proyecto con 409', async () => {
    const { respuesta, cuerpo } = await pedirError(
      `${RUTA_PROYECTOS}/1`,
      conCuerpo('PATCH', { cr: 202 }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toMatchObject({ code: 'cr_duplicado', field: 'cr' })
  })

  it('responde 404 si el proyecto no existe', async () => {
    const { respuesta, cuerpo } = await pedirError(
      `${RUTA_PROYECTOS}/999`,
      conCuerpo('PATCH', { nombre: 'Inexistente' }),
    )

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('proyecto_inexistente')
  })
})

describe('activar y desactivar proyectos', () => {
  it('cambia el estado de forma idempotente', async () => {
    const desactivada = await pedirProyectoMantenedor(`${RUTA_PROYECTOS}/1/desactivar`, {
      method: 'POST',
    })
    expect(desactivada.cuerpo.activo).toBe(false)

    const activada = await pedirProyectoMantenedor(`${RUTA_PROYECTOS}/1/activar`, {
      method: 'POST',
    })
    expect(activada.cuerpo.activo).toBe(true)
  })

  it('responde 404 si el proyecto no existe', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA_PROYECTOS}/999/activar`, {
      method: 'POST',
    })
    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('proyecto_inexistente')
  })
})
