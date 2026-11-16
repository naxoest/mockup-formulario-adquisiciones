import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import type {
  EstadoFormularioAdquisicion,
  FormularioAdquisicion,
} from '@/features/formularios/types/formularioAdquisicion.types'
import type { NuevoFormularioPayload } from '@/features/formularios/utils/catalogosFormulario'
import { formulariosAdquisicionMock } from '@/mocks/data/formulariosAdquisicion.mock'

const RUTA_FORMULARIOS = `${API_BASE_URL}/api/formularios-adquisicion`

let estadoFormularios: FormularioAdquisicion[] = structuredClone(formulariosAdquisicionMock)

function generarSiguienteFolio(modalidad: 'licitacion_publica' | 'trato_directo'): string {
  const prefijo = modalidad === 'licitacion_publica' ? 'LP' : 'TD'
  const cantidadActual = estadoFormularios.filter((item) => item.modalidad === modalidad).length
  const correlativo = String(cantidadActual + 1).padStart(3, '0')
  return `${prefijo}-2026-${correlativo}`
}

export const formulariosAdquisicionHandlers = [
  http.get(RUTA_FORMULARIOS, () => {
    const ordenados = [...estadoFormularios].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    return HttpResponse.json(ordenados)
  }),

  http.post(RUTA_FORMULARIOS, async ({ request }) => {
    const cuerpo = (await request.json()) as NuevoFormularioPayload
    const ahora = new Date().toISOString()
    const folio = generarSiguienteFolio(cuerpo.modalidad)
    const id = `form-${cuerpo.modalidad === 'licitacion_publica' ? 'lp' : 'td'}-${Date.now()}`

    const nuevo: FormularioAdquisicion = {
      ...cuerpo,
      id,
      folio,
      estado: 'en_revision',
      creadoEn: ahora,
      actualizadoEn: ahora,
    } as FormularioAdquisicion

    estadoFormularios = [nuevo, ...estadoFormularios]
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.patch(`${RUTA_FORMULARIOS}/:id/estado`, async ({ params, request }) => {
    const { id } = params
    const cuerpo = (await request.json()) as { estado: EstadoFormularioAdquisicion }
    const indice = estadoFormularios.findIndex((item) => item.id === id)

    if (indice === -1) {
      return HttpResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const actualizado: FormularioAdquisicion = {
      ...estadoFormularios[indice],
      estado: cuerpo.estado,
      actualizadoEn: new Date().toISOString(),
    }

    estadoFormularios[indice] = actualizado
    return HttpResponse.json(actualizado)
  }),
]
