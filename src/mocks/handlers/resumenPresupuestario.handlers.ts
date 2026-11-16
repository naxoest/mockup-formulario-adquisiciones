import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { agregarResumenPresupuestario } from '@/mocks/handlers/resumenPresupuestario.agregacion'
import { derivarTransaccion } from '@/mocks/handlers/transacciones.derivacion'
import { obtenerTransacciones } from '@/mocks/handlers/transacciones.estado'

export const resumenPresupuestarioHandlers = [
  http.get(`${API_BASE_URL}/api/resumen_presupuestario`, () =>
    HttpResponse.json(
      agregarResumenPresupuestario(obtenerTransacciones().map(derivarTransaccion), new Date()),
    ),
  ),
]
