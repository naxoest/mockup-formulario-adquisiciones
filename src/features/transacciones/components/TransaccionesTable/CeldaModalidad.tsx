import type { SelectOption } from '@/types/select'

export function CeldaModalidad({ modalidad }: { modalidad: SelectOption }) {
  return <span className="text-sm">{modalidad.label}</span>
}
