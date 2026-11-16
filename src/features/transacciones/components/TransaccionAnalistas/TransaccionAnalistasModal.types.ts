import type { ModalComponentProps } from '@/components/ui/Modal'

export type TransaccionAnalistasModalProps = ModalComponentProps<boolean> & {
  transaccionId: number
}
