import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { QueryClient } from '@tanstack/react-query'
import { obtenerTodosLosUsuarios, usuarioQueryOptions } from '@/features/usuarios/api/usuarios'
import { ApiError } from '@/lib/apiClient'
import { iniciarSesionSimuladaPorRun } from '@/mocks/handlers/sesion.estado'
import { server } from '@/mocks/server'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const RUTA = `${API_BASE_URL}/api/usuarios`

function usuarioDePrueba(run: number): Usuario {
  return {
    run,
    digitoVerificador: '0',
    emailInstitucional: `persona.${run}@ejemplo.cl`,
    emailEstudiantil: null,
    nombres: 'Persona',
    apellidoPaterno: 'De',
    apellidoMaterno: 'Prueba',
    esEstudiante: false,
    estaActivo: true,
    fotoUrl: null,
    portada: null,
    creadoEn: '2026-01-05T08:00:00',
    actualizadoEn: '2026-01-05T08:00:00',
    roles: [],
  }
}

describe('obtenerTodosLosUsuarios', () => {
  beforeEach(() => {
    iniciarSesionSimuladaPorRun(12345678)
  })
  it('entrega todos los usuarios del registro simulado', async () => {
    const usuarios = await obtenerTodosLosUsuarios()

    expect(usuarios).toHaveLength(13)
  })

  it('recorre todas las paginas que informa el backend', async () => {
    const registros = Array.from({ length: 205 }, (_, indice) => usuarioDePrueba(indice + 1))
    const pedidas: string[] = []

    server.use(
      http.get(RUTA, ({ request }) => {
        const parametros = new URL(request.url).searchParams
        const pagina = Number(parametros.get('pagina'))
        const porPagina = Number(parametros.get('por_pagina'))
        const inicio = (pagina - 1) * porPagina

        pedidas.push(`${pagina}:${porPagina}`)

        return HttpResponse.json({
          datos: registros.slice(inicio, inicio + porPagina),
          paginacion: { pagina, por_pagina: porPagina, total: registros.length },
        })
      }),
    )

    const usuarios = await obtenerTodosLosUsuarios()

    expect(usuarios.map((usuario) => usuario.run)).toEqual(registros.map((usuario) => usuario.run))
    expect([...pedidas].sort()).toEqual(['1:100', '2:100', '3:100'])
  })

  it('no repite un usuario que se desplaza entre paginas', async () => {
    const registros = Array.from({ length: 150 }, (_, indice) => usuarioDePrueba(indice + 1))

    server.use(
      http.get(RUTA, ({ request }) => {
        const pagina = Number(new URL(request.url).searchParams.get('pagina'))
        const datos = pagina === 1 ? registros.slice(0, 100) : registros.slice(99, 150)

        return HttpResponse.json({
          datos,
          paginacion: { pagina, por_pagina: 100, total: registros.length },
        })
      }),
    )

    const usuarios = await obtenerTodosLosUsuarios()

    expect(usuarios).toHaveLength(150)
    expect(new Set(usuarios.map((usuario) => usuario.run)).size).toBe(150)
  })

  it('pide una sola pagina cuando no hay usuarios', async () => {
    let pedidas = 0

    server.use(
      http.get(RUTA, () => {
        pedidas += 1

        return HttpResponse.json({
          datos: [],
          paginacion: { pagina: 1, por_pagina: 100, total: 0 },
        })
      }),
    )

    expect(await obtenerTodosLosUsuarios()).toEqual([])
    expect(pedidas).toBe(1)
  })
})

describe('usuarioQueryOptions', () => {
  beforeEach(() => {
    iniciarSesionSimuladaPorRun(12345678)
  })

  function crearCliente() {
    return new QueryClient({ defaultOptions: { queries: { retry: false } } })
  }

  it('entrega el usuario pedido por su run', async () => {
    const usuario = await crearCliente().fetchQuery(usuarioQueryOptions(12345678))

    expect(usuario.nombres).toBe('Ana')
  })

  it('propaga el 404 de un run inexistente', async () => {
    const error = await crearCliente()
      .fetchQuery(usuarioQueryOptions(1))
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error instanceof ApiError && error.status).toBe(404)
  })
})
