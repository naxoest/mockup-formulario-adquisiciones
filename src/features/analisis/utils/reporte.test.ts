import { busquedaAFiltros, filtrosABusqueda } from '@/features/analisis/utils/filtrosReporte'

describe('busquedaAFiltros', () => {
  it('devuelve todo nulo sin busqueda', () => {
    expect(busquedaAFiltros({})).toEqual({
      desde: null,
      hasta: null,
      titulo: null,
      etiquetaPeriodo: null,
    })
  })

  it('traslada los valores presentes', () => {
    const filtros = busquedaAFiltros({ desde: '2026-01-01', titulo: 'Reporte' })

    expect(filtros.desde).toBe('2026-01-01')
    expect(filtros.titulo).toBe('Reporte')
    expect(filtros.hasta).toBeNull()
  })
})

describe('filtrosABusqueda', () => {
  it('omite los valores nulos', () => {
    const busqueda = filtrosABusqueda({
      desde: '2026-01-01',
      hasta: null,
      titulo: null,
      etiquetaPeriodo: null,
    })

    expect(busqueda).toEqual({
      desde: '2026-01-01',
      hasta: undefined,
      titulo: undefined,
      etiquetaPeriodo: undefined,
    })
  })

  it('es inverso de busquedaAFiltros', () => {
    const original = {
      desde: '2026-01-01',
      hasta: '2026-08-19',
      titulo: 'R',
      etiquetaPeriodo: 'ago',
    }

    expect(busquedaAFiltros(filtrosABusqueda(busquedaAFiltros(original)))).toEqual(
      busquedaAFiltros(original),
    )
  })
})
