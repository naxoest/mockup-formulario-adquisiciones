import type { FilterDefinition } from '@/components/ui/FilterBar'
import type { AnalistaReferencia } from '@/features/transacciones/types/transaccion.types'

export const CLAVES_FILTRO = ['tipo', 'modalidad', 'campus', 'criticidad', 'principal'] as const

export type ClaveFiltro = (typeof CLAVES_FILTRO)[number]

type FiltroTransaccion = FilterDefinition & { key: ClaveFiltro }

const VALOR_SIN_PRINCIPAL = 'sin_principal'

const filtrosBase: FiltroTransaccion[] = [
  {
    key: 'campus',
    label: 'Campus',
    type: 'multi',
    enableSelectAll: true,
    options: [
      { value: 'osorno', label: 'Osorno' },
      { value: 'pto', label: 'Puerto Montt' },
      { value: 'castro', label: 'Castro' },
    ],
  },
  {
    key: 'tipo',
    label: 'Tipo',
    type: 'multi',
    enableSelectAll: true,
    options: [
      { value: 'SABIENES', label: 'SABIENES' },
      { value: 'SASERVI', label: 'SASERVI' },
    ],
  },
  {
    key: 'modalidad',
    label: 'Modalidad',
    type: 'multi',
    enableSelectAll: true,
    options: [
      { value: 'agil', label: 'Compra ágil' },
      { value: 'privada', label: 'Licitación privada' },
      { value: 'publica', label: 'Licitación publica' },
      { value: 'directo', label: 'Trato directo' },
      { value: 'conveniosuministro', label: 'Convenio de suministro' },
      { value: 'conveniomarco', label: 'Convenio marco' },
    ],
  },
  {
    key: 'criticidad',
    label: 'Criticidad',
    type: 'multi',
    enableSelectAll: true,
    options: [
      { value: 'critico', label: 'Crítico' },
      { value: 'atencion', label: 'Atención' },
      { value: 'controlado', label: 'Controlado' },
      { value: 'sin_evaluar', label: 'Sin evaluar' },
    ],
  },
]

function filtroPrincipal(analistas: AnalistaReferencia[]): FiltroTransaccion {
  return {
    key: 'principal',
    label: 'Analista principal',
    type: 'multi',
    enableSelectAll: true,
    options: [
      { value: VALOR_SIN_PRINCIPAL, label: 'Sin principal' },
      ...analistas.map((analista) => ({ value: String(analista.run), label: analista.nombre })),
    ],
  }
}

export function construirFiltrosTransaccion(
  analistas: AnalistaReferencia[] | null,
): FiltroTransaccion[] {
  return analistas === null ? filtrosBase : [...filtrosBase, filtroPrincipal(analistas)]
}
