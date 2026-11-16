import type { ParticipacionAnalista } from '@/features/transacciones/types/transaccion.types'

export interface AsignacionAlmacenada {
  transaccionId: number
  run: number
  participacion: ParticipacionAnalista
}

export const asignacionesMock: AsignacionAlmacenada[] = [
  { transaccionId: 1, run: 16234875, participacion: 'principal' },
  { transaccionId: 1, run: 9876543, participacion: 'apoyo' },
  { transaccionId: 2, run: 17890123, participacion: 'principal' },
  { transaccionId: 2, run: 19456782, participacion: 'apoyo' },
  { transaccionId: 3, run: 19456782, participacion: 'principal' },
  { transaccionId: 4, run: 16234875, participacion: 'principal' },
  { transaccionId: 5, run: 17890123, participacion: 'principal' },
  { transaccionId: 7, run: 16234875, participacion: 'principal' },
  { transaccionId: 8, run: 17890123, participacion: 'principal' },
  { transaccionId: 8, run: 9876543, participacion: 'apoyo' },
  { transaccionId: 9, run: 19456782, participacion: 'principal' },
  { transaccionId: 10, run: 13579246, participacion: 'principal' },
]

export const MOTIVO_DESACTIVACION = 'El usuario fue desactivado.'
export const MOTIVO_PERDIDA_DE_ROL = 'El usuario dejó de tener el rol analista.'

export interface AsignacionTerminada extends AsignacionAlmacenada {
  terminadaEn: string
  motivo: string
}

export const asignacionesTerminadasMock: AsignacionTerminada[] = [
  {
    transaccionId: 6,
    run: 15432109,
    participacion: 'principal',
    terminadaEn: '2026-07-18T09:20:00-04:00',
    motivo: MOTIVO_DESACTIVACION,
  },
]
