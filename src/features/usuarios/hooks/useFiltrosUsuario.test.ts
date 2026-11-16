import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFiltrosUsuario } from './useFiltrosUsuario'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const base: Usuario = {
  run: 12345678,
  digitoVerificador: '5',
  emailInstitucional: 'c.fernandez@inst.cl',
  emailEstudiantil: null,
  nombres: 'Camila',
  apellidoPaterno: 'Fernández',
  apellidoMaterno: 'Rojas',
  esEstudiante: false,
  estaActivo: true,
  fotoUrl: null,
  portada: null,
  creadoEn: '2026-03-02T13:45:00.000Z',
  actualizadoEn: '2026-03-02T13:45:00.000Z',
  roles: [],
}

const usuarios = [base, { ...base, run: 8765432, estaActivo: false }]

describe('useFiltrosUsuario', () => {
  it('inicia sin filtros y devuelve todos los usuarios', () => {
    const { result } = renderHook(() => useFiltrosUsuario(usuarios))
    expect(result.current.valores).toEqual({})
    expect(result.current.usuariosFiltrados).toHaveLength(2)
  })

  it('aplica un filtro al cambiarlo', () => {
    const { result } = renderHook(() => useFiltrosUsuario(usuarios))

    act(() => {
      result.current.cambiarFiltro('estado', ['inactivo'])
    })

    expect(result.current.usuariosFiltrados).toHaveLength(1)
    expect(result.current.usuariosFiltrados[0].run).toBe(8765432)
  })

  it('conserva los demas filtros al cambiar uno', () => {
    const { result } = renderHook(() => useFiltrosUsuario(usuarios))

    act(() => {
      result.current.cambiarFiltro('estado', ['activo'])
    })
    act(() => {
      result.current.cambiarFiltro('rol', ['1'])
    })

    expect(result.current.valores).toEqual({ estado: ['activo'], rol: ['1'] })
  })

  it('restaura el listado completo al limpiar', () => {
    const { result } = renderHook(() => useFiltrosUsuario(usuarios))

    act(() => {
      result.current.cambiarFiltro('estado', ['inactivo'])
    })
    act(() => {
      result.current.limpiarFiltros()
    })

    expect(result.current.valores).toEqual({})
    expect(result.current.usuariosFiltrados).toHaveLength(2)
  })
})
