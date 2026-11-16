import { History } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ContenidoHistorial } from './ContenidoHistorial'
import type { TransaccionHistorialModalProps } from './TransaccionHistorialModal.types'

export function TransaccionHistorialModal({
  transaccionId,
  open,
  onExited,
  resolve,
}: TransaccionHistorialModalProps) {
  const cerrar = () => {
    resolve()
  }

  return (
    <Modal open={open} onClose={cerrar} onExited={onExited} size="xl">
      <Modal.Header icon={<History aria-hidden="true" className="size-5 text-primary-700" />}>
        {`Historial de la transacción #${transaccionId}`}
      </Modal.Header>
      <Modal.Body>
        <ContenidoHistorial transaccionId={transaccionId} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
