import type { RegistroPasoValues } from '@/features/transacciones/schemas/registroPaso.schema'
import type { RegistrarPasoRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'
import type {
  ProcesoAdquisicion,
  Transaccion,
} from '@/features/transacciones/types/transaccion.types'
import { toCivilDate } from '@/utils/date'

type CampoDelPaso = 'fecha' | 'observacion'

const CAMPOS_DEL_PASO: readonly CampoDelPaso[] = ['fecha', 'observacion']

export function hayPasoPendiente(transaccion: Transaccion | null): boolean {
  return (
    transaccion !== null &&
    transaccion.proceso.motivoBloqueo === null &&
    transaccion.proceso.siguientesPermitidos.length > 0
  )
}

export function valoresInicialesPaso(proceso: ProcesoAdquisicion | null): RegistroPasoValues {
  const siguientes = proceso?.siguientesPermitidos ?? []

  return {
    paso: siguientes.length === 1 ? siguientes[0].paso : '',
    fecha: null,
    observacion: '',
  }
}

export function aRegistroPaso(valores: RegistroPasoValues): RegistrarPasoRequest {
  if (valores.fecha === null) {
    throw new Error('La fecha del hecho es obligatoria')
  }

  const observacion = valores.observacion.trim()

  return {
    paso: valores.paso,
    fecha: toCivilDate(valores.fecha),
    observacion: observacion.length > 0 ? observacion : null,
  }
}

export function esCampoDelPaso(campo: unknown): campo is CampoDelPaso {
  return CAMPOS_DEL_PASO.some((item) => item === campo)
}
