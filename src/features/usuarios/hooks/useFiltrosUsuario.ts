import { useCallback, useMemo, useState } from 'react'
import { filtrarUsuarios } from '@/features/usuarios/utils/filtrosUsuario'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

export function useFiltrosUsuario(usuarios: Usuario[]) {
  const [valores, setValores] = useState<Record<string, string[]>>({})

  const usuariosFiltrados = useMemo(() => filtrarUsuarios(usuarios, valores), [usuarios, valores])

  const cambiarFiltro = useCallback((clave: string, siguientes: string[]) => {
    setValores((previos) => ({ ...previos, [clave]: siguientes }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setValores({})
  }, [])

  return { valores, cambiarFiltro, limpiarFiltros, usuariosFiltrados }
}
