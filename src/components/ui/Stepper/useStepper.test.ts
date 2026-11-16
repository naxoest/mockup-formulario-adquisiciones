import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useStepper } from './useStepper'

describe('useStepper', () => {
  it('inicializa en 0 por default', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3 }))
    expect(result.current.active).toBe(0)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
    expect(result.current.isCompleted).toBe(false)
  })

  it('respeta initialStep', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3, initialStep: 1 }))
    expect(result.current.active).toBe(1)
  })

  it('next() avanza al siguiente paso', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3 }))
    act(() => result.current.next())
    expect(result.current.active).toBe(1)
  })

  it('previous() retrocede al paso anterior', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3, initialStep: 2 }))
    act(() => result.current.previous())
    expect(result.current.active).toBe(1)
  })

  it('previous() no baja de 0', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3 }))
    act(() => result.current.previous())
    expect(result.current.active).toBe(0)
  })

  it('next() permite llegar al estado completado', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 2 }))
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.active).toBe(2)
    expect(result.current.isCompleted).toBe(true)
  })

  it('next() no pasa de totalSteps', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 2 }))
    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.active).toBe(2)
  })

  it('goTo() navega al paso indicado', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 5 }))
    act(() => result.current.goTo(3))
    expect(result.current.active).toBe(3)
  })

  it('goTo() ignora índices fuera de rango', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3 }))
    act(() => result.current.goTo(-1))
    expect(result.current.active).toBe(0)
    act(() => result.current.goTo(10))
    expect(result.current.active).toBe(0)
  })

  it('reset() vuelve a initialStep', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3, initialStep: 1 }))
    act(() => result.current.next())
    act(() => result.current.reset())
    expect(result.current.active).toBe(1)
  })

  it('isLast es true en el último paso válido', () => {
    const { result } = renderHook(() => useStepper({ totalSteps: 3 }))
    act(() => result.current.goTo(2))
    expect(result.current.isLast).toBe(true)
  })
})
