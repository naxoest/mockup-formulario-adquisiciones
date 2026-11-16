import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFiltrosTransaccion } from './useFiltrosTransaccion'

describe('useFiltrosTransaccion', () => {
  it('inicia sin filtros seleccionados', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    expect(result.current.valores).toEqual({})
  })

  it('registra los valores de una clave conocida', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    act(() => {
      result.current.cambiarFiltro('campus', ['osorno'])
    })

    expect(result.current.valores).toEqual({ campus: ['osorno'] })
  })

  it('conserva los filtros previos al cambiar otra clave', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    act(() => {
      result.current.cambiarFiltro('campus', ['osorno'])
    })

    act(() => {
      result.current.cambiarFiltro('modalidad', ['agil'])
    })

    expect(result.current.valores).toEqual({ campus: ['osorno'], modalidad: ['agil'] })
  })

  it('reemplaza los valores de una clave ya presente', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    act(() => {
      result.current.cambiarFiltro('tipo', ['SABIENES'])
    })

    act(() => {
      result.current.cambiarFiltro('tipo', ['SASERVI'])
    })

    expect(result.current.valores).toEqual({ tipo: ['SASERVI'] })
  })

  it('ignora una clave que no pertenece al conjunto de filtros', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    act(() => {
      result.current.cambiarFiltro('inexistente', ['x'])
    })

    expect(result.current.valores).toEqual({})
  })

  it('limpia todos los filtros', () => {
    const { result } = renderHook(() => useFiltrosTransaccion())

    act(() => {
      result.current.cambiarFiltro('campus', ['osorno'])
    })

    act(() => {
      result.current.limpiarFiltros()
    })

    expect(result.current.valores).toEqual({})
  })
})
