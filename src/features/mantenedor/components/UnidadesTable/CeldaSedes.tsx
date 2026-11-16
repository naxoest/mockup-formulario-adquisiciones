import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SelectOption } from '@/types/select'

interface CeldaSedesProps {
  sedes: SelectOption[]
  catalogo: SelectOption[]
}

export function CeldaSedes({ sedes, catalogo }: CeldaSedesProps) {
  const asociadas = new Set(sedes.map((sede) => sede.value))
  const fueraDelCatalogo = sedes.filter(
    (sede) => !catalogo.some((opcion) => opcion.value === sede.value),
  )

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {[...catalogo, ...fueraDelCatalogo].map((sede) => {
        const asociada = asociadas.has(sede.value)

        return (
          <span
            key={sede.value}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
              asociada
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-dashed border-mercury-300 text-mercury-500',
            )}
          >
            {asociada && <Check aria-hidden="true" className="size-3" />}
            {sede.label}
            {!asociada && <span className="sr-only"> (no asociada)</span>}
          </span>
        )
      })}
    </span>
  )
}
