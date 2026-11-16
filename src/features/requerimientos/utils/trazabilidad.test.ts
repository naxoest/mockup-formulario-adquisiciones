import { describe, expect, it } from 'vitest'
import { formatShortDate } from '@/utils/date'
import type { CambioRequerimiento } from '@/features/requerimientos/types/evento.types'
import { textoValorCambio } from '@/features/requerimientos/utils/trazabilidad'

describe('textoValorCambio', () => {
  it('usa la etiqueta del estado a ambos lados del cambio', () => {
    const cambio: CambioRequerimiento = {
      campo: 'estado',
      anterior: { value: 'no_comprado', label: 'No comprado' },
      nuevo: { value: 'comprado', label: 'Comprado' },
    }

    expect(textoValorCambio(cambio, 'anterior')).toBe('No comprado')
    expect(textoValorCambio(cambio, 'nuevo')).toBe('Comprado')
  })

  it('usa la etiqueta del mecanismo de compra', () => {
    const cambio: CambioRequerimiento = {
      campo: 'modalidad',
      anterior: null,
      nuevo: { value: 'agil', label: 'Compra Ágil' },
    }

    expect(textoValorCambio(cambio, 'nuevo')).toBe('Compra Ágil')
  })

  it('formatea la cantidad con el formato local', () => {
    const cambio: CambioRequerimiento = { campo: 'cantidad', anterior: 2.5, nuevo: 12345 }

    expect(textoValorCambio(cambio, 'anterior')).toBe('2,5')
    expect(textoValorCambio(cambio, 'nuevo')).toBe('12.345')
  })

  it('formatea las fechas como fechas de calendario', () => {
    const cambio: CambioRequerimiento = {
      campo: 'fechaMaximaLlegada',
      anterior: null,
      nuevo: '2026-10-05',
    }

    expect(textoValorCambio(cambio, 'nuevo')).toBe(formatShortDate(new Date(2026, 9, 5)))
  })

  it('entrega los textos sin modificarlos', () => {
    const cambio: CambioRequerimiento = { campo: 'ordenDeCompra', anterior: '5413', nuevo: 'G32' }

    expect(textoValorCambio(cambio, 'anterior')).toBe('5413')
    expect(textoValorCambio(cambio, 'nuevo')).toBe('G32')
  })

  it('entrega null cuando el atributo no tenía valor', () => {
    const cambios: CambioRequerimiento[] = [
      { campo: 'estado', anterior: null, nuevo: { value: 'comprado', label: 'Comprado' } },
      { campo: 'cantidad', anterior: null, nuevo: 4 },
      { campo: 'fechaLlegada', anterior: null, nuevo: '2026-09-30' },
      { campo: 'observaciones', anterior: null, nuevo: 'Llegó incompleto' },
    ]

    for (const cambio of cambios) {
      expect(textoValorCambio(cambio, 'anterior')).toBeNull()
    }
  })
})
