import type {
  AnalistaReferencia,
  AnalistasTransaccion,
  ParticipacionAnalista,
} from '@/features/transacciones/types/transaccion.types'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import type { AsignacionAlmacenada } from '@/mocks/data/asignaciones.mock'
import { obtenerAsignaciones } from '@/mocks/handlers/transacciones.estado'
import { buscarUsuario } from '@/mocks/handlers/usuarios.estado'

function referenciaDe(run: number): AnalistaReferencia {
  const usuario = buscarUsuario(run)

  if (!usuario) {
    throw new Error(`La asignación referencia a un usuario inexistente: ${run}`)
  }

  return { run: usuario.run, nombre: nombreDeAnalista(usuario) }
}

function asignacionesDe(transaccionId: number): AsignacionAlmacenada[] {
  return obtenerAsignaciones().filter((item) => item.transaccionId === transaccionId)
}

export function principalDe(transaccionId: number): AnalistaReferencia | null {
  const asignacion = asignacionesDe(transaccionId).find(
    (item) => item.participacion === 'principal',
  )

  return asignacion ? referenciaDe(asignacion.run) : null
}

export function apoyoDe(transaccionId: number): AnalistaReferencia[] {
  return asignacionesDe(transaccionId)
    .filter((item) => item.participacion === 'apoyo')
    .map((item) => referenciaDe(item.run))
}

export function analistasDe(transaccionId: number): AnalistasTransaccion {
  const principal = principalDe(transaccionId)

  return {
    principal: principal === null ? null : { nombre: principal.nombre },
    apoyo: apoyoDe(transaccionId).map((analista) => ({ nombre: analista.nombre })),
  }
}

export function participacionDe(
  transaccionId: number,
  run: number | null,
): ParticipacionAnalista | null {
  if (run === null) {
    return null
  }

  return asignacionesDe(transaccionId).find((item) => item.run === run)?.participacion ?? null
}
