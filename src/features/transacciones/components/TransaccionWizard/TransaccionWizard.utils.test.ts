import { describe, expect, it } from 'vitest'
import { getTransaccionDefaults, getUnidadSolicitanteDefaults } from './TransaccionWizard.utils'

describe('getUnidadSolicitanteDefaults', () => {
  it('marca al solicitante nuevo como no persistido', () => {
    expect(getUnidadSolicitanteDefaults().id).toBeNull()
  })

  it('asigna una clave de formulario distinta en cada llamada', () => {
    const primera = getUnidadSolicitanteDefaults().claveFormulario
    const segunda = getUnidadSolicitanteDefaults().claveFormulario

    expect(primera).not.toBe(segunda)
  })

  it('marca la unidad solicitante como no seleccionada', () => {
    expect(getUnidadSolicitanteDefaults().unidadId).toBeNull()
  })
})

describe('getTransaccionDefaults', () => {
  it('no incluye solicitantes al crear una transaccion', () => {
    expect(getTransaccionDefaults().solicitantes).toEqual([])
  })

  it('no incluye ordenes de compra ni facturas al crear una transaccion', () => {
    const defaults = getTransaccionDefaults()

    expect(defaults.ordenesDeCompra).toEqual([])
    expect(defaults.facturas).toEqual([])
  })

  it('marca la transaccion como no persistida', () => {
    expect(getTransaccionDefaults().id).toBeNull()
  })
})
