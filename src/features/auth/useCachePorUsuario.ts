import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { descartarDatosEnCache } from '@/features/auth/session'
import { useAuth } from '@/features/auth/useAuth'

export function useCachePorUsuario() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const runEnSesion = user?.run ?? null
  const ultimoRunRef = useRef(runEnSesion)

  useEffect(() => {
    if (runEnSesion === null) return

    const runAnterior = ultimoRunRef.current
    ultimoRunRef.current = runEnSesion

    if (runAnterior !== null && runAnterior !== runEnSesion) {
      descartarDatosEnCache(queryClient)
    }
  }, [runEnSesion, queryClient])
}
