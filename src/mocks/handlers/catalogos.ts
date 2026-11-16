import type { SelectOption } from '@/types/select'

export function existeEnCatalogo(valor: string, opciones: SelectOption[]): boolean {
  return opciones.some((opcion) => opcion.value === valor)
}
