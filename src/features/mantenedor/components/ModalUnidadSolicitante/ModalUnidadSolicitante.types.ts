import type { ModalComponentProps } from '@/components/ui/Modal'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'

export interface ModalUnidadSolicitanteProps extends ModalComponentProps<boolean> {
  unidad?: UnidadSolicitante
}
