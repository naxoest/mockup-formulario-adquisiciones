import { useCallback, useState } from 'react'
import { esClaveFiltro } from '@/features/mantenedor/utils/filtrosUnidad'

export function useFiltrosUnidad() {
  const [valores, setValores] = useState<Record<string, string[]>>({})

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
