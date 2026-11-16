import type { PrecompromisoForm } from '@/features/transacciones/types/transaccion.types'
import { precompromisosCompletos } from '@/features/transacciones/utils/montos'

export type EstadoConciliacion =
  | 'ajustado'
  | 'bajoCotizacion'
  | 'sobreCotizacion'
  | 'sinComprometer'
  | 'sinCotizacion'
  | 'sinDatos'

export interface AporteOrden {
  indiceOrden: number
  monto: number
}

export interface ResultadoConciliacion {
  precomprometido: number | null
  comprometido: number
  diferencia: number | null
  estado: EstadoConciliacion
}

export interface ConciliacionAnual extends ResultadoConciliacion {
  anio: string | null
  aportes: AporteOrden[]
}

export interface ConciliacionSolicitud {
  claveFormulario: string
  anios: ConciliacionAnual[]
}

export interface ConciliacionTransaccion {
  porSolicitud: ConciliacionSolicitud[]
  precomprometidoTotal: number
  comprometidoTotal: number
  diferenciaTotal: number
  comprometidoSinSolicitud: number
}

interface SolicitanteConciliable {
  claveFormulario: string
  precompromisos?: PrecompromisoForm[] | null
}

interface MontoAnualConciliable {
  anio?: string | null
  monto?: number | null
}

interface LineaConciliable {
  claveFormulario: string
  montos?: MontoAnualConciliable[] | null
}

interface OrdenConciliable {
  solicitantes?: LineaConciliable[] | null
}

interface AcumuladoAnual {
  precomprometido: number | null
  comprometido: number
  aportes: AporteOrden[]
}

interface AcumuladoSolicitud {
  claveFormulario: string
  anios: Map<string, AcumuladoAnual>
}

function montoDe(valor: number | null | undefined): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : 0
}

function anualVacio(): AcumuladoAnual {
  return { precomprometido: null, comprometido: 0, aportes: [] }
}

function estadoDe(precomprometido: number | null, comprometido: number): EstadoConciliacion {
  if (precomprometido === null) {
    return comprometido > 0 ? 'sinCotizacion' : 'sinDatos'
  }
  if (comprometido === 0) {
    return 'sinComprometer'
  }
  if (comprometido === precomprometido) {
    return 'ajustado'
  }
  return comprometido < precomprometido ? 'bajoCotizacion' : 'sobreCotizacion'
}

function resultadoDe(precomprometido: number | null, comprometido: number): ResultadoConciliacion {
  return {
    precomprometido,
    comprometido,
    diferencia: precomprometido === null ? null : comprometido - precomprometido,
    estado: estadoDe(precomprometido, comprometido),
  }
}

function conciliarAnio(anio: string | null, acumulado: AcumuladoAnual): ConciliacionAnual {
  return {
    anio,
    ...resultadoDe(acumulado.precomprometido, acumulado.comprometido),
    aportes: acumulado.aportes,
  }
}

export function conciliarMontos(
  solicitantes: SolicitanteConciliable[] | null | undefined,
  ordenes: OrdenConciliable[] | null | undefined,
): ConciliacionTransaccion {
  const indice = new Map<string, AcumuladoSolicitud>()
  let precomprometidoTotal = 0

  for (const solicitante of solicitantes ?? []) {
    const clave = solicitante?.claveFormulario
    if (!clave || indice.has(clave)) {
      continue
    }

    const anios = new Map<string, AcumuladoAnual>()

    for (const precompromiso of precompromisosCompletos(solicitante.precompromisos)) {
      const anual = anios.get(precompromiso.anio) ?? anualVacio()
      anual.precomprometido = (anual.precomprometido ?? 0) + precompromiso.monto
      anios.set(precompromiso.anio, anual)
      precomprometidoTotal += precompromiso.monto
    }

    indice.set(clave, { claveFormulario: clave, anios })
  }

  let comprometidoSinSolicitud = 0
  const listaOrdenes = ordenes ?? []

  for (let indiceOrden = 0; indiceOrden < listaOrdenes.length; indiceOrden += 1) {
    for (const linea of listaOrdenes[indiceOrden]?.solicitantes ?? []) {
      const acumulado = linea?.claveFormulario ? indice.get(linea.claveFormulario) : undefined

      for (const fila of linea?.montos ?? []) {
        const monto = montoDe(fila?.monto)

        if (!acumulado) {
          comprometidoSinSolicitud += monto
          continue
        }

        const anio = fila?.anio

        if (typeof anio !== 'string' || anio.length === 0) {
          continue
        }

        const anual = acumulado.anios.get(anio) ?? anualVacio()
        anual.comprometido += monto

        const aporte = anual.aportes.find((item) => item.indiceOrden === indiceOrden)
        if (aporte) {
          aporte.monto += monto
        } else {
          anual.aportes.push({ indiceOrden, monto })
        }

        acumulado.anios.set(anio, anual)
      }
    }
  }

  const porSolicitud: ConciliacionSolicitud[] = [...indice.values()].map((acumulado) => ({
    claveFormulario: acumulado.claveFormulario,
    anios:
      acumulado.anios.size === 0
        ? [conciliarAnio(null, anualVacio())]
        : [...acumulado.anios.entries()]
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([anio, anual]) => conciliarAnio(anio, anual)),
  }))

  const comprometidoTotal =
    porSolicitud.reduce(
      (total, solicitud) =>
        total + solicitud.anios.reduce((suma, anual) => suma + anual.comprometido, 0),
      0,
    ) + comprometidoSinSolicitud

  return {
    porSolicitud,
    precomprometidoTotal,
    comprometidoTotal,
    diferenciaTotal: comprometidoTotal - precomprometidoTotal,
    comprometidoSinSolicitud,
  }
}

export function totalDeSolicitud(fila: ConciliacionSolicitud): ResultadoConciliacion {
  let precomprometido: number | null = null
  let comprometido = 0

  for (const anual of fila.anios) {
    if (anual.precomprometido !== null) {
      precomprometido = (precomprometido ?? 0) + anual.precomprometido
    }
    comprometido += anual.comprometido
  }

  return resultadoDe(precomprometido, comprometido)
}

export interface ProporcionesBarra {
  otrasOrdenes: number
  estaOrden: number
  exceso: number
}

const barraVacia: ProporcionesBarra = { otrasOrdenes: 0, estaOrden: 0, exceso: 0 }

export function proporcionesDeBarra(
  precomprometido: number | null,
  comprometido: number,
  aporte?: number,
): ProporcionesBarra {
  if (precomprometido === null) {
    return barraVacia
  }

  const escala = Math.max(comprometido, precomprometido)

  if (escala <= 0) {
    return barraVacia
  }

  const dentro = Math.max(Math.min(comprometido, precomprometido), 0)
  const exceso = Math.max(comprometido - precomprometido, 0)

  const hayAporte = typeof aporte === 'number' && Number.isFinite(aporte)
  const aporteAcotado = hayAporte ? Math.min(Math.max(aporte, 0), Math.max(comprometido, 0)) : 0
  const otras = hayAporte ? Math.min(Math.max(comprometido - aporteAcotado, 0), dentro) : 0

  return {
    otrasOrdenes: (otras / escala) * 100,
    estaOrden: ((dentro - otras) / escala) * 100,
    exceso: (exceso / escala) * 100,
  }
}
