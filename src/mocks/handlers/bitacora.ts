import { z } from 'zod'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { usuarioEnSesion } from '@/mocks/handlers/autorizacion'
import { registrarEvento, siguienteIdEvento } from '@/mocks/handlers/transacciones.estado'

export const observacionSchema = z.object({
  observacion: z.string().min(1).optional(),
})

export const observacionObligatoriaSchema = z.object({
  observacion: z.string().min(1),
})

function autorEnSesion(): string {
  const usuario = usuarioEnSesion()

  if (!usuario) {
    throw new Error('La bitácora necesita un usuario en sesión para firmar el registro')
  }

  return nombreDeAnalista(usuario)
}

export function anotar(transaccionId: number, titulo: string, observacion?: string): void {
  registrarEvento(transaccionId, {
    clase: 'registro',
    id: siguienteIdEvento(),
    fecha: new Date().toISOString(),
    titulo,
    observacion: observacion ?? '',
    autor: autorEnSesion(),
  })
}
