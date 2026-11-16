import { describe, expect, it } from 'vitest'
import {
  acotarFiltrosAlAnio,
  aplicarCambioFiltro,
  busquedaAFiltros,
  construirFilasRanking,
  construirParametrosRanking,
  filtrosABusqueda,
  filtrosAValores,
} from '@/features/analisis/utils/filtrosRankingUnidades'
import { construirFiltrosRankingUnidades } from '@/features/analisis/components/RankingUnidades'
import type { FiltrosRankingUnidades } from '@/features/analisis/types/rankingUnidades.types'

const SIN_FILTROS: FiltrosRankingUnidades = { campus: [], desde: null, hasta: null }

describe('busquedaAFiltros', () => {
  it('normaliza la busqueda vacia', () => {
    expect(busquedaAFiltros({})).toEqual(SIN_FILTROS)
  })

  it('conserva campus y fechas', () => {
    expect(busquedaAFiltros({ campus: ['pto'], desde: '2026-03-01', hasta: '2026-04-30' })).toEqual(
      { campus: ['pto'], desde: '2026-03-01', hasta: '2026-04-30' },
    )
  })
})

describe('filtrosABusqueda', () => {
  it('omite los filtros vacios', () => {
    expect(filtrosABusqueda(SIN_FILTROS)).toEqual({
      campus: undefined,
      desde: undefined,
      hasta: undefined,
    })
  })
})

describe('filtrosAValores', () => {
  it('entrega un periodo vacio cuando no hay fechas', () => {
    expect(filtrosAValores(SIN_FILTROS)).toEqual({ campus: [], periodo: [] })
  })

  it('completa con cadena vacia el extremo ausente del periodo', () => {
    expect(filtrosAValores({ campus: [], desde: null, hasta: '2026-05-01' }).periodo).toEqual([
      '',
      '2026-05-01',
    ])
  })
})

describe('aplicarCambioFiltro', () => {
  it('reemplaza los campus seleccionados', () => {
    expect(aplicarCambioFiltro(SIN_FILTROS, 'campus', ['osorno']).campus).toEqual(['osorno'])
  })

  it('interpreta la cadena vacia del periodo como ausencia de fecha', () => {
    expect(aplicarCambioFiltro(SIN_FILTROS, 'periodo', ['', '2026-05-01'])).toEqual({
      campus: [],
      desde: null,
      hasta: '2026-05-01',
    })
  })

  it('ignora claves desconocidas', () => {
    expect(aplicarCambioFiltro(SIN_FILTROS, 'otra', ['x'])).toBe(SIN_FILTROS)
  })
})

describe('construirParametrosRanking', () => {
  it('repite el campus y agrega el limite', () => {
    expect(
      construirParametrosRanking(
        { campus: ['osorno', 'pto'], desde: '2026-01-01', hasta: null },
        4,
      ),
    ).toBe('?campus=osorno&campus=pto&desde=2026-01-01&limite=4')
  })
})

describe('construirFilasRanking', () => {
  it('aplana el resumen y calcula la proporcion de ordenes validas', () => {
    const [fila] = construirFilasRanking([
      {
        posicion: 1,
        unidad: {
          id: 1,
          nombre: 'Campos Clinicos',
          cr: 105,
          tipo: { value: 'carrera', label: 'Carrera' },
          sedes: [{ value: 'osorno', label: 'Osorno' }],
        },
        comprometido: 2340000,
        participacion: 10,
        ordenes: { validas: 3, total: 4 },
        modalidades: [{ value: 'agil', label: 'Compra Ágil' }],
      },
    ])

    expect(fila).toEqual({
      id: 1,
      posicion: 1,
      nombre: 'Campos Clinicos',
      cr: 105,
      campus: 'Osorno',
      sedes: [{ value: 'osorno', label: 'Osorno' }],
      comprometido: 2340000,
      participacion: 10,
      ocValidas: 3,
      ocTotal: 4,
      completitud: 75,
      modalidades: [{ value: 'agil', label: 'Compra Ágil' }],
    })
  })
})

describe('acotarFiltrosAlAnio', () => {
  it('asigna el año completo si no hay fechas definidas', () => {
    expect(acotarFiltrosAlAnio(SIN_FILTROS, 2026)).toEqual({
      campus: [],
      desde: '2026-01-01',
      hasta: '2026-12-31',
    })
  })

  it('completa el extremo ausente con el límite del año correspondiente', () => {
    expect(
      acotarFiltrosAlAnio({ campus: ['pto'], desde: '2026-04-15', hasta: null }, 2026),
    ).toEqual({
      campus: ['pto'],
      desde: '2026-04-15',
      hasta: '2026-12-31',
    })

    expect(acotarFiltrosAlAnio({ campus: [], desde: null, hasta: '2026-08-31' }, 2026)).toEqual({
      campus: [],
      desde: '2026-01-01',
      hasta: '2026-08-31',
    })
  })

  it('limita fechas que caen fuera de los límites del año en curso', () => {
    expect(
      acotarFiltrosAlAnio({ campus: [], desde: '2025-10-01', hasta: '2027-02-01' }, 2026),
    ).toEqual({
      campus: [],
      desde: '2026-01-01',
      hasta: '2026-12-31',
    })
  })

  it('respeta un rango dentro de un año diferente a 2026', () => {
    expect(
      acotarFiltrosAlAnio({ campus: [], desde: '2025-03-01', hasta: '2025-06-30' }, 2025),
    ).toEqual({
      campus: [],
      desde: '2025-03-01',
      hasta: '2025-06-30',
    })
  })
})

describe('construirFiltrosRankingUnidades', () => {
  it('establece minDate y maxDate según el año en curso proporcionado', () => {
    const filtros = construirFiltrosRankingUnidades(2027)
    const filtroPeriodo = filtros.find((f) => f.key === 'periodo') as Extract<
      (typeof filtros)[number],
      { type: 'dateRange' }
    >

    expect(filtroPeriodo.type).toBe('dateRange')
    expect(filtroPeriodo.minDate).toEqual(new Date(2027, 0, 1))
    expect(filtroPeriodo.maxDate).toEqual(new Date(2027, 11, 31))
  })

  it('deja minDate y maxDate indefinidos si no se especifica año en curso', () => {
    const filtros = construirFiltrosRankingUnidades(undefined)
    const filtroPeriodo = filtros.find((f) => f.key === 'periodo') as Extract<
      (typeof filtros)[number],
      { type: 'dateRange' }
    >

    expect(filtroPeriodo.type).toBe('dateRange')
    expect(filtroPeriodo.minDate).toBeUndefined()
    expect(filtroPeriodo.maxDate).toBeUndefined()
  })
})
