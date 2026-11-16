import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/config/env'
import { fromCivilDate, toCivilDate } from '@/utils/date'
import { bloqueadoresMock, type RegistroMonitoreoAlmacenado } from '@/mocks/data/monitoreo.mock'
import type { TransaccionAlmacenada } from '@/mocks/data/transacciones.mock'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import { principalDe } from '@/mocks/handlers/analistas.derivacion'
import { exigirAdministrador } from '@/mocks/handlers/autorizacion'
import {
  obtenerMonitoreo,
  obtenerTransacciones,
  reemplazarRegistroMonitoreo,
} from '@/mocks/handlers/transacciones.estado'
import { actualizacionMonitoreoRequestSchema } from '@/features/transacciones/schemas/monitoreoRequest.schema'
import type { SelectOption } from '@/types/select'

type CambiosMonitoreo = ReturnType<typeof actualizacionMonitoreoRequestSchema.parse>

function aTextoOpcional(valor: string | null): string | null {
  return valor === '' ? null : valor
}

function aFechaOpcional(valor: string | null): Date | null {
  return valor === null ? null : fromCivilDate(valor)
}

function buscarBloqueador(codigo: string | null): SelectOption | null {
  if (codigo === null) return null
  return bloqueadoresMock.find((opcion) => opcion.value === codigo) ?? null
}

function aplicarCambios(
  registro: RegistroMonitoreoAlmacenado,
  cambios: CambiosMonitoreo,
): RegistroMonitoreoAlmacenado {
  return {
    ...registro,
    factores: cambios.factores ?? registro.factores,
    proximaAccion:
      cambios.proximaAccion === undefined
        ? registro.proximaAccion
        : aTextoOpcional(cambios.proximaAccion),
    fechaProximaRevision:
      cambios.fechaProximaRevision === undefined
        ? registro.fechaProximaRevision
        : aFechaOpcional(cambios.fechaProximaRevision),
    bloqueadorPrincipal:
      cambios.bloqueadorPrincipal === undefined
        ? registro.bloqueadorPrincipal
        : aTextoOpcional(cambios.bloqueadorPrincipal),
    escalarAJefatura: cambios.escalarAJefatura ?? registro.escalarAJefatura,
    cerrado: cambios.cerrado ?? registro.cerrado,
    observaciones:
      cambios.observaciones === undefined
        ? registro.observaciones
        : aTextoOpcional(cambios.observaciones),
  }
}

function aInstanteLocal(fecha: Date): string {
  const hora = String(fecha.getHours()).padStart(2, '0')
  const minuto = String(fecha.getMinutes()).padStart(2, '0')
  const segundo = String(fecha.getSeconds()).padStart(2, '0')
  return `${toCivilDate(fecha)}T${hora}:${minuto}:${segundo}`
}

interface RegistroVisible {
  registro: RegistroMonitoreoAlmacenado
  transaccion: TransaccionAlmacenada
}

function registrosVisibles(): RegistroVisible[] {
  const transacciones = obtenerTransacciones()

  return obtenerMonitoreo().flatMap((registro) => {
    const transaccion = transacciones.find(
      (item) => item.id === registro.transaccionId && item.confirmadaEn !== null,
    )

    return transaccion === undefined ? [] : [{ registro, transaccion }]
  })
}

function aRespuesta({ registro, transaccion }: RegistroVisible) {
  return {
    transaccionId: registro.transaccionId,
    nombre: transaccion.nombre,
    analista: principalDe(registro.transaccionId),
    evaluacion: registro.factores === null ? null : calcularEvaluacion(registro.factores),
    ultimoMovimiento:
      registro.ultimoMovimiento === null ? null : aInstanteLocal(registro.ultimoMovimiento),
    proximaAccion: registro.proximaAccion,
    fechaProximaRevision:
      registro.fechaProximaRevision === null ? null : toCivilDate(registro.fechaProximaRevision),
    bloqueadorPrincipal: buscarBloqueador(registro.bloqueadorPrincipal),
    escalarAJefatura: registro.escalarAJefatura,
    cerrado: registro.cerrado,
    observaciones: registro.observaciones,
  }
}

export const monitoreoHandlers = [
  http.get(
    `${API_BASE_URL}/api/monitoreo/bloqueadores`,
    () => exigirAdministrador() ?? HttpResponse.json(bloqueadoresMock),
  ),

  http.get(
    `${API_BASE_URL}/api/monitoreo`,
    () => exigirAdministrador() ?? HttpResponse.json(registrosVisibles().map(aRespuesta)),
  ),

  http.patch(`${API_BASE_URL}/api/monitoreo/:transaccionId`, async ({ params, request }) => {
    const rechazo = exigirAdministrador()
    if (rechazo) return rechazo

    const actual = registrosVisibles().find(
      ({ registro }) => registro.transaccionId === Number(params.transaccionId),
    )

    if (!actual) {
      return HttpResponse.json({ error: 'Registro de monitoreo no encontrado' }, { status: 404 })
    }

    const cuerpo: unknown = await request.json()
    const resultado = actualizacionMonitoreoRequestSchema.safeParse(cuerpo)

    if (!resultado.success) {
      return HttpResponse.json({ error: 'Datos de actualización inválidos' }, { status: 422 })
    }

    if (resultado.data.bloqueadorPrincipal !== undefined) {
      const codigo = aTextoOpcional(resultado.data.bloqueadorPrincipal)

      if (codigo !== null && buscarBloqueador(codigo) === null) {
        return HttpResponse.json(
          {
            error: 'El bloqueador indicado no existe',
            code: 'bloqueador_inexistente',
            field: 'bloqueadorPrincipal',
          },
          { status: 422 },
        )
      }
    }

    const actualizado = aplicarCambios(actual.registro, resultado.data)
    reemplazarRegistroMonitoreo(actualizado)

    return HttpResponse.json(aRespuesta({ registro: actualizado, transaccion: actual.transaccion }))
  }),
]
