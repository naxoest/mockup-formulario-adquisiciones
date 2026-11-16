import { describe, expect, it } from 'vitest'
import { transaccionSchema } from './transaccion.schema'

const solicitanteBase = {
  id: null,
  unidadId: 12,
  claveFormulario: 'clave-1',
  tipo: 'carrera',
  tipoSolicitud: 'SABIENES',
  codigoSaserviSabienes: '',
  financiamiento: null,
  nombre: 'arq',
  campus: 'osorno',
  cr: 101,
  precompromisos: [],
}

const transaccionBase = {
  id: null,
  nombre: 'Compra de prueba',
  linkCarpetaAntecedentes: '',
  modalidad: 'agil',
  fecha: new Date(2026, 5, 1),
  solicitantes: [solicitanteBase],
  ordenesDeCompra: [],
  facturas: [],
}

describe('transaccionSchema', () => {
  it('acepta una transaccion minima valida', () => {
    expect(transaccionSchema.safeParse(transaccionBase).success).toBe(true)
  })

  it('devuelve la misma forma que recibe, sin campos derivados', () => {
    const resultado = transaccionSchema.parse(transaccionBase)

    expect(Object.keys(resultado).sort()).toEqual([
      'facturas',
      'fecha',
      'id',
      'linkCarpetaAntecedentes',
      'modalidad',
      'nombre',
      'ordenesDeCompra',
      'solicitantes',
    ])
  })

  it('rechaza un solicitante sin unidad seleccionada', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      solicitantes: [{ ...solicitanteBase, unidadId: null }],
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza una transaccion sin solicitantes', () => {
    const resultado = transaccionSchema.safeParse({ ...transaccionBase, solicitantes: [] })

    expect(resultado.success).toBe(false)
  })

  it('acepta un precompromiso con monto cero', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      solicitantes: [{ ...solicitanteBase, precompromisos: [{ anio: '2026', monto: 0 }] }],
    })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un anio repetido en la fila que lo repite', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      solicitantes: [
        {
          ...solicitanteBase,
          precompromisos: [
            { anio: '2026', monto: 1000 },
            { anio: '2026', monto: 2000 },
          ],
        },
      ],
    })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path)).toEqual([
      ['solicitantes', 0, 'precompromisos', 1, 'anio'],
    ])
  })

  it('rechaza un precompromiso sin anio o sin monto', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      solicitantes: [
        {
          ...solicitanteBase,
          precompromisos: [
            { anio: null, monto: 1000 },
            { anio: '2027', monto: null },
          ],
        },
      ],
    })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path)).toEqual([
      ['solicitantes', 0, 'precompromisos', 0, 'anio'],
      ['solicitantes', 0, 'precompromisos', 1, 'monto'],
    ])
  })

  it('rechaza una orden de compra sin solicitantes', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      ordenesDeCompra: [
        {
          id: null,
          claveFormulario: 'orden-1',
          codigo: 'OC-1',
          fechaEmision: new Date(2026, 5, 1),
          solicitantes: [],
        },
      ],
    })

    expect(resultado.success).toBe(false)
  })

  it('acepta una orden de compra con una linea valida', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      ordenesDeCompra: [
        {
          id: null,
          claveFormulario: 'orden-1',
          codigo: 'OC-1',
          fechaEmision: new Date(2026, 5, 1),
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 5000 }] }],
        },
      ],
    })

    expect(resultado.success).toBe(true)
  })

  it('rechaza una orden de compra sin fecha de emision', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      ordenesDeCompra: [
        {
          id: null,
          claveFormulario: 'orden-1',
          codigo: 'OC-1',
          fechaEmision: null,
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 5000 }] }],
        },
      ],
    })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path)).toEqual([
      ['ordenesDeCompra', 0, 'fechaEmision'],
    ])
  })

  it('rechaza un anio repetido en la misma solicitud de una orden de compra', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      ordenesDeCompra: [
        {
          id: null,
          claveFormulario: 'orden-1',
          codigo: 'OC-1',
          fechaEmision: new Date(2026, 5, 1),
          solicitantes: [
            {
              claveFormulario: 'clave-1',
              montos: [
                { anio: '2026', monto: 5000 },
                { anio: '2026', monto: 3000 },
              ],
            },
          ],
        },
      ],
    })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path)).toEqual([
      ['ordenesDeCompra', 0, 'solicitantes', 0, 'montos', 1, 'anio'],
    ])
  })

  it('rechaza una solicitud de la orden de compra sin anios', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      ordenesDeCompra: [
        {
          id: null,
          claveFormulario: 'orden-1',
          codigo: 'OC-1',
          fechaEmision: new Date(2026, 5, 1),
          solicitantes: [{ claveFormulario: 'clave-1', montos: [] }],
        },
      ],
    })

    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path)).toEqual([
      ['ordenesDeCompra', 0, 'solicitantes', 0, 'montos'],
    ])
  })

  it('rechaza una factura sin lineas', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      facturas: [{ id: null, folio: 8801, fechaEmision: new Date(2026, 6, 1), montos: [] }],
    })

    expect(resultado.success).toBe(false)
  })

  it('acepta una factura con una linea valida', () => {
    const resultado = transaccionSchema.safeParse({
      ...transaccionBase,
      facturas: [
        {
          id: null,
          folio: 8801,
          fechaEmision: new Date(2026, 6, 1),
          montos: [{ montoOrdenCompraId: '300', monto: 3000 }],
        },
      ],
    })

    expect(resultado.success).toBe(true)
  })
})
