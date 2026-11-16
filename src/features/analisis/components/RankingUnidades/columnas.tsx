import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { FilaRankingUnidad } from '@/features/analisis/types/rankingUnidades.types'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'

export const varianteCampus: Record<string, BadgeVariant> = {
  osorno: 'info',
  pto: 'success',
  castro: 'warning',
}

const varianteModalidad: Record<string, BadgeVariant> = {
  directo: 'warning',
  agil: 'info',
  publica: 'success',
  conveniomarco: 'neutral',
}

function colorCompletitud(valor: number): string {
  if (valor >= 80) return 'bg-jade-500'
  if (valor >= 50) return 'bg-saffron-500'
  return 'bg-scarlet-500'
}

export const columnasRankingUnidades: ColumnDef<FilaRankingUnidad>[] = [
  {
    field: 'posicion',
    header: 'Posición',
    sortable: false,
    width: 'w-16',
    renderCell: (fila) => (
      <Badge variant="neutral" size="md">
        #{fila.posicion}
      </Badge>
    ),
  },
  {
    field: 'nombre',
    header: 'Carrera / Unidad',
    sortable: true,
    renderCell: (fila) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sm">{fila.nombre}</span>
        <span className="text-xs text-mercury-500">CR {fila.cr}</span>
      </div>
    ),
  },
  {
    field: 'campus',
    header: 'Campus',
    sortable: true,
    renderCell: (fila) => (
      <div className="flex flex-wrap gap-1">
        {fila.sedes.map((sede) => (
          <Badge key={sede.value} variant={varianteCampus[sede.value] ?? 'neutral'} size="sm">
            {sede.label}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    field: 'comprometido',
    header: 'Monto Total OC',
    sortable: true,
    renderCell: (fila) => (
      <span className="font-mono text-sm tabular-nums">{formatCLP(fila.comprometido)}</span>
    ),
  },
  {
    field: 'ocValidas',
    header: 'OC Válidas',
    sortable: true,
    renderCell: (fila) => (
      <div className="flex items-center gap-1">
        <span className="w-10 text-sm font-medium">
          {fila.ocValidas}/{fila.ocTotal}
        </span>
        <div className="w-12 h-1 rounded-full bg-mercury-200">
          <div
            className={cn('h-1 rounded-full', colorCompletitud(fila.completitud))}
            style={{ width: `${fila.completitud}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    field: 'participacion',
    header: '% Global',
    sortable: true,
    renderCell: (fila) => (
      <div className="flex flex-col gap-1 min-w-20">
        <span className="text-sm tabular-nums">{fila.participacion.toFixed(1)}%</span>
        <div className="h-1 w-full rounded-full bg-mercury-200">
          <div
            className="h-1 rounded-full bg-primary-500"
            style={{ width: `${fila.participacion}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    field: 'modalidades',
    header: 'Modalidad',
    sortable: false,
    renderCell: (fila) => (
      <div className="flex flex-wrap gap-1">
        {fila.modalidades.map((modalidad) => (
          <Badge
            key={modalidad.value}
            variant={varianteModalidad[modalidad.value] ?? 'neutral'}
            size="sm"
          >
            {modalidad.label}
          </Badge>
        ))}
      </div>
    ),
  },
]
