import type { ColumnDef } from '@/components/ui/DataTable'
import { InsigniaEstadoRequerimiento } from '@/features/requerimientos/components/InsigniaEstadoRequerimiento'
import { InsigniaVigencia } from '@/features/requerimientos/components/InsigniaVigencia'
import {
  EnlaceCarpeta,
  FechaCivil,
  Instante,
  SinDato,
} from '@/features/requerimientos/components/Valores'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import {
  formatearCantidad,
  formatearSedes,
  formatearSolicitante,
} from '@/features/requerimientos/utils/formato'
import { ETIQUETA_IDENTIFICADOR } from '@/features/requerimientos/utils/trazabilidad'

export const columnasRequerimiento: ColumnDef<Requerimiento>[] = [
  {
    field: 'id',
    header: '#',
    sortable: true,
    width: 'w-12',
    renderCell: (fila) => (
      <span className="block text-right text-xs tabular-nums text-mercury-600">#{fila.id}</span>
    ),
  },
  {
    field: 'solicitante',
    header: 'Solicitante',
    getSearchText: (fila) => formatearSolicitante(fila.solicitante),
    renderCell: (fila) => (
      <span className="flex flex-col">
        <span className="whitespace-nowrap text-mercury-900">{fila.solicitante.nombre}</span>
        <span className="text-xs text-mercury-600">{formatearSedes(fila.solicitante.sedes)}</span>
      </span>
    ),
  },
  {
    field: 'identificador',
    header: ETIQUETA_IDENTIFICADOR,
    renderCell: (fila) => (
      <span translate="no" className="font-mono text-xs">
        {fila.identificador}
      </span>
    ),
  },
  {
    field: 'materiales',
    header: 'Materiales',
    sortable: true,
    renderCell: (fila) => <span className="font-medium text-mercury-900">{fila.materiales}</span>,
  },
  {
    field: 'cantidad',
    header: 'Cantidad',
    sortable: true,
    renderCell: (fila) => (
      <span className="block text-right tabular-nums">{formatearCantidad(fila.cantidad)}</span>
    ),
  },
  {
    field: 'estado',
    header: 'Estado',
    width: 'w-40',
    getSearchText: (fila) => fila.estado.label,
    renderCell: (fila) => (
      <span className="flex flex-col items-start gap-1">
        <InsigniaEstadoRequerimiento estado={fila.estado} />
        {fila.eliminado && <InsigniaVigencia eliminado />}
      </span>
    ),
  },
  {
    field: 'modalidad',
    header: 'Mecanismo de compra',
    getSearchText: (fila) => fila.modalidad?.label ?? '',
    renderCell: (fila) =>
      fila.modalidad === null ? (
        <SinDato />
      ) : (
        <span className="whitespace-nowrap">{fila.modalidad.label}</span>
      ),
  },
  {
    field: 'ordenDeCompra',
    header: 'Orden de compra',
    renderCell: (fila) =>
      fila.ordenDeCompra === null ? (
        <SinDato />
      ) : (
        <span translate="no" className="font-mono text-xs">
          {fila.ordenDeCompra}
        </span>
      ),
  },
  {
    field: 'fechaMaximaLlegada',
    header: 'Fecha máx. de llegada',
    renderCell: (fila) => <FechaCivil valor={fila.fechaMaximaLlegada} />,
  },
  {
    field: 'fechaLlegada',
    header: 'Fecha de llegada',
    renderCell: (fila) => <FechaCivil valor={fila.fechaLlegada} />,
  },
  {
    field: 'carpeta',
    header: 'Carpeta',
    renderCell: (fila) =>
      fila.carpeta === null ? (
        <SinDato />
      ) : (
        <EnlaceCarpeta url={fila.carpeta}>
          Abrir<span className="sr-only"> la carpeta del requerimiento #{fila.id}</span>
        </EnlaceCarpeta>
      ),
  },
  {
    field: 'actualizadoEn',
    header: 'Última actualización',
    sortable: true,
    renderCell: (fila) => <Instante valor={fila.actualizadoEn} />,
  },
]
