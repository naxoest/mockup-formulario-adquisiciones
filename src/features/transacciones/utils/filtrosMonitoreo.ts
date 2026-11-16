import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'
import type { SelectOption } from '@/types/select'

export const CLAVES_FILTRO_MONITOREO = ['estado', 'criticidad', 'seguimiento', 'analista'] as const

export type ClaveFiltroMonitoreo = (typeof CLAVES_FILTRO_MONITOREO)[number]

export const VALOR_ESTADO_ABIERTO = 'abierto'
export const VALOR_ESTADO_CERRADO = 'cerrado'

type ExtractorFiltroMonitoreo = (fila: FilaMonitoreo) => string[]

const extractores: Record<ClaveFiltroMonitoreo, ExtractorFiltroMonitoreo> = {
  estado: (fila) => [fila.cerrado ? VALOR_ESTADO_CERRADO : VALOR_ESTADO_ABIERTO],
  criticidad: (fila) => (fila.evaluacion === null ? [] : [fila.evaluacion.nivel]),
  seguimiento: (fila) => [fila.nivelSeguimiento],
  analista: (fila) => (fila.analista === null ? [] : [String(fila.analista.run)]),
}

export function esClaveFiltroMonitoreo(clave: string): clave is ClaveFiltroMonitoreo {
  return (CLAVES_FILTRO_MONITOREO as readonly string[]).includes(clave)
}

export function extraerValores(clave: ClaveFiltroMonitoreo, fila: FilaMonitoreo): string[] {
  return extractores[clave](fila)
}

export function filtrarMonitoreo(
  filas: FilaMonitoreo[],
  valores: Record<string, string[]>,
): FilaMonitoreo[] {
  const activos = Object.entries(valores).filter(
    (entrada): entrada is [ClaveFiltroMonitoreo, string[]] =>
      esClaveFiltroMonitoreo(entrada[0]) && entrada[1].length > 0,
  )

  if (activos.length === 0) return filas

  return filas.filter((fila) =>
    activos.every(([clave, seleccionados]) =>
      extraerValores(clave, fila).some((valor) => seleccionados.includes(valor)),
    ),
  )
}

export function analistasDisponibles(filas: FilaMonitoreo[]): SelectOption[] {
  const nombresPorRun = new Map<number, string>()

  for (const fila of filas) {
    if (fila.analista !== null) nombresPorRun.set(fila.analista.run, fila.analista.nombre)
  }

  return [...nombresPorRun]
    .map(([run, nombre]) => ({ value: String(run), label: nombre }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es-CL'))
}
