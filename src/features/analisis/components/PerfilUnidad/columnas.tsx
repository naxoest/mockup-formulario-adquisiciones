import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { FilaDetalleUnidad } from '@/features/analisis/types/perfilUnidad.types'
import { partesFecha } from '@/features/analisis/utils/perfilUnidad'
import { formatCLP } from '@/utils/currency'

const varianteTipo: Record<string, BadgeVariant> = {
  SASERVI: 'info',
  SABIENES: 'neutral',
}

const varianteEstado: Record<string, BadgeVariant> = {
  enviada: 'neutral',
  asignado: 'info',
  en_proceso: 'info',
  completada: 'success',
  rechazada: 'error',
}

export const columnasDetalleUnidad: ColumnDef<FilaDetalleUnidad>[] = [
  {
    field: 'transaccionId',
    header: '#',
    sortable: true,
    width: 'w-16',
    renderCell: (fila) => <span className="text-mercury-500">#{fila.transaccionId}</span>,
  },
  {
    field: 'fecha',
    header: 'Fecha',
    sortable: true,
    renderCell: (fila) => {
      const partes = partesFecha(fila.fecha)
      return (
        <div className="flex flex-col">
          <span className="text-xs text-mercury-500">{partes.diaSemana}</span>
          <span>{partes.fecha}</span>
        </div>
      )
    },
  },
  {
    field: 'tipo',
    header: 'Tipo',
    sortable: true,
    renderCell: (fila) => (
      <Badge variant={varianteTipo[fila.tipoCodigo] ?? 'neutral'} size="sm">
        {fila.tipo}
      </Badge>
    ),
  },
  { field: 'modalidad', header: 'Modalidad', sortable: true },
  {
    field: 'ordenDeCompra',
    header: 'N° OC',
    sortable: true,
    renderCell: (fila) => (
      <div className="flex flex-wrap items-center gap-1">
        <span>{fila.ordenDeCompra}</span>
        {fila.ordenCancelada && (
          <Badge variant="error" size="sm">
            Cancelada
          </Badge>
        )}
      </div>
    ),
  },
  {
    field: 'monto',
    header: 'Monto OC',
    sortable: true,
    renderCell: (fila) => <span className="tabular-nums">{formatCLP(fila.monto)}</span>,
  },
  {
    field: 'estado',
    header: 'Estado',
    sortable: false,
    renderCell: (fila) =>
      fila.estado === null || fila.estadoCodigo === null ? (
        <span className="text-mercury-400">Sin información</span>
      ) : (
        <Badge variant={varianteEstado[fila.estadoCodigo] ?? 'neutral'} size="sm">
          {fila.estado}
        </Badge>
      ),
  },
  {
    field: 'evaluacion',
    header: 'Evaluada',
    sortable: false,
    renderCell: (fila) =>
      fila.evaluacion ?? <span className="text-mercury-400">Sin información</span>,
  },
  {
    field: 'observaciones',
    header: 'Observaciones',
    sortable: false,
    renderCell: (fila) =>
      fila.observaciones ?? <span className="text-mercury-400">Sin observaciones</span>,
  },
]
