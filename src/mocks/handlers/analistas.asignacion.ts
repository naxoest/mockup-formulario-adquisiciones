import type {
  AsignacionAnalistas,
  ParticipacionAnalista,
} from '@/features/transacciones/types/transaccion.types'
import type { AsignacionAlmacenada } from '@/mocks/data/asignaciones.mock'
import type { Usuario } from '@/features/usuarios/types/usuario.types'
import { apoyoDe, principalDe } from '@/mocks/handlers/analistas.derivacion'
import {
  obtenerAsignaciones,
  reemplazarAsignaciones,
  registrarEvento,
  siguienteIdEvento,
} from '@/mocks/handlers/transacciones.estado'

export function asignacionDe(transaccionId: number): AsignacionAnalistas {
  return { principal: principalDe(transaccionId), apoyo: apoyoDe(transaccionId) }
}

function anotarCambio(transaccionId: number, titulo: string, autor: string, observacion = '') {
  registrarEvento(transaccionId, {
    clase: 'registro',
    id: siguienteIdEvento(),
    fecha: new Date().toISOString(),
    titulo,
    observacion,
    autor,
  })
}

function anotarCambios(
  transaccionId: number,
  anterior: AsignacionAnalistas,
  actual: AsignacionAnalistas,
  autor: string,
  observacion?: string,
) {
  if (anterior.principal?.run !== actual.principal?.run) {
    if (anterior.principal) {
      anotarCambio(
        transaccionId,
        `Terminó la asignación de ${anterior.principal.nombre} como analista principal`,
        autor,
        observacion,
      )
    }

    if (actual.principal) {
      anotarCambio(
        transaccionId,
        `${actual.principal.nombre} quedó como analista principal`,
        autor,
        observacion,
      )
    }
  }

  const runsAnteriores = new Set(anterior.apoyo.map((analista) => analista.run))
  const runsActuales = new Set(actual.apoyo.map((analista) => analista.run))

  for (const analista of anterior.apoyo) {
    if (!runsActuales.has(analista.run)) {
      anotarCambio(
        transaccionId,
        `Terminó la asignación de ${analista.nombre} como analista de apoyo`,
        autor,
        observacion,
      )
    }
  }

  for (const analista of actual.apoyo) {
    if (!runsAnteriores.has(analista.run)) {
      anotarCambio(
        transaccionId,
        `${analista.nombre} se sumó como analista de apoyo`,
        autor,
        observacion,
      )
    }
  }
}

export function reemplazarEquipo(
  transaccionId: number,
  nuevas: AsignacionAlmacenada[],
  autor: string,
  observacion?: string,
): AsignacionAnalistas {
  const anterior = asignacionDe(transaccionId)

  reemplazarAsignaciones(transaccionId, nuevas)

  const actual = asignacionDe(transaccionId)

  anotarCambios(transaccionId, anterior, actual, autor, observacion)

  return actual
}

export function terminarAsignacionesDe(run: number, autor: string, motivo: string): void {
  const afectadas = new Set(
    obtenerAsignaciones()
      .filter((asignacion) => asignacion.run === run)
      .map((asignacion) => asignacion.transaccionId),
  )

  for (const transaccionId of afectadas) {
    const restantes = obtenerAsignaciones().filter(
      (asignacion) => asignacion.transaccionId === transaccionId && asignacion.run !== run,
    )

    reemplazarEquipo(transaccionId, restantes, autor, motivo)
  }
}

export function contarAsignacionesDe(run: number): Record<ParticipacionAnalista, number> {
  const propias = obtenerAsignaciones().filter((asignacion) => asignacion.run === run)

  return {
    principal: propias.filter((asignacion) => asignacion.participacion === 'principal').length,
    apoyo: propias.filter((asignacion) => asignacion.participacion === 'apoyo').length,
  }
}

export function esAnalistaElegible(usuario: Usuario): boolean {
  return usuario.estaActivo && usuario.roles.some((rol) => rol.nombre === 'analista')
}
