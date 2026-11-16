import type { ReactNode } from 'react'
import { CircleCheck, CircleDot, CircleX } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import type {
  EstadoImportacion,
  OpcionEstadoImportacion,
} from '@/features/requerimientos/types/importacion.types'

const presentacionEstado: Record<
  EstadoImportacion,
  { variant: BadgeProps['variant']; icono: ReactNode }
> = {
  pendiente: { variant: 'warning', icono: <CircleDot /> },
  confirmada: { variant: 'success', icono: <CircleCheck /> },
  descartada: { variant: 'neutral', icono: <CircleX /> },
}

export function InsigniaEstadoImportacion({ estado }: { estado: OpcionEstadoImportacion }) {
  const presentacion = presentacionEstado[estado.value]

  return (
    <Badge variant={presentacion.variant} size="sm" icon={presentacion.icono}>
      {estado.label}
    </Badge>
  )
}
