import type { AsignacionAnalistas } from '@/features/transacciones/types/transaccion.types'
import type { AsignacionAnalistasRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { AsignacionAnalistasValues } from '@/features/transacciones/schemas/asignacionAnalistas.schema'

type CampoAsignacion = keyof AsignacionAnalistasValues

export function valoresIniciales(asignacion: AsignacionAnalistas): AsignacionAnalistasValues {
  return {
    principal: asignacion.principal === null ? '' : String(asignacion.principal.run),
    apoyo: asignacion.apoyo.map((analista) => String(analista.run)),
    observacion: '',
  }
}

export function aPeticion(valores: AsignacionAnalistasValues): AsignacionAnalistasRequest {
  const observacion = valores.observacion.trim()

  return {
    principal: valores.principal === '' ? null : Number(valores.principal),
    apoyo: valores.apoyo.map(Number),
    ...(observacion.length > 0 ? { observacion } : {}),
  }
}

export function campoDelError(campo: string): CampoAsignacion | null {
  if (campo === 'principal' || campo === 'observacion') return campo
  if (campo === 'apoyo' || campo.startsWith('apoyo.')) return 'apoyo'
  return null
}
