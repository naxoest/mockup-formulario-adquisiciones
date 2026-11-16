import { CircleCheck, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function InsigniaVigencia({ eliminado }: { eliminado: boolean }) {
  if (eliminado) {
    return (
      <Badge variant="error" size="sm" icon={<Trash2 />}>
        Eliminado
      </Badge>
    )
  }

  return (
    <Badge variant="success" size="sm" icon={<CircleCheck />}>
      Vigente
    </Badge>
  )
}
