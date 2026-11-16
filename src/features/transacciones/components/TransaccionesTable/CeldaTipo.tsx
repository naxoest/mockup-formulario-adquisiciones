import { Badge } from '@/components/ui/Badge'
import type { SelectOption } from '@/types/select'

export function CeldaTipo({ tipos }: { tipos: SelectOption[] }) {
  const unicos = Array.from(new Map(tipos.map((tipo) => [tipo.value, tipo])).values())

  if (unicos.length === 0) {
    return <span className="text-mercury-400">—</span>
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {unicos.map((tipo) => (
        <Badge key={tipo.value} variant={tipo.value === 'SASERVI' ? 'info' : 'neutral'} size="sm">
          {tipo.label}
        </Badge>
      ))}
    </span>
  )
}
