import { describe, expect, it } from 'vitest'
import { transaccionesMock } from '@/mocks/data/transacciones.mock'
import {
  obtenerTransacciones,
  restablecerTransacciones,
  siguienteIdMontoFactura,
  siguienteIdMontoOrdenDeCompra,
  siguienteIdOrdenDeCompra,
  siguienteIdSolicitud,
  siguienteIdTransaccion,
} from '@/mocks/handlers/transacciones.estado'

describe('transacciones.estado', () => {
  it('parte con el mismo contenido que la semilla', () => {
    restablecerTransacciones()

    expect(obtenerTransacciones()).toEqual(transaccionesMock)
  })

  it('no comparte referencias con la semilla', () => {
    restablecerTransacciones()

    const transaccion = obtenerTransacciones()[0]

    expect(transaccion).not.toBe(transaccionesMock[0])
    expect(transaccion.solicitudes[0]).not.toBe(transaccionesMock[0].solicitudes[0])
    expect(transaccion.solicitudes[0].precompromisos).not.toBe(
      transaccionesMock[0].solicitudes[0].precompromisos,
    )
    expect(transaccion.solicitudes[0].precompromisos[0]).not.toBe(
      transaccionesMock[0].solicitudes[0].precompromisos[0],
    )
    expect(transaccion.ordenesDeCompra[0].montos[0]).not.toBe(
      transaccionesMock[0].ordenesDeCompra[0].montos[0],
    )
  })

  it('mutar el estado no altera la semilla', () => {
    restablecerTransacciones()

    obtenerTransacciones()[0].solicitudes[0].precompromisos[0].monto = 1
    obtenerTransacciones()[0].ordenesDeCompra.push({
      id: 999,
      codigo: 'OC TEST',
      fechaEmision: '2026-03-02',
      estado: 'enviada_a_proveedor',
      montos: [],
    })

    expect(transaccionesMock[0].solicitudes[0].precompromisos[0].monto).toBe(2000000)
    expect(transaccionesMock[0].ordenesDeCompra).toHaveLength(1)
  })

  it('restablecer descarta las mutaciones', () => {
    restablecerTransacciones()
    obtenerTransacciones().pop()

    restablecerTransacciones()

    expect(obtenerTransacciones()).toHaveLength(transaccionesMock.length)
    expect(obtenerTransacciones()).toEqual(transaccionesMock)
  })

  it('entrega identificadores por encima del maximo de la semilla', () => {
    restablecerTransacciones()

    expect(siguienteIdTransaccion()).toBe(11)
    expect(siguienteIdSolicitud()).toBe(126)
    expect(siguienteIdOrdenDeCompra()).toBe(208)
    expect(siguienteIdMontoOrdenDeCompra()).toBe(323)
    expect(siguienteIdMontoFactura()).toBe(504)
  })

  it('no recicla identificadores tras eliminar', () => {
    restablecerTransacciones()

    const primero = siguienteIdSolicitud()
    obtenerTransacciones()[0].solicitudes.pop()
    const segundo = siguienteIdSolicitud()

    expect(segundo).toBe(primero + 1)
  })
})
