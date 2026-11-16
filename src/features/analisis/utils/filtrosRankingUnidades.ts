import type {
  BusquedaRankingUnidades,
  FilaRankingUnidad,
  FiltrosRankingUnidades,
  ResumenRankingUnidad,
} from '@/features/analisis/types/rankingUnidades.types'

export const LIMITE_RANKING_UNIDADES = 4

export const CLAVES_FILTRO_RANKING = ['campus', 'periodo'] as const

export type ClaveFiltroRanking = (typeof CLAVES_FILTRO_RANKING)[number]

function fechaOAusente(valor: string | undefined): string | null {
  return valor !== undefined && valor.length > 0 ? valor : null
}

export function busquedaAFiltros(busqueda: BusquedaRankingUnidades): FiltrosRankingUnidades {
  return {
    campus: busqueda.campus ?? [],
    desde: busqueda.desde ?? null,
    hasta: busqueda.hasta ?? null,
  }
}

export function filtrosABusqueda(filtros: FiltrosRankingUnidades): BusquedaRankingUnidades {
  return {
    campus: filtros.campus.length > 0 ? filtros.campus : undefined,
    desde: filtros.desde ?? undefined,
    hasta: filtros.hasta ?? undefined,
  }
}

export function filtrosAValores(filtros: FiltrosRankingUnidades): Record<string, string[]> {
  return {
    campus: filtros.campus,
    periodo:
      filtros.desde === null && filtros.hasta === null
        ? []
        : [filtros.desde ?? '', filtros.hasta ?? ''],
  }
}

export function aplicarCambioFiltro(
  filtros: FiltrosRankingUnidades,
  clave: string,
  valores: string[],
): FiltrosRankingUnidades {
  switch (clave) {
    case 'campus':
      return { ...filtros, campus: valores }
    case 'periodo':
      return { ...filtros, desde: fechaOAusente(valores[0]), hasta: fechaOAusente(valores[1]) }
    default:
      return filtros
  }
}

export function construirParametrosRanking(
  filtros: FiltrosRankingUnidades,
  limite: number,
): string {
  const parametros = new URLSearchParams()

  for (const campus of filtros.campus) {
    parametros.append('campus', campus)
  }

  if (filtros.desde) parametros.set('desde', filtros.desde)
  if (filtros.hasta) parametros.set('hasta', filtros.hasta)

  parametros.set('limite', String(limite))

  return `?${parametros.toString()}`
}

export function construirFilasRanking(resumenes: ResumenRankingUnidad[]): FilaRankingUnidad[] {
  return resumenes.map((resumen) => ({
    id: resumen.unidad.id,
    posicion: resumen.posicion,
    nombre: resumen.unidad.nombre,
    cr: resumen.unidad.cr,
    campus: resumen.unidad.sedes.map((sede) => sede.label).join(', '),
    sedes: resumen.unidad.sedes,
    comprometido: resumen.comprometido,
    participacion: resumen.participacion,
    ocValidas: resumen.ordenes.validas,
    ocTotal: resumen.ordenes.total,
    completitud:
      resumen.ordenes.total > 0 ? (resumen.ordenes.validas / resumen.ordenes.total) * 100 : 0,
    modalidades: resumen.modalidades,
  }))
}

export function acotarFiltrosAlAnio(
  filtros: FiltrosRankingUnidades,
  anio: number,
): FiltrosRankingUnidades {
  const inicioAnio = `${anio}-01-01`
  const finAnio = `${anio}-12-31`

  let desde = filtros.desde ?? inicioAnio
  let hasta = filtros.hasta ?? finAnio

  if (desde < inicioAnio) desde = inicioAnio
  if (desde > finAnio) desde = finAnio
  if (hasta > finAnio) hasta = finAnio
  if (hasta < inicioAnio) hasta = inicioAnio

  return {
    ...filtros,
    desde,
    hasta,
  }
}
