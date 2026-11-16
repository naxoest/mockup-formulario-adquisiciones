import { describe, expect, it } from 'vitest'
import { requerimientosMock } from '@/mocks/data/requerimientos.mock'
import { esAdministrador } from '@/mocks/handlers/autorizacion'
import { cerrarSesionSimulada, iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { obtenerUsuarios } from '@/mocks/handlers/usuarios.estado'
import {
  conCuerpo,
  crearBorrador,
  datosDeBorrador,
  pedirError,
  pedirUnidadMantenedor,
  pedirUnidadesMantenedor,
} from '@/mocks/pruebas'

const RUTA = '/api/mantenedor/unidades-solicitantes'
const UNIDAD_ID = 1
const NUEVA_UNIDAD = {
  cr: 999,
  nombre: 'Carrera de prueba',
  tipo: 'carrera',
  sedes: ['osorno', 'pto'],
}

function iniciarSesionSinAdministracion(): void {
  const usuario = obtenerUsuarios().find((item) => item.estaActivo && !esAdministrador(item))

  if (usuario === undefined) {
    throw new Error('Los datos simulados no incluyen un usuario activo sin rol administrador')
  }

  iniciarSesionSimuladaPorRun(usuario.run)
}

async function idsDe(ruta: string): Promise<number[]> {
  const { cuerpo } = await pedirUnidadesMantenedor(ruta)

  return cuerpo.data.map((unidad) => unidad.id)
}

describe('GET /api/mantenedor/unidades-solicitantes', () => {
  it('etiqueta el tipo y las sedes de cada registro', async () => {
    const { respuesta, cuerpo } = await pedirUnidadesMantenedor(RUTA)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.data.find((unidad) => unidad.id === 3)).toMatchObject({
      cr: 109,
      nombre: 'Arquitectura',
      tipo: { value: 'carrera', label: 'Carrera' },
      sedes: [{ value: 'pto', label: 'Puerto Montt' }],
      activo: true,
    })
  })

  it('entrega solo la pagina solicitada', async () => {
    const { cuerpo } = await pedirUnidadesMantenedor(`${RUTA}?page=2&perPage=4`)

    expect(cuerpo.data).toHaveLength(4)
    expect(cuerpo.meta).toEqual({ page: 2, perPage: 4, total: 10, totalPages: 3 })
  })

  it('mantiene un orden estable entre registros con el mismo nombre', async () => {
    expect(await idsDe(`${RUTA}?perPage=4`)).toEqual([2, 3, 8, 1])
  })

  it('ordena de forma descendente segun el parametro sort', async () => {
    const ids = await idsDe(`${RUTA}?sort=-cr&perPage=1`)

    expect(ids).toEqual([6])
  })

  it('busca por nombre, CR y sede', async () => {
    expect(await idsDe(`${RUTA}?q=biblioteca`)).toEqual([8])
    expect(await idsDe(`${RUTA}?q=109`)).toEqual([3])
    expect(await idsDe(`${RUTA}?q=puerto`)).toEqual([3, 1, 4, 6])
  })

  it('combina los filtros y mantiene el resumen general', async () => {
    const { cuerpo } = await pedirUnidadesMantenedor(`${RUTA}?sede=pto&tipo=carrera`)

    expect(cuerpo.data.map((unidad) => unidad.id)).toEqual([3, 1])
    expect(cuerpo.meta.total).toBe(2)
    expect(cuerpo.resumen).toEqual({ registros: 10, inactivos: 0 })
  })

  it('filtra por estado', async () => {
    const { cuerpo } = await pedirUnidadesMantenedor(`${RUTA}?estado=inactiva`)

    expect(cuerpo.data).toEqual([])
    expect(cuerpo.meta).toMatchObject({ total: 0, totalPages: 0 })
  })

  it('cuenta las solicitudes y los requerimientos vigentes de la unidad', async () => {
    const antes = await pedirUnidadesMantenedor(`${RUTA}?perPage=100`)
    const solicitudesAntes =
      antes.cuerpo.data.find((unidad) => unidad.id === UNIDAD_ID)?.solicitudes ?? 0

    await crearBorrador(datosDeBorrador())

    const despues = await pedirUnidadesMantenedor(`${RUTA}?perPage=100`)
    const unidad = despues.cuerpo.data.find((item) => item.id === UNIDAD_ID)
    const requerimientosVigentes = requerimientosMock.filter(
      (requerimiento) => requerimiento.solicitanteId === UNIDAD_ID && !requerimiento.eliminado,
    ).length

    expect(unidad?.solicitudes).toBe(solicitudesAntes + 1)
    expect(unidad?.requerimientos).toBe(requerimientosVigentes)
  })

  it('rechaza a un usuario sin rol administrador', async () => {
    iniciarSesionSinAdministracion()

    const { respuesta } = await pedirError(RUTA)

    expect(respuesta.status).toBe(403)
  })

  it('exige una sesion iniciada', async () => {
    cerrarSesionSimulada()

    const { respuesta } = await pedirError(RUTA)

    expect(respuesta.status).toBe(401)
  })
})

describe('POST /api/mantenedor/unidades-solicitantes', () => {
  it('crea un registro activo con sus sedes', async () => {
    const { respuesta, cuerpo } = await pedirUnidadMantenedor(RUTA, conCuerpo('POST', NUEVA_UNIDAD))

    expect(respuesta.status).toBe(201)
    expect(cuerpo).toMatchObject({
      cr: 999,
      activo: true,
      sedes: [
        { value: 'osorno', label: 'Osorno' },
        { value: 'pto', label: 'Puerto Montt' },
      ],
    })
  })

  it('rechaza un CR de un registro inactivo', async () => {
    await pedirUnidadMantenedor(`${RUTA}/3/desactivar`, { method: 'POST' })

    const { respuesta, cuerpo } = await pedirError(
      RUTA,
      conCuerpo('POST', { ...NUEVA_UNIDAD, cr: 109 }),
    )

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toMatchObject({ code: 'cr_duplicado', field: 'cr' })
  })

  it('rechaza una sede inexistente y un registro sin sedes', async () => {
    const inexistente = await pedirError(
      RUTA,
      conCuerpo('POST', { ...NUEVA_UNIDAD, sedes: ['inexistente'] }),
    )
    const sinSedes = await pedirError(RUTA, conCuerpo('POST', { ...NUEVA_UNIDAD, sedes: [] }))

    expect(inexistente.cuerpo).toMatchObject({ code: 'sede_inexistente', field: 'sedes' })
    expect(sinSedes.cuerpo).toMatchObject({ code: 'cuerpo_invalido', field: 'sedes' })
  })

  it('rechaza a un usuario sin rol administrador', async () => {
    iniciarSesionSinAdministracion()

    const { respuesta } = await pedirError(RUTA, conCuerpo('POST', NUEVA_UNIDAD))

    expect(respuesta.status).toBe(403)
  })
})

describe('PATCH /api/mantenedor/unidades-solicitantes/:id', () => {
  it('actualiza el registro y admite conservar su propio CR', async () => {
    const { respuesta, cuerpo } = await pedirUnidadMantenedor(
      `${RUTA}/3`,
      conCuerpo('PATCH', { cr: 109, nombre: 'Arquitectura y Urbanismo', sedes: ['osorno'] }),
    )

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toMatchObject({
      cr: 109,
      nombre: 'Arquitectura y Urbanismo',
      sedes: [{ value: 'osorno', label: 'Osorno' }],
    })
  })

  it('rechaza el CR de otro registro', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/3`, conCuerpo('PATCH', { cr: 101 }))

    expect(respuesta.status).toBe(409)
    expect(cuerpo).toMatchObject({ code: 'cr_duplicado', field: 'cr' })
  })

  it('responde 404 si el registro no existe', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/999`, conCuerpo('PATCH', { cr: 1 }))

    expect(respuesta.status).toBe(404)
    expect(cuerpo.code).toBe('unidad_inexistente')
  })
})

describe('activar y desactivar', () => {
  it('cambia el estado de forma idempotente', async () => {
    const primera = await pedirUnidadMantenedor(`${RUTA}/3/desactivar`, { method: 'POST' })
    const segunda = await pedirUnidadMantenedor(`${RUTA}/3/desactivar`, { method: 'POST' })
    const activada = await pedirUnidadMantenedor(`${RUTA}/3/activar`, { method: 'POST' })

    expect(primera.cuerpo.activo).toBe(false)
    expect(segunda.cuerpo.activo).toBe(false)
    expect(activada.cuerpo.activo).toBe(true)
  })
})
