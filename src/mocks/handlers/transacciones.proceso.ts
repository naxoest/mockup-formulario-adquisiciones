import type {
  MotivoBloqueoProceso,
  PasoProceso,
  ProcesoAdquisicion,
} from '@/features/transacciones/types/transaccion.types'
import type {
  PasoRegistradoAlmacenado,
  TransaccionAlmacenada,
} from '@/mocks/data/transacciones.mock'
import { estadoTransaccionOptions } from '@/mocks/data/listas.mock'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { buscarUsuario } from '@/mocks/handlers/usuarios.estado'

const PASOS_PROCESO: readonly PasoProceso[] = [
  'presupuesto_solicitado',
  'presupuesto_asignado',
  'enviada_a_adquisiciones',
  'analista_asignado',
  'aprobada',
  'aprobada_con_observaciones',
  'subsanada',
  'publicada',
  'evaluada',
]

const MODALIDADES_SIN_PUBLICACION: readonly string[] = [
  'directo',
  'conveniomarco',
  'conveniosuministro',
]

export function esPasoProceso(valor: string): valor is PasoProceso {
  return PASOS_PROCESO.some((paso) => paso === valor)
}

export function etiquetaPaso(paso: PasoProceso): string {
  return estadoTransaccionOptions.find((opcion) => opcion.value === paso)?.label ?? paso
}

export function pasoActualDe(pasos: PasoRegistradoAlmacenado[]): PasoProceso | null {
  return pasos.at(-1)?.paso ?? null
}

export function pasosAplicablesDe(
  modalidad: string,
  pasos: PasoRegistradoAlmacenado[],
): PasoProceso[] {
  const aprobacion: PasoProceso[] = pasos.some(
    (registrado) => registrado.paso === 'aprobada_con_observaciones',
  )
    ? ['aprobada_con_observaciones', 'subsanada']
    : ['aprobada']
  const publicacion: PasoProceso[] = MODALIDADES_SIN_PUBLICACION.includes(modalidad)
    ? []
    : ['publicada', 'evaluada']

  return [
    'presupuesto_solicitado',
    'presupuesto_asignado',
    'enviada_a_adquisiciones',
    'analista_asignado',
    ...aprobacion,
    ...publicacion,
  ]
}

export function siguientesDe(modalidad: string, pasos: PasoRegistradoAlmacenado[]): PasoProceso[] {
  const actual = pasoActualDe(pasos)

  if (actual === null) {
    return ['presupuesto_solicitado']
  }

  if (actual === 'analista_asignado') {
    return ['aprobada', 'aprobada_con_observaciones']
  }

  const aplicables = pasosAplicablesDe(modalidad, pasos)
  const posicion = aplicables.indexOf(actual)

  return posicion + 1 < aplicables.length ? [aplicables[posicion + 1]] : []
}

export function motivoBloqueoDe(transaccion: TransaccionAlmacenada): MotivoBloqueoProceso | null {
  const activas = transaccion.solicitudes.filter((solicitud) => solicitud.estado !== 'rechazada')

  if (activas.length === 0) {
    return {
      codigo: 'sin_solicitudes_activas',
      mensaje: 'La transacción no tiene solicitudes activas.',
    }
  }

  if (
    transaccion.pasos.length === 0 &&
    activas.some((solicitud) => solicitud.precompromisos.length === 0)
  ) {
    return {
      codigo: 'solicitudes_sin_cotizar',
      mensaje:
        'Todas las solicitudes activas deben tener cotización antes de enviar la transacción a adquisiciones.',
    }
  }

  return null
}

function nombreDeRegistrador(run: number): string {
  const usuario = buscarUsuario(run)

  if (!usuario) {
    throw new Error(`Los datos simulados no contienen al usuario ${run}`)
  }

  return nombreDeAnalista(usuario)
}

export function procesoDe(transaccion: TransaccionAlmacenada): ProcesoAdquisicion {
  const motivoBloqueo = motivoBloqueoDe(transaccion)
  const siguientes =
    motivoBloqueo === null ? siguientesDe(transaccion.modalidad, transaccion.pasos) : []

  return {
    pasoActual: pasoActualDe(transaccion.pasos),
    siguientesPermitidos: siguientes.map((paso) => ({
      paso,
      etiqueta: etiquetaPaso(paso),
      requiereObservacion: paso === 'aprobada_con_observaciones',
    })),
    pasosAplicables: pasosAplicablesDe(transaccion.modalidad, transaccion.pasos).map((paso) => ({
      paso,
      etiqueta: etiquetaPaso(paso),
    })),
    registrados: transaccion.pasos.map((registrado) => ({
      paso: registrado.paso,
      etiqueta: etiquetaPaso(registrado.paso),
      fecha: registrado.fecha,
      observacion: registrado.observacion,
      registradoEn: registrado.registradoEn,
      autor: nombreDeRegistrador(registrado.registradoPor),
    })),
    motivoBloqueo,
  }
}
