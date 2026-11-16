import { Building2, GraduationCap, type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'

interface PresentacionTipo {
  icono: LucideIcon
  clases: string
}

const presentacionPorTipo: Record<string, PresentacionTipo> = {
  carrera: { icono: GraduationCap, clases: 'bg-jade-50 text-jade-700' },
  unidad: { icono: Building2, clases: 'bg-primary-100 text-primary-700' },
}

const PRESENTACION_GENERICA: PresentacionTipo = {
  icono: Building2,
  clases: 'bg-mercury-100 text-mercury-700',
}

interface CeldaUnidadProps {
  unidad: UnidadSolicitante
}

export function CeldaUnidad({ unidad }: CeldaUnidadProps) {
  const presentacion = presentacionPorTipo[unidad.tipo.value] ?? PRESENTACION_GENERICA
  const Icono = presentacion.icono

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          presentacion.clases,
        )}
      >
        <Icono aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-mercury-900">{unidad.nombre}</span>
        <span className="text-xs text-mercury-500">{unidad.tipo.label}</span>
      </span>
    </span>
  )
}
