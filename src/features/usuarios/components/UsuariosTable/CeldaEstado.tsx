import { Badge } from '@/components/ui/Badge'

interface CeldaEstadoProps {
  estaActivo: boolean
}

export function CeldaEstado({ estaActivo }: CeldaEstadoProps) {
  return (
    <Badge variant={estaActivo ? 'success' : 'neutral'} size="sm">
      {estaActivo ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
