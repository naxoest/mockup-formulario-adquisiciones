import type { ModalComponentProps } from '@/components/ui/Modal'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

export interface ModalProyectoProps extends ModalComponentProps<boolean> {
  proyecto?: Proyecto
}
