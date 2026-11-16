import { useCallback, useState } from 'react'
import { esClaveFiltroProyecto } from '@/features/mantenedor/utils/filtrosProyecto'

export function useFiltrosProyecto() {
  const [valores, setValores] = useState<Record<string, string[]>>({})

  const cambiarFiltro = useCallback((clave: string, siguientes: string[]) => {
    if (!esClaveFiltroProyecto(clave)) {
      return
    }

    setValores((previos) => ({ ...previos, [clave]: siguientes }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setValores({})
  }, [])

  return { valores, cambiarFiltro, limpiarFiltros }
}
