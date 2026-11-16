import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useConfirm } from '@/components/ui/Modal'
import { heartbeat } from '@/features/auth/api'
import { authSessionKey, sessionQueryOptions } from '@/features/auth/session'
import { ApiError, setCsrfToken } from '@/lib/apiClient'
import type { AuthSession } from '@/features/auth/types'

const WARNING_THRESHOLD_MS = 60 * 1000
const HEARTBEAT_MIN_INTERVAL_MS = 5 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

export function useSessionExpiry() {
  const queryClient = useQueryClient()
  const { data, dataUpdatedAt } = useQuery(sessionQueryOptions)
  const confirm = useConfirm()

  const hasSession = data !== null && data !== undefined
  const deadline = hasSession ? dataUpdatedAt + data.sesion.remaining_seconds * 1000 : null

  const confirmRef = useRef(confirm)
  useEffect(() => {
    confirmRef.current = confirm
  })

  const lastActivityRef = useRef(0)
  const heartbeatInFlightRef = useRef(false)
  const warningShownRef = useRef(false)
  const expiredRef = useRef(false)

  const applyHeartbeat = (response: { sesion: AuthSession['sesion']; csrf_token: string }) => {
    queryClient.setQueryData<AuthSession | null>(authSessionKey, (current) =>
      current ? { ...current, sesion: response.sesion, csrf_token: response.csrf_token } : current,
    )
  }

  const expireSession = () => {
    if (expiredRef.current) return
    expiredRef.current = true
    queryClient.setQueryData(authSessionKey, null)
    setCsrfToken(null)
  }

  useEffect(() => {
    if (hasSession) {
      expiredRef.current = false
    }
  }, [hasSession])

  useEffect(() => {
    const markActivity = () => {
      lastActivityRef.current = Date.now()
    }
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, markActivity, { passive: true })
    })
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, markActivity)
      })
    }
  }, [])

  useEffect(() => {
    if (deadline === null) return
    warningShownRef.current = false
    const delay = Math.max(0, deadline - WARNING_THRESHOLD_MS - Date.now())
    const id = window.setTimeout(() => {
      if (expiredRef.current || warningShownRef.current) return
      warningShownRef.current = true
      void confirmRef.current({
        title: 'Su sesión está por expirar',
        message:
          'Por inactividad, la sesión se cerrará en menos de un minuto. ¿Desea continuar conectado?',
        variant: 'warning',
        confirmText: 'Continuar sesión',
        cancelText: 'Ignorar',
        onConfirm: async () => {
          const response = await heartbeat()
          applyHeartbeat(response)
        },
      })
    }, delay)
    return () => {
      window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyHeartbeat es estable y confirmRef es una ref; el aviso debe reprogramarse solo cuando cambia el deadline.
  }, [deadline])

  useEffect(() => {
    if (deadline === null) return
    const delay = Math.max(0, deadline - Date.now())
    const id = window.setTimeout(() => {
      expireSession()
    }, delay)
    return () => {
      window.clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- expireSession es estable; la expiración debe reprogramarse solo cuando cambia el deadline.
  }, [deadline])

  useEffect(() => {
    if (deadline === null) return
    const syncedAt = dataUpdatedAt
    const id = window.setInterval(() => {
      if (expiredRef.current) return
      if (warningShownRef.current) return
      if (heartbeatInFlightRef.current) return
      if (lastActivityRef.current <= syncedAt) return
      heartbeatInFlightRef.current = true
      heartbeat()
        .then(applyHeartbeat)
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            expireSession()
            return
          }
          console.error('useSessionExpiry: fallo el heartbeat automatico', error)
        })
        .finally(() => {
          heartbeatInFlightRef.current = false
        })
    }, HEARTBEAT_MIN_INTERVAL_MS)
    return () => {
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyHeartbeat y expireSession son estables; syncedAt captura la última sincronización del mismo render que el deadline.
  }, [deadline, dataUpdatedAt])
}
