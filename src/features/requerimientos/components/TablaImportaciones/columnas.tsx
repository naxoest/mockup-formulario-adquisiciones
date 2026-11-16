import { FileSpreadsheet } from 'lucide-react'
import type { ColumnDef } from '@/components/ui/DataTable'
import { Instante } from '@/features/requerimientos/components/Valores'
import type { Importacion } from '@/features/requerimientos/types/importacion.types'
import { formatearSolicitante } from '@/features/requerimientos/utils/formato'
import { CeldaConteo } from './CeldaConteo'
import { InsigniaEstadoImportacion } from './InsigniaEstadoImportacion'

export const columnasImportacion: ColumnDef<Importacion>[] = [
  {
    field: 'id',
    header: 'N°',
    sortable: true,
    width: 'w-16',
    renderCell: (fila) => (
      <span className="block text-right text-xs tabular-nums text-mercury-600">#{fila.id}</span>
    ),
  },
  {
    field: 'fecha',
    header: 'Fecha',
    sortable: true,
    renderCell: (fila) => <Instante valor={fila.fecha} />,
  },
  {
    field: 'autor',
    header: 'Usuario',
    sortable: true,
  },
  {
    field: 'solicitante',
    header: 'Solicitante',
    renderCell: (fila) => (
      <span className="whitespace-nowrap">{formatearSolicitante(fila.solicitante)}</span>
    ),
  },
  {
    field: 'nombreArchivo',
    header: 'Archivo',
    sortable: true,
    renderCell: (fila) => (
      <span className="inline-flex items-center gap-1.5">
        <FileSpreadsheet aria-hidden="true" className="size-4 shrink-0 text-jade-700" />
        <span className="break-all min-w-36">{fila.nombreArchivo}</span>
      </span>
    ),
  },
  {
    field: 'estado',
    header: 'Estado',
    width: 'w-36',
    renderCell: (fila) => <InsigniaEstadoImportacion estado={fila.estado} />,
  },
  {
    field: 'filasNuevas',
    header: 'Nuevas',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.filasNuevas} />,
  },
  {
    field: 'filasRestauradas',
    header: 'Restauradas',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.filasRestauradas} />,
  },
  {
    field: 'filasConCambios',
    header: 'Con cambios',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.filasConCambios} />,
  },
  {
    field: 'filasSinCambios',
    header: 'Sin cambios',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.filasSinCambios} />,
  },
  {
    field: 'filasConErrores',
    header: 'Con errores',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.filasConErrores} />,
  },
  {
    field: 'requerimientosEliminados',
    header: 'Eliminados',
    sortable: true,
    renderCell: (fila) => <CeldaConteo valor={fila.requerimientosEliminados} />,
  },
]
