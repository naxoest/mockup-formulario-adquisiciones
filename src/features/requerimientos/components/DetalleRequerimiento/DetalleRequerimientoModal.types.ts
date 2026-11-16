import type { ModalComponentProps } from '@/components/ui/Modal'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'

export interface DetalleRequerimientoModalProps extends ModalComponentProps<void> {
  requerimiento: Requerimiento
}
