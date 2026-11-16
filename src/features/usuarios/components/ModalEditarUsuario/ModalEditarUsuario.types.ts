import type { ModalComponentProps } from '@/components/ui/Modal'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

export interface ModalEditarUsuarioProps extends ModalComponentProps<boolean> {
  usuario: Usuario
}
