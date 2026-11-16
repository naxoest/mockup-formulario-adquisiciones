import { Modal, type ModalComponentProps } from '@/components/ui/Modal'
import { TransaccionWizard } from '../TransaccionWizard'

export function TransaccionCreateModal({
  open,
  onExited,
  reject,
  resolve,
}: ModalComponentProps<number | null>) {
  return (
    <Modal
      open={open}
      onClose={() => {
        reject()
      }}
      onExited={onExited}
      size="xl"
    >
      <Modal.Header tone="default">Agregar nueva transaccion</Modal.Header>
      <TransaccionWizard
        modo="crear"
        onComplete={(transaccionId) => {
          resolve(transaccionId)
        }}
      />
    </Modal>
  )
}
