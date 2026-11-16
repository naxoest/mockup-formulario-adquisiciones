import type { SelectOption } from '@/types/select'
import { CeldaModalidad } from './CeldaModalidad'
import { CeldaTipo } from './CeldaTipo'

export function CeldaModalidadTipo({
  modalidad,
  tipos,
}: {
  modalidad: SelectOption
  tipos: SelectOption[]
}) {
  return (
    <span className="flex flex-col gap-1">
      <CeldaModalidad modalidad={modalidad} />
      <span>
        <CeldaTipo tipos={tipos} />
      </span>
    </span>
  )
}
