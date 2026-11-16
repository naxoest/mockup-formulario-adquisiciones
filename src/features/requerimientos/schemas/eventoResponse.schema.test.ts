import { describe, expect, it } from 'vitest'
import { eventosRequerimientoResponseSchema } from '@/features/requerimientos/schemas/eventoResponse.schema'

const eventoValido = {
  id: 22,
  tipo: 'actualizacion',
  fecha: '2026-09-29T09:05:00',
  autor: 'Usuario de prueba',
  origen: { importacionId: 3, fila: 11, nombreArchivo: 'planilla-con-identificadores.xlsx' },
  cambios: [
    {
      campo: 'estado',
      anterior: { value: 'no_comprado', label: 'No comprado' },
      nuevo: { value: 'comprado', label: 'Comprado' },
    },
    { campo: 'ordenDeCompra', anterior: null, nuevo: 'G32' },
    { campo: 'fechaMaximaLlegada', anterior: null, nuevo: '2026-10-05' },
    { campo: 'cantidad', anterior: 3, nuevo: 4 },
    { campo: 'modalidad', anterior: null, nuevo: { value: 'agil', label: 'Compra Ágil' } },
  ],
}

const origenSinFila = {
  importacionId: 5,
  fila: null,
  nombreArchivo: 'planilla-con-identificadores.xlsx',
}

function esValido(cambios: Record<string, unknown>): boolean {
  return eventosRequerimientoResponseSchema.safeParse([{ ...eventoValido, ...cambios }]).success
}

describe('eventosRequerimientoResponseSchema', () => {
  it('acepta un evento con cambios de cada tipo de atributo', () => {
    expect(esValido({})).toBe(true)
  })

  it('rechaza un evento sin cambios', () => {
    expect(esValido({ cambios: [] })).toBe(false)
  })

  it('rechaza un valor cuyo tipo no corresponde al atributo', () => {
    expect(esValido({ cambios: [{ campo: 'cantidad', anterior: null, nuevo: '4' }] })).toBe(false)
  })

  it('rechaza un estado fuera del catálogo', () => {
    const cambios = [
      { campo: 'estado', anterior: null, nuevo: { value: 'perdido', label: 'Perdido' } },
    ]

    expect(esValido({ cambios })).toBe(false)
  })

  it('rechaza un atributo desconocido', () => {
    expect(esValido({ cambios: [{ campo: 'proveedor', anterior: null, nuevo: 'ACME' }] })).toBe(
      false,
    )
  })

  it('rechaza una fecha de calendario enviada como instante', () => {
    const cambios = [{ campo: 'fechaLlegada', anterior: null, nuevo: '2026-09-30T03:00:00.000Z' }]

    expect(esValido({ cambios })).toBe(false)
  })

  it('rechaza un tipo de evento desconocido', () => {
    expect(esValido({ tipo: 'fusion' })).toBe(false)
  })

  it('acepta una eliminación sin fila de origen ni cambios', () => {
    expect(esValido({ tipo: 'eliminacion', origen: origenSinFila, cambios: [] })).toBe(true)
  })

  it('rechaza una eliminación con fila de origen', () => {
    expect(esValido({ tipo: 'eliminacion', cambios: [] })).toBe(false)
  })

  it('rechaza una eliminación con cambios', () => {
    expect(esValido({ tipo: 'eliminacion', origen: origenSinFila })).toBe(false)
  })

  it('rechaza un evento que no es eliminación sin fila de origen', () => {
    expect(esValido({ origen: origenSinFila })).toBe(false)
  })

  it('acepta una restauración con cambios y sin ellos', () => {
    expect(esValido({ tipo: 'restauracion' })).toBe(true)
    expect(esValido({ tipo: 'restauracion', cambios: [] })).toBe(true)
  })
})
