import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { DetalleRequerimientoModalProps } from './DetalleRequerimientoModal.types'
import { DatosRequerimiento } from './DatosRequerimiento'
import { Trazabilidad } from './Trazabilidad'

export function DetalleRequerimientoModal({
  requerimiento,
  open,
  onExited,
  resolve,
}: DetalleRequerimientoModalProps) {
  const cerrar = () => {
    resolve()
  }

  return (
    <Modal open={open} onClose={cerrar} onExited={onExited} size="xl">
      <Modal.Header icon={<ClipboardList aria-hidden="true" className="size-5 text-primary-700" />}>
        {`Requerimiento #${requerimiento.id}`}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-8">
          <DatosRequerimiento requerimiento={requerimiento} />
          <Trazabilidad requerimientoId={requerimiento.id} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
