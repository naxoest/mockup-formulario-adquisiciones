import type { ModalComponentProps } from '@/components/ui/Modal'

export interface TransaccionHistorialModalProps extends ModalComponentProps<void> {
  transaccionId: number
}
