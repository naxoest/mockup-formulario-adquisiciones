import { Badge } from '@/components/ui/Badge'

interface CeldaEstadoProyectoProps {
  activo: boolean
}

export function CeldaEstadoProyecto({ activo }: CeldaEstadoProyectoProps) {
  return (
    <Badge variant={activo ? 'success' : 'neutral'} size="sm" dot>
      {activo ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
