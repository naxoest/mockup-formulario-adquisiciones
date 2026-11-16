import { describe, expect, it } from 'vitest'
import {
  estadosRequerimientoResponseSchema,
  requerimientosResponseSchema,
} from '@/features/requerimientos/schemas/requerimientoResponse.schema'

const requerimientoValido = {
  id: 10,
  identificador: '10',
  solicitante: {
    id: 1,
    cr: 105,
    nombre: 'Campos Clinicos',
    sedes: [{ value: 'osorno', label: 'Osorno' }],
    tipo: 'carrera',
  },
  materiales: 'Material 10',
  descripcion: null,
  cantidad: 4,
  estado: { value: 'comprado', label: 'Comprado' },
  modalidad: { value: 'agil', label: 'Compra Ágil' },
  ordenDeCompra: 'G32',
  fechaMaximaLlegada: '2026-10-05',
  fechaLlegada: null,
  observaciones: null,
  carpeta: 'https://drive.google.com/drive/folders/carpeta-g32',
  actualizadoEn: '2026-09-29T09:05:00',
  eliminado: false,
}

function esValido(cambios: Record<string, unknown>): boolean {
  return requerimientosResponseSchema.safeParse([{ ...requerimientoValido, ...cambios }]).success
}

describe('requerimientosResponseSchema', () => {
  it('acepta un requerimiento con todos sus atributos', () => {
    expect(esValido({})).toBe(true)
  })

  it('acepta los atributos opcionales en null', () => {
    expect(
      esValido({ modalidad: null, ordenDeCompra: null, fechaMaximaLlegada: null, carpeta: null }),
    ).toBe(true)
  })

  it('rechaza un requerimiento sin ítem', () => {
    expect(esValido({ identificador: '' })).toBe(false)
  })

  it('rechaza una carpeta que no es un enlace http o https', () => {
    expect(esValido({ carpeta: 'ftp://example.com/planillas' })).toBe(false)
  })

  it('rechaza un estado fuera del catálogo', () => {
    expect(esValido({ estado: { value: 'perdido', label: 'Perdido' } })).toBe(false)
  })

  it('rechaza una cantidad igual a cero', () => {
    expect(esValido({ cantidad: 0 })).toBe(false)
  })

  it('rechaza un texto vacío en lugar de null', () => {
    expect(esValido({ observaciones: '' })).toBe(false)
  })

  it('rechaza una fecha de calendario enviada como instante', () => {
    expect(esValido({ fechaMaximaLlegada: '2026-10-05T03:00:00.000Z' })).toBe(false)
  })

  it('rechaza la última actualización con zona horaria', () => {
    expect(esValido({ actualizadoEn: '2026-09-29T12:05:00Z' })).toBe(false)
  })

  it('acepta un requerimiento eliminado', () => {
    expect(esValido({ eliminado: true })).toBe(true)
  })

  it('exige indicar si el requerimiento está eliminado', () => {
    expect(esValido({ eliminado: undefined })).toBe(false)
  })
})

describe('estadosRequerimientoResponseSchema', () => {
  it('rechaza un estado fuera del catálogo', () => {
    const resultado = estadosRequerimientoResponseSchema.safeParse([
      { value: 'perdido', label: 'Perdido' },
    ])

    expect(resultado.success).toBe(false)
  })
})
