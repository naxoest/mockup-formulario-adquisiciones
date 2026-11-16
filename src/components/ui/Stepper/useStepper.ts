import { useCallback, useState } from 'react'

export interface UseStepperOptions {
  totalSteps: number
  initialStep?: number
}

export interface UseStepperReturn {
  active: number
  next: () => void
  previous: () => void
  goTo: (step: number) => void
  reset: () => void
  isFirst: boolean
  isLast: boolean
  isCompleted: boolean
}

export function useStepper({ totalSteps, initialStep = 0 }: UseStepperOptions): UseStepperReturn {
  const [active, setActive] = useState(initialStep)

  const next = useCallback(() => {
    setActive((current) => (current < totalSteps ? current + 1 : current))
  }, [totalSteps])

  const previous = useCallback(() => {
    setActive((current) => (current > 0 ? current - 1 : current))
  }, [])

  const goTo = useCallback(
    (step: number) => {
      if (step < 0 || step > totalSteps) return
      setActive(step)
    },
    [totalSteps],
  )

  const reset = useCallback(() => {
    setActive(initialStep)
  }, [initialStep])

  return {
    active,
    next,
    previous,
    goTo,
    reset,
    isFirst: active === 0,
    isLast: active === totalSteps - 1,
    isCompleted: active >= totalSteps,
  }
}
