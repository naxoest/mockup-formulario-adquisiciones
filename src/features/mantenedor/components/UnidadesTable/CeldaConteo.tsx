import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface CeldaConteoProps {
  icono: LucideIcon
  valor: number
}

export function CeldaConteo({ icono: Icono, valor }: CeldaConteoProps) {
  const tieneRegistros = valor > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm tabular-nums',
        tieneRegistros ? 'font-semibold text-mercury-900' : 'text-mercury-500',
      )}
    >
      <Icono
        aria-hidden="true"
        className={cn('size-4 shrink-0', tieneRegistros ? 'text-primary-700' : 'text-mercury-500')}
      />
      {valor}
    </span>
  )
}
