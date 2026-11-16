import type { ColumnDef } from '@/components/ui/DataTable'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'
import {
  formatearIndice,
  IndicadorCriticidad,
} from '@/features/transacciones/components/IndicadorCriticidad'
import { CeldaProceso } from './CeldaProceso'
import { CeldaProximaRevision } from './CeldaProximaRevision'
import { CeldaUltimaGestion } from './CeldaUltimaGestion'

export const columnasMonitoreo: ColumnDef<FilaMonitoreo>[] = [
  {
    field: 'nombre',
    header: 'Proceso',
    sortable: true,
    renderCell: (fila) => <CeldaProceso fila={fila} />,
    getSearchText: (fila) => `${fila.nombre} ${fila.transaccionId}`,
  },
  {
    field: 'nombreAnalista',
    header: 'Analista',
    sortable: true,
    width: 'w-40',
    renderCell: (fila) =>
      fila.nombreAnalista === null ? (
        <span className="text-sm text-mercury-400">—</span>
      ) : (
        <span className="text-sm text-mercury-700">{fila.nombreAnalista}</span>
      ),
  },
  {
    field: 'indice',
    header: 'Criticidad',
    sortable: true,
    width: 'w-36',
    renderCell: (fila) => <IndicadorCriticidad criticidad={fila.evaluacion} />,
    getSearchText: (fila) =>
      fila.evaluacion === null ? '' : formatearIndice(fila.evaluacion.indice),
  },
  {
    field: 'diasSinGestion',
    header: 'Última gestión',
    sortable: true,
    width: 'w-36',
    renderCell: (fila) => <CeldaUltimaGestion fila={fila} />,
  },
  {
    field: 'diasHastaRevision',
    header: 'Próxima revisión',
    sortable: true,
    width: 'w-36',
    renderCell: (fila) => <CeldaProximaRevision fila={fila} />,
  },
  {
    field: 'etiquetaBloqueador',
    header: 'Bloqueo',
    sortable: true,
    width: 'w-40',
    renderCell: (fila) =>
      fila.etiquetaBloqueador === null ? (
        <span className="text-sm text-mercury-400">—</span>
      ) : (
        <span className="text-sm text-mercury-700">{fila.etiquetaBloqueador}</span>
      ),
  },
]
