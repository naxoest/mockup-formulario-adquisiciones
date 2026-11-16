import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { transaccionesReporteMock } from '@/mocks/data/reporteAdquisiciones.mock'
import { reportePdfMock } from '@/mocks/data/reportePdf.mock'

import { agregarReporte, leerFiltrosConsulta } from '@/mocks/handlers/reportes.agregacion'
import {
  agregarPerfilUnidad,
  agregarRankingUnidades,
  leerConsultaRanking,
} from '@/mocks/handlers/reportes.unidades'
import { responderError } from '@/mocks/handlers/respuestas'
import { derivarTransaccion, resolverUnidad } from '@/mocks/handlers/transacciones.derivacion'
import { obtenerTransacciones } from '@/mocks/handlers/transacciones.estado'
import { buscarUnidadSolicitante } from '@/mocks/handlers/unidadesSolicitantes.estado'

function construirCuerpoPdf(): ArrayBuffer {
  const bytes = new TextEncoder().encode(reportePdfMock)
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

function construirNombreArchivo(parametros: URLSearchParams): string {
  const partes = ['reporte-adquisiciones', parametros.get('desde'), parametros.get('hasta')]
  return `${partes.filter(Boolean).join('-')}.pdf`
}

export const reportesHandlers = [
  http.get(`${API_BASE_URL}/api/reportes/adquisiciones.pdf`, ({ request }) => {
    const parametros = new URL(request.url).searchParams

    return HttpResponse.arrayBuffer(construirCuerpoPdf(), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${construirNombreArchivo(parametros)}"`,
      },
    })
  }),
  http.get(`${API_BASE_URL}/api/reportes/adquisiciones`, ({ request }) => {
    const parametros = new URL(request.url).searchParams

    return HttpResponse.json(
      agregarReporte(transaccionesReporteMock, leerFiltrosConsulta(parametros)),
    )
  }),
  http.get(`${API_BASE_URL}/api/reportes/unidades`, ({ request }) => {
    const parametros = new URL(request.url).searchParams

    return HttpResponse.json(
      agregarRankingUnidades(
        obtenerTransacciones().map(derivarTransaccion),
        leerConsultaRanking(parametros),
      ),
    )
  }),
  http.get(`${API_BASE_URL}/api/reportes/unidades/:id`, ({ params }) => {
    const unidadId = Number(params.id)

    if (buscarUnidadSolicitante(unidadId) === undefined) {
      return responderError('Unidad no encontrada', 404, 'unidad_inexistente')
    }

    return HttpResponse.json(
      agregarPerfilUnidad(resolverUnidad(unidadId), obtenerTransacciones().map(derivarTransaccion)),
    )
  }),
]
