import type {
  CambioRequerimiento,
  CampoRequerimiento,
} from '@/features/requerimientos/types/evento.types'
import { formatearCantidad, formatearFechaCivil } from '@/features/requerimientos/utils/formato'

export type LadoCambio = 'anterior' | 'nuevo'

export const ETIQUETA_IDENTIFICADOR = 'Ítem'

export const ETIQUETAS_CAMPO: Record<CampoRequerimiento, string> = {
  materiales: 'Materiales',
  descripcion: 'Descripción',
  cantidad: 'Cantidad',
  estado: 'Estado',
  modalidad: 'Mecanismo de compra',
  ordenDeCompra: 'Orden de compra',
  fechaMaximaLlegada: 'Fecha máxima de llegada',
  fechaLlegada: 'Fecha de llegada',
  observaciones: 'Observaciones',
  carpeta: 'Carpeta',
}

export function textoValorCambio(cambio: CambioRequerimiento, lado: LadoCambio): string | null {
  switch (cambio.campo) {
    case 'estado':
    case 'modalidad': {
      const opcion = cambio[lado]
      return opcion === null ? null : opcion.label
    }
    case 'cantidad': {
      const cantidad = cambio[lado]
      return cantidad === null ? null : formatearCantidad(cantidad)
    }
    case 'fechaMaximaLlegada':
    case 'fechaLlegada': {
      const fecha = cambio[lado]
      return fecha === null ? null : formatearFechaCivil(fecha)
    }
    case 'materiales':
    case 'descripcion':
    case 'ordenDeCompra':
    case 'observaciones':
    case 'carpeta':
      return cambio[lado]
  }
}
