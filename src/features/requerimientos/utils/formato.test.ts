import { describe, expect, it } from 'vitest'
import { formatShortDate } from '@/utils/date'
import {
  formatearCantidad,
  formatearFechaCivil,
  formatearInstante,
  formatearSolicitante,
} from '@/features/requerimientos/utils/formato'

describe('formatearFechaCivil', () => {
  it('formatea la fecha de calendario sin desplazar el día', () => {
    expect(formatearFechaCivil('2026-10-05')).toBe(formatShortDate(new Date(2026, 9, 5)))
  })
})

describe('formatearInstante', () => {
  it('muestra la fecha y la hora local en formato de 24 horas', () => {
    expect(formatearInstante('2026-09-29T21:05:47')).toBe(
      `${formatShortDate(new Date(2026, 8, 29))}, 21:05`,
    )
  })

  it('conserva el día de un instante cercano a la medianoche', () => {
    expect(formatearInstante('2026-09-30T00:15:00')).toBe(
      `${formatShortDate(new Date(2026, 8, 30))}, 00:15`,
    )
  })
})

describe('formatearCantidad', () => {
  it('muestra los enteros sin decimales', () => {
    expect(formatearCantidad(30)).toBe('30')
  })

  it('usa la coma como separador decimal', () => {
    expect(formatearCantidad(2.5)).toBe('2,5')
  })

  it('separa los miles con punto', () => {
    expect(formatearCantidad(12345)).toBe('12.345')
  })
})

describe('formatearSolicitante', () => {
  it('agrega el campus para distinguir solicitantes con el mismo nombre', () => {
    const solicitante = {
      id: 3,
      cr: 109,
      nombre: 'Arquitectura',
      sedes: [{ value: 'pto', label: 'Puerto Montt' }],
      tipo: 'carrera',
    }

    expect(formatearSolicitante(solicitante)).toBe('Arquitectura (Puerto Montt)')
    expect(
      formatearSolicitante({
        ...solicitante,
        sedes: [
          { value: 'osorno', label: 'Osorno' },
          { value: 'pto', label: 'Puerto Montt' },
        ],
      }),
    ).toBe('Arquitectura (Osorno, Puerto Montt)')
  })
})
