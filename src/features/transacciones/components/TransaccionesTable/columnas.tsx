import type { ColumnDef } from '@/components/ui/DataTable'
import type { BadgeProps } from '@/components/ui/Badge'
import type { TransaccionListado } from '../../types/transaccion.types'
import { Badge } from '@/components/ui/Badge'
import {
  BadgeCheckIcon,
  CheckCircle2,
  CircleCheckBigIcon,
  CircleDotIcon,
  CircleXIcon,
  FileTextIcon,
  HandCoinsIcon,
  MegaphoneIcon,
  MessageSquareWarningIcon,
  ScaleIcon,
  SendIcon,
  UserCheckIcon,
  WalletIcon,
  WrenchIcon,
} from 'lucide-react'
import { CeldaFecha } from './CeldaFecha'
import { CeldaModalidadTipo } from './CeldaModalidadTipo'
import { CeldaNombre } from './CeldaNombre'
import { CeldaUnidades } from './CeldaUnidades'
import { CeldaAnalistas } from './CeldaAnalistas'
import { IndicadorCriticidad } from '@/features/transacciones/components/IndicadorCriticidad'

const presentacionEstado: Record<
  string,
  { variant: BadgeProps['variant']; icono: React.ReactNode }
> = {
  en_cotizacion: { variant: 'warning', icono: <CircleDotIcon /> },
  cotizada: { variant: 'warning', icono: <CircleCheckBigIcon /> },
  presupuesto_solicitado: { variant: 'info', icono: <HandCoinsIcon /> },
  presupuesto_asignado: { variant: 'info', icono: <WalletIcon /> },
  enviada_a_adquisiciones: { variant: 'info', icono: <SendIcon /> },
  analista_asignado: { variant: 'info', icono: <UserCheckIcon /> },
  aprobada: { variant: 'info', icono: <BadgeCheckIcon /> },
  aprobada_con_observaciones: { variant: 'warning', icono: <MessageSquareWarningIcon /> },
  subsanada: { variant: 'info', icono: <WrenchIcon /> },
  publicada: { variant: 'info', icono: <MegaphoneIcon /> },
  evaluada: { variant: 'info', icono: <ScaleIcon /> },
  facturada: { variant: 'success', icono: <FileTextIcon /> },
  cerrada: { variant: 'success', icono: <CheckCircle2 /> },
  rechazada: { variant: 'error', icono: <CircleXIcon /> },
}

export const columnasTransaccion: ColumnDef<TransaccionListado>[] = [
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true,
    width: 'min-w-56',
    renderCell: (row) => (
      <CeldaNombre id={row.id} nombre={row.nombre} enlace={row.linkCarpetaAntecedentes} />
    ),
  },
  {
    field: 'estado',
    header: 'Estado',
    sortable: true,
    width: 'w-40',
    renderCell: (row) => {
      if (row.estado === null) {
        return <span className="text-mercury-400">—</span>
      }

      const presentacion = presentacionEstado[row.estado.value]

      if (!presentacion) {
        return (
          <Badge size="sm" variant="neutral">
            {row.estado.label}
          </Badge>
        )
      }

      return (
        <Badge variant={presentacion.variant} size="sm" icon={presentacion.icono}>
          {row.estado.label}
        </Badge>
      )
    },
  },
  {
    field: 'criticidad',
    header: 'Criticidad',
    sortable: true,
    width: 'w-36',
    renderCell: (row) => <IndicadorCriticidad criticidad={row.criticidad} />,
  },
  {
    field: 'analistas',
    header: 'Analista',
    renderCell: (row) => (
      <CeldaAnalistas analistas={row.analistas} miParticipacion={row.miParticipacion} />
    ),
  },
  {
    field: 'modalidad',
    header: 'Modalidad y tipo',
    sortable: true,
    width: 'min-w-48',
    renderCell: (row) => <CeldaModalidadTipo modalidad={row.modalidad} tipos={row.tipos} />,
  },
  {
    field: 'solicitudes',
    header: 'Unidades',
    renderCell: (row) =>
      row.solicitudes.total === 0 ? (
        <span className="text-mercury-400">—</span>
      ) : (
        <CeldaUnidades solicitudes={row.solicitudes} />
      ),
  },
  {
    field: 'fecha',
    header: 'Fecha',
    sortable: true,
    renderCell: (row) => <CeldaFecha fecha={row.fecha} />,
  },
]
