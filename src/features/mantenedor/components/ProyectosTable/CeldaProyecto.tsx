import { FolderKanban } from 'lucide-react'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

interface CeldaProyectoProps {
  proyecto: Proyecto
}

export function CeldaProyecto({ proyecto }: CeldaProyectoProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
        <FolderKanban aria-hidden="true" className="size-4" />
      </span>
      <span className="truncate font-semibold text-mercury-900">{proyecto.nombre}</span>
    </span>
  )
}
