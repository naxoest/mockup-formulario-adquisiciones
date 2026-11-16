import type { SelectOption } from '@/types/select'
import type {
  Transaccion,
  TransaccionFormState,
} from '@/features/transacciones/types/transaccion.types'

export interface TransaccionWizardProps {
  modo: 'crear' | 'editar'
  defaultValues?: TransaccionFormState
  transaccionInicial?: Transaccion | null
  modalidadPrecargada?: SelectOption
  onComplete: (transaccionId: number) => void
}
