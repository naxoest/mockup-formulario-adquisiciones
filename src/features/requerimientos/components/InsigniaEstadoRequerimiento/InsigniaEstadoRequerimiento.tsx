import type { ReactNode } from 'react'
import { Ban, CircleDashed, PackageCheck, ShoppingCart, Warehouse } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/Badge'
import type {
  EstadoRequerimiento,
  OpcionEstadoRequerimiento,
} from '@/features/requerimientos/types/requerimiento.types'

const presentacionEstado: Record<
  EstadoRequerimiento,
  { variant: BadgeProps['variant']; icono: ReactNode }
> = {
  comprado: { variant: 'info', icono: <ShoppingCart /> },
  en_bodega: { variant: 'info', icono: <Warehouse /> },
  no_comprado: { variant: 'warning', icono: <CircleDashed /> },
  entregado: { variant: 'success', icono: <PackageCheck /> },
  desestimado: { variant: 'neutral', icono: <Ban /> },
}

export function InsigniaEstadoRequerimiento({ estado }: { estado: OpcionEstadoRequerimiento }) {
  const presentacion = presentacionEstado[estado.value]

  return (
    <Badge variant={presentacion.variant} size="sm" icon={presentacion.icono}>
      {estado.label}
    </Badge>
  )
}
