import type { ModalComponentProps } from '@/components/ui/Modal'

export interface TransaccionEditModalProps extends ModalComponentProps<void> {
  transaccionId: number
}
