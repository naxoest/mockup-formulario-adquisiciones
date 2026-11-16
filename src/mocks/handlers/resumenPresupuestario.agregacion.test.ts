import { describe, expect, it } from 'vitest'
import { agregarResumenPresupuestario } from '@/mocks/handlers/resumenPresupuestario.agregacion'
import type {
  FacturaParaResumen,
  MontoFacturaParaResumen,
  MontoOrdenParaResumen,
  OrdenParaResumen,
  SolicitudParaResumen,
  TransaccionParaResumen,
} from '@/mocks/handlers/resumenPresupuestario.agregacion'

const CORTE = new Date(2026, 9, 5)

function transaccion(
  fecha: string,
  datos: Partial<Omit<TransaccionParaResumen, 'fecha'>> = {},
): TransaccionParaResumen {
  return { fecha, solicitudes: [], ordenesDeCompra: [], facturas: [], ...datos }
}

function solicitud(monto: number, anio = 2026): SolicitudParaResumen {
  return { precompromisos: [{ anio, monto }] }
}

function orden(fechaEmision: string, montos: MontoOrdenParaResumen[]): OrdenParaResumen {
  return { fechaEmision, montos }
}

function factura(fechaEmision: string, montos: MontoFacturaParaResumen[]): FacturaParaResumen {
  return { fechaEmision, montos }
}

describe('agregarResumenPresupuestario', () => {
  it('entrega la fecha de corte y una serie vacia sin movimientos', () => {
    expect(agregarResumenPresupuestario([], CORTE)).toEqual({
      fechaCorte: '2026-10-05',
      cantidadTransacciones: 0,
      serie: [],
    })
  })

  it('cuenta las transacciones del anio del resumen hasta la fecha de corte, incluidos los borradores', () => {
    const { cantidadTransacciones } = agregarResumenPresupuestario(
      [
        transaccion('2025-12-31'),
        transaccion('2026-01-15'),
        transaccion('2026-06-10'),
        transaccion('2026-10-05'),
        transaccion('2026-10-06'),
      ],
      CORTE,
    )

    expect(cantidadTransacciones).toBe(3)
  })

  it('acumula por mes y repite el acumulado en los meses intermedios sin movimiento', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-03-10', { solicitudes: [solicitud(5000000)] }),
        transaccion('2026-04-02', {
          solicitudes: [solicitud(3000000)],
          ordenesDeCompra: [orden('2026-04-02', [{ id: 1, anio: 2026, monto: 3000000 }])],
          facturas: [factura('2026-06-20', [{ montoOrdenCompraId: 1, monto: 2000000 }])],
        }),
        transaccion('2026-06-15', {
          ordenesDeCompra: [orden('2026-06-15', [{ id: 2, anio: 2026, monto: 1500000 }])],
        }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Marzo', precompromiso: 5000000, compromiso: 0, facturado: 0 },
      { periodo: 'Abril', precompromiso: 8000000, compromiso: 3000000, facturado: 0 },
      { periodo: 'Mayo', precompromiso: 8000000, compromiso: 3000000, facturado: 0 },
      { periodo: 'Junio', precompromiso: 8000000, compromiso: 4500000, facturado: 2000000 },
    ])
  })

  it('imputa el compromiso a la fecha de emision de la orden y no a la de la transaccion', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-02-10', {
          ordenesDeCompra: [orden('2026-05-20', [{ id: 1, anio: 2026, monto: 800000 }])],
        }),
      ],
      CORTE,
    )

    expect(serie).toEqual([{ periodo: 'Mayo', precompromiso: 0, compromiso: 800000, facturado: 0 }])
  })

  it('agrupa lo facturado por la fecha de emision y suma todas sus lineas', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-05-10', {
          ordenesDeCompra: [
            orden('2026-05-12', [
              { id: 1, anio: 2026, monto: 400000 },
              { id: 2, anio: 2026, monto: 100000 },
            ]),
          ],
          facturas: [
            factura('2026-07-03', [
              { montoOrdenCompraId: 1, monto: 400000 },
              { montoOrdenCompraId: 2, monto: 100000 },
            ]),
          ],
        }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Mayo', precompromiso: 0, compromiso: 500000, facturado: 0 },
      { periodo: 'Junio', precompromiso: 0, compromiso: 500000, facturado: 0 },
      { periodo: 'Julio', precompromiso: 0, compromiso: 500000, facturado: 500000 },
    ])
  })

  it('solo considera los montos del periodo presupuestario de la fecha de corte', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2025-06-10', { solicitudes: [solicitud(900000, 2025)] }),
        transaccion('2026-03-10', {
          solicitudes: [
            {
              precompromisos: [
                { anio: 2026, monto: 400000 },
                { anio: 2027, monto: 600000 },
              ],
            },
          ],
          ordenesDeCompra: [
            orden('2026-04-15', [
              { id: 1, anio: 2026, monto: 300000 },
              { id: 2, anio: 2027, monto: 500000 },
            ]),
          ],
          facturas: [
            factura('2026-05-08', [
              { montoOrdenCompraId: 1, monto: 300000 },
              { montoOrdenCompraId: 2, monto: 200000 },
            ]),
          ],
        }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Marzo', precompromiso: 400000, compromiso: 0, facturado: 0 },
      { periodo: 'Abril', precompromiso: 400000, compromiso: 300000, facturado: 0 },
      { periodo: 'Mayo', precompromiso: 400000, compromiso: 300000, facturado: 300000 },
    ])
  })

  it('imputa a enero los montos del periodo de corte registrados en un periodo anterior', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2025-11-20', {
          solicitudes: [solicitud(900000)],
          ordenesDeCompra: [orden('2025-12-15', [{ id: 1, anio: 2026, monto: 700000 }])],
          facturas: [factura('2025-12-28', [{ montoOrdenCompraId: 1, monto: 200000 }])],
        }),
        transaccion('2026-02-03', { solicitudes: [solicitud(100000)] }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Enero', precompromiso: 900000, compromiso: 700000, facturado: 200000 },
      { periodo: 'Febrero', precompromiso: 1000000, compromiso: 700000, facturado: 200000 },
    ])
  })

  it('excluye lo ocurrido despues de la fecha de corte', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-10-05', {
          solicitudes: [solicitud(100000)],
          ordenesDeCompra: [orden('2026-10-06', [{ id: 1, anio: 2026, monto: 700000 }])],
          facturas: [factura('2026-10-06', [{ montoOrdenCompraId: 1, monto: 50000 }])],
        }),
        transaccion('2026-10-06', { solicitudes: [solicitud(300000)] }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Octubre', precompromiso: 100000, compromiso: 0, facturado: 0 },
    ])
  })

  it('no considera movimiento una solicitud sin precompromisos', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-02-11', { solicitudes: [{ precompromisos: [] }] }),
        transaccion('2026-03-04', { solicitudes: [solicitud(250000)] }),
      ],
      CORTE,
    )

    expect(serie).toEqual([
      { periodo: 'Marzo', precompromiso: 250000, compromiso: 0, facturado: 0 },
    ])
  })

  it('omite las lineas de factura que no referencian una linea de orden de la transaccion', () => {
    const { serie } = agregarResumenPresupuestario(
      [
        transaccion('2026-04-01', {
          facturas: [factura('2026-04-10', [{ montoOrdenCompraId: 99, monto: 300000 }])],
        }),
      ],
      CORTE,
    )

    expect(serie).toEqual([])
  })

  it('nombra los doce meses con mayuscula inicial', () => {
    const transacciones = Array.from({ length: 12 }, (_, indice) =>
      transaccion(`2026-${String(indice + 1).padStart(2, '0')}-01`, {
        solicitudes: [solicitud(1)],
      }),
    )

    const { serie } = agregarResumenPresupuestario(transacciones, new Date(2026, 11, 31))

    expect(serie.map((elemento) => elemento.periodo)).toEqual([
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ])
    expect(serie.map((elemento) => elemento.precompromiso)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })
})
