import { FileText } from 'lucide-react'
import type { ColumnDef } from '@/components/ui/DataTable'
import { CeldaConteo } from '@/features/mantenedor/components/UnidadesTable/CeldaConteo'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'
import { CeldaEstadoProyecto } from './CeldaEstadoProyecto'
import { CeldaProyecto } from './CeldaProyecto'

export function construirColumnasProyectos(): ColumnDef<Proyecto>[] {
  return [
    {
      field: 'nombre',
      header: 'Nombre del proyecto',
      sortable: true,
      width: 'w-[50%] min-w-72',
      renderCell: (proyecto) => <CeldaProyecto proyecto={proyecto} />,
    },
    {
      field: 'cr',
      header: 'CR',
      sortable: true,
      width: 'w-[15%] min-w-24',
      renderCell: (proyecto) => (
        <span className="inline-flex px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-mercury-800">
          {proyecto.cr}
        </span>
      ),
    },
    {
      field: 'solicitudes',
      header: 'Solicitudes',
      sortable: true,
      width: 'w-[15%] min-w-28',
      renderCell: (proyecto) => <CeldaConteo icono={FileText} valor={proyecto.solicitudes} />,
    },
    {
      field: 'activo',
      header: 'Estado',
      sortable: true,
      type: 'boolean',
      width: 'w-[20%] min-w-28',
      renderCell: (proyecto) => <CeldaEstadoProyecto activo={proyecto.activo} />,
    },
  ]
}
