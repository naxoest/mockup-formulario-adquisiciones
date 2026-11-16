import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { ClaveFiltroRanking } from '@/features/analisis/utils/filtrosRankingUnidades'

export type FiltroRanking = FilterDefinition & { key: ClaveFiltroRanking }

export function construirFiltrosRankingUnidades(anioEnCurso?: number): FiltroRanking[] {
  return [
    {
      key: 'campus',
      label: 'Sede',
      type: 'multi',
      enableSelectAll: true,
      options: [
        { value: 'osorno', label: 'Osorno' },
        { value: 'pto', label: 'Puerto Montt' },
        { value: 'castro', label: 'Castro' },
      ],
    },
    {
      key: 'periodo',
      label: 'Periodo',
      type: 'dateRange',
      minDate: anioEnCurso !== undefined ? new Date(anioEnCurso, 0, 1) : undefined,
      maxDate: anioEnCurso !== undefined ? new Date(anioEnCurso, 11, 31) : undefined,
    },
  ]
}
