import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import {
  estadoEvaluacionOptions,
  estadoFacturaOptions,
  estadoSolicitudOptions,
  estadoTransaccionOptions,
  financiamientoOptions,
  modalidadOptions,
  periodoPresupuestarioOptions,
  tipoSolicitanteOptions,
  tipoSolicitudOptions,
} from '@/mocks/data/listas.mock'

export const listasHandlers = [
  http.get(`${API_BASE_URL}/api/financiamientos`, () => HttpResponse.json(financiamientoOptions)),
  http.get(`${API_BASE_URL}/api/tipos-solicitud`, () => HttpResponse.json(tipoSolicitudOptions)),
  http.get(`${API_BASE_URL}/api/estados-transaccion`, () =>
    HttpResponse.json(estadoTransaccionOptions),
  ),
  http.get(`${API_BASE_URL}/api/estados-solicitud`, () =>
    HttpResponse.json(estadoSolicitudOptions),
  ),
  http.get(`${API_BASE_URL}/api/modalidades`, () => HttpResponse.json(modalidadOptions)),
  http.get(`${API_BASE_URL}/api/estados-evaluacion`, () =>
    HttpResponse.json(estadoEvaluacionOptions),
  ),
  http.get(`${API_BASE_URL}/api/estados-factura`, () => HttpResponse.json(estadoFacturaOptions)),
  http.get(`${API_BASE_URL}/api/tipos-solicitante`, () =>
    HttpResponse.json(tipoSolicitanteOptions),
  ),
  http.get(`${API_BASE_URL}/api/periodos-presupuestarios`, () =>
    HttpResponse.json(periodoPresupuestarioOptions),
  ),
]
