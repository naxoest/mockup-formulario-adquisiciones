import { useCallback, useMemo, useState } from 'react'
import {
  filtrarMonitoreo,
  VALOR_ESTADO_ABIERTO,
} from '@/features/transacciones/utils/filtrosMonitoreo'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'

const VALORES_INICIALES: Record<string, string[]> = { estado: [VALOR_ESTADO_ABIERTO] }

export function useFiltrosMonitoreo(filas: FilaMonitoreo[]) {
  const [valores, setValores] = useState<Record<string, string[]>>(VALORES_INICIALES)

  const filasFiltradas = useMemo(() => filtrarMonitoreo(filas, valores), [filas, valores])

  const cambiarFiltro = useCallback((clave: string, siguientes: string[]) => {
    setValores((previos) => ({ ...previos, [clave]: siguientes }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setValores({})
  }, [])

  return { valores, cambiarFiltro, limpiarFiltros, filasFiltradas }
}
