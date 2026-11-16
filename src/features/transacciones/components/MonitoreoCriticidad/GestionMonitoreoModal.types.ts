import type { ModalComponentProps } from '@/components/ui/Modal'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

export type GestionMonitoreoModalProps = ModalComponentProps<boolean> & {
  fila: FilaMonitoreo
}
