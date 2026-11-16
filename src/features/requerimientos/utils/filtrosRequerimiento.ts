import type {
  EstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'

const CLAVES_FILTRO = ['solicitante', 'estado', 'vigencia'] as const

export type ClaveFiltro = (typeof CLAVES_FILTRO)[number]

export type ValoresFiltro = Partial<Record<ClaveFiltro, string[]>>

export type Vigencia = 'vigente' | 'eliminado'

export interface ConteoEstados {
  total: number
  porEstado: Record<EstadoRequerimiento, number>
}

export const VALORES_FILTRO_INICIALES: ValoresFiltro = { vigencia: ['vigente'] }

export function esClaveFiltro(clave: string): clave is ClaveFiltro {
  return CLAVES_FILTRO.some((candidata) => candidata === clave)
}

function admite(seleccion: string[] | undefined, valor: string): boolean {
  return seleccion === undefined || seleccion.length === 0 || seleccion.includes(valor)
}

function vigenciaDe(requerimiento: Requerimiento): Vigencia {
  return requerimiento.eliminado ? 'eliminado' : 'vigente'
}

function admiteSolicitanteYVigencia(requerimiento: Requerimiento, valores: ValoresFiltro): boolean {
  return (
    admite(valores.solicitante, String(requerimiento.solicitante.id)) &&
    admite(valores.vigencia, vigenciaDe(requerimiento))
  )
}

export function filtrarRequerimientos(
  requerimientos: Requerimiento[],
  valores: ValoresFiltro,
): Requerimiento[] {
  return requerimientos.filter(
    (requerimiento) =>
      admiteSolicitanteYVigencia(requerimiento, valores) &&
      admite(valores.estado, requerimiento.estado.value),
  )
}

export function contarPorEstado(
  requerimientos: Requerimiento[],
  valores: ValoresFiltro,
): ConteoEstados {
  const porEstado: Record<EstadoRequerimiento, number> = {
    comprado: 0,
    en_bodega: 0,
    no_comprado: 0,
    entregado: 0,
    desestimado: 0,
  }

  const considerados = requerimientos.filter((requerimiento) =>
    admiteSolicitanteYVigencia(requerimiento, valores),
  )

  for (const requerimiento of considerados) {
    porEstado[requerimiento.estado.value] += 1
  }

  return { total: considerados.length, porEstado }
}
