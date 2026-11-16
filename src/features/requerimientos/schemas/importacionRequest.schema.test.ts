import { describe, expect, it } from 'vitest'
import {
  MAXIMO_FILAS_IMPORTACION,
  nuevaImportacionRequestSchema,
} from '@/features/requerimientos/schemas/importacionRequest.schema'

function crearFila(fila: number, identificador = String(fila - 1)) {
  return {
    fila,
    identificador,
    materiales: `Material ${fila}`,
    descripcion: null,
    cantidad: 1,
    estado: 'Comprado',
    modalidad: 'AG',
    ordenDeCompra: 5413,
    fechaMaximaLlegada: '2026-10-05',
    fechaLlegada: null,
    observaciones: null,
    carpeta: null,
  }
}

const importacionValida = {
  solicitanteId: 1,
  archivo: { nombre: 'planilla.xlsx', tamano: 13642, huella: 'a'.repeat(64) },
  filas: [crearFila(2), crearFila(3)],
}

function esValida(cambios: Record<string, unknown>): boolean {
  return nuevaImportacionRequestSchema.safeParse({ ...importacionValida, ...cambios }).success
}

describe('nuevaImportacionRequestSchema', () => {
  it('acepta celdas con texto, número o vacías', () => {
    expect(esValida({})).toBe(true)
  })

  it('rechaza una huella que no es un SHA-256 en hexadecimal', () => {
    expect(esValida({ archivo: { ...importacionValida.archivo, huella: 'A'.repeat(64) } })).toBe(
      false,
    )
    expect(esValida({ archivo: { ...importacionValida.archivo, huella: 'a'.repeat(63) } })).toBe(
      false,
    )
  })

  it('rechaza una planilla sin filas', () => {
    expect(esValida({ filas: [] })).toBe(false)
  })

  it('rechaza una planilla que supera el máximo de filas', () => {
    const filas = Array.from({ length: MAXIMO_FILAS_IMPORTACION + 1 }, (_, indice) =>
      crearFila(indice + 2),
    )

    expect(esValida({ filas })).toBe(false)
  })

  it('rechaza números de fila repetidos', () => {
    expect(esValida({ filas: [crearFila(2, '1'), crearFila(2, '2')] })).toBe(false)
  })

  it('rechaza la fila del encabezado', () => {
    expect(esValida({ filas: [crearFila(1, '1')] })).toBe(false)
  })

  it('rechaza celdas con valores que no son texto ni número', () => {
    expect(esValida({ filas: [{ ...crearFila(2), cantidad: true }] })).toBe(false)
  })

  it('rechaza una fila sin ítem', () => {
    expect(esValida({ filas: [crearFila(2, '   ')] })).toBe(false)
  })

  it('rechaza ítems repetidos', () => {
    expect(esValida({ filas: [crearFila(2, '5'), crearFila(3, ' 5 ')] })).toBe(false)
  })

  it('rechaza un ítem que supera los 50 caracteres', () => {
    expect(esValida({ filas: [crearFila(2, 'x'.repeat(51))] })).toBe(false)
  })

  it('quita los espacios al inicio y al final del ítem', () => {
    const resultado = nuevaImportacionRequestSchema.parse({
      ...importacionValida,
      filas: [crearFila(2, '  A-01 ')],
    })

    expect(resultado.filas[0].identificador).toBe('A-01')
  })
})
