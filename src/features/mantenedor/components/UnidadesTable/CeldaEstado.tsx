import { Badge } from '@/components/ui/Badge'

interface CeldaEstadoProps {
  activo: boolean
}

export function CeldaEstado({ activo }: CeldaEstadoProps) {
  return (
    <Badge variant={activo ? 'success' : 'neutral'} size="sm" dot>
      {activo ? 'Activa' : 'Inactiva'}
    </Badge>
  )
}
