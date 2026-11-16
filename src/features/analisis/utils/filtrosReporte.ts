import type { BusquedaAdquisiciones, FiltrosReporte } from '@/features/analisis/types/reporte.types'

export function busquedaAFiltros(busqueda: BusquedaAdquisiciones): FiltrosReporte {
  return {
    desde: busqueda.desde ?? null,
    hasta: busqueda.hasta ?? null,
    titulo: busqueda.titulo ?? null,
    etiquetaPeriodo: busqueda.etiquetaPeriodo ?? null,
  }
}

export function filtrosABusqueda(filtros: FiltrosReporte): BusquedaAdquisiciones {
  return {
    desde: filtros.desde ?? undefined,
    hasta: filtros.hasta ?? undefined,
    titulo: filtros.titulo ?? undefined,
    etiquetaPeriodo: filtros.etiquetaPeriodo ?? undefined,
  }
}
