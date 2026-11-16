import { useCallback, useMemo, useState } from 'react'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import {
  esClaveFiltro,
  filtrarRequerimientos,
  VALORES_FILTRO_INICIALES,
  type ValoresFiltro,
} from '@/features/requerimientos/utils/filtrosRequerimiento'

export function useFiltrosRequerimiento(requerimientos: Requerimiento[]) {
  const [valores, setValores] = useState<ValoresFiltro>(VALORES_FILTRO_INICIALES)

  const cambiarFiltro = useCallback((clave: string, siguientes: string[]) => {
    if (!esClaveFiltro(clave)) {
      return
    }

    setValores((previos) => ({ ...previos, [clave]: siguientes }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setValores(VALORES_FILTRO_INICIALES)
  }, [])

  const filasFiltradas = useMemo(
    () => filtrarRequerimientos(requerimientos, valores),
    [requerimientos, valores],
  )

  return { valores, cambiarFiltro, limpiarFiltros, filasFiltradas }
}
