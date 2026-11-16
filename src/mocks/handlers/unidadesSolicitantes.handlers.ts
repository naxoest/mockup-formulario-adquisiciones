import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { campusMock, opcionesDeSedes } from '@/mocks/data/unidadesSolicitantes.mock'
import { obtenerUnidadesSolicitantes } from '@/mocks/handlers/unidadesSolicitantes.estado'

export const unidadesSolicitantesHandlers = [
  http.get(`${API_BASE_URL}/api/campus`, ({ request }) => {
    const tipoSolicitante = new URL(request.url).searchParams.get('tipoSolicitante')

    if (!tipoSolicitante) {
      return HttpResponse.json(campusMock)
    }

    const conUnidades = new Set(
      obtenerUnidadesSolicitantes()
        .filter((item) => item.tipo === tipoSolicitante)
        .flatMap((item) => item.sedes),
    )

    return HttpResponse.json(campusMock.filter((campus) => conUnidades.has(campus.value)))
  }),
  http.get(`${API_BASE_URL}/api/unidades-solicitantes`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const tipoSolicitante = params.get('tipoSolicitante')
    const campus = params.get('campus')
    const busqueda = (params.get('busqueda') ?? '').trim().toLowerCase()

    let resultado = obtenerUnidadesSolicitantes()
    if (tipoSolicitante) {
      resultado = resultado.filter((item) => item.tipo === tipoSolicitante)
    }
    if (campus) {
      resultado = resultado.filter((item) => item.sedes.includes(campus))
    }
    if (busqueda) {
      resultado = resultado.filter((item) => item.nombre.toLowerCase().includes(busqueda))
    }

    return HttpResponse.json(
      resultado.map(({ id, nombre, cr, activo, sedes }) => ({
        id,
        label: nombre,
        cr,
        activo,
        sedes: opcionesDeSedes(sedes),
      })),
    )
  }),
]
