import { useCallback, useState } from 'react'
import { CLAVES_FILTRO } from '@/features/transacciones/components/TransaccionesTable/filtros'
import type { ClaveFiltro } from '@/features/transacciones/components/TransaccionesTable/filtros'

export type ValoresFiltro = Partial<Record<ClaveFiltro, string[]>>

function esClaveFiltro(clave: string): clave is ClaveFiltro {
  return (CLAVES_FILTRO as readonly string[]).includes(clave)
}

export function useFiltrosTransaccion() {
  const [valores, setValores] = useState<ValoresFiltro>({})

  const cambiarFiltro = useCallback((clave: string, siguientes: string[]) => {
    if (!esClaveFiltro(clave)) {
      return
    }

    setValores((previos) => ({ ...previos, [clave]: siguientes }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setValores({})
  }, [])

  return { valores, cambiarFiltro, limpiarFiltros }
}
