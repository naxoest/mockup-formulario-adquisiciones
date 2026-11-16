import { ClipboardList, FileText } from 'lucide-react'
import { CeldaConteo } from './CeldaConteo'
import { CeldaEstado } from './CeldaEstado'
import { CeldaSedes } from './CeldaSedes'
import { CeldaUnidad } from './CeldaUnidad'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'
import type { SelectOption } from '@/types/select'

export function construirColumnasUnidades(
  catalogoSedes: SelectOption[],
): ColumnDef<UnidadSolicitante>[] {
  return [
    {
      field: 'nombre',
      header: 'Carrera o unidad',
      sortable: true,
      width: 'w-[30%] min-w-72',
      renderCell: (unidad) => <CeldaUnidad unidad={unidad} />,
    },
    {
      field: 'cr',
      header: 'CR',
      sortable: true,
      width: 'w-[10%] min-w-24',
      renderCell: (unidad) => (
        <span className="inline-flex px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-mercury-800">
          {unidad.cr}
        </span>
      ),
    },
    {
      field: 'sedes',
      header: 'Sedes',
      width: 'w-[28%] min-w-80',
      renderCell: (unidad) => <CeldaSedes sedes={unidad.sedes} catalogo={catalogoSedes} />,
    },
    {
      field: 'solicitudes',
      header: 'Solicitudes',
      sortable: true,
      width: 'w-[11%] min-w-28',
      renderCell: (unidad) => <CeldaConteo icono={FileText} valor={unidad.solicitudes} />,
    },
    {
      field: 'requerimientos',
      header: 'Requerimientos',
      sortable: true,
      width: 'w-[11%] min-w-32',
      renderCell: (unidad) => <CeldaConteo icono={ClipboardList} valor={unidad.requerimientos} />,
    },
    {
      field: 'activo',
      header: 'Estado',
      sortable: true,
      type: 'boolean',
      width: 'w-[10%] min-w-28',
      renderCell: (unidad) => <CeldaEstado activo={unidad.activo} />,
    },
  ]
}
