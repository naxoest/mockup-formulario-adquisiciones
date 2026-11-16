import { describe, expect, it } from 'vitest'
import { esClaveFiltro, filtrarUsuarios } from './filtrosUsuario'
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
  roles: [{ id: 2, nombre: 'Adquisiciones' }],
}

const activo = base
const inactivo: Usuario = { ...base, run: 8765432, estaActivo: false, roles: [] }
const conDosRoles: Usuario = {
  ...base,
  run: 20123456,
  roles: [
    { id: 3, nombre: 'Finanzas' },
    { id: 5, nombre: 'Solicitante' },
  ],
}

const usuarios = [activo, inactivo, conDosRoles]

describe('esClaveFiltro', () => {
  it('reconoce las claves declaradas', () => {
    expect(esClaveFiltro('estado')).toBe(true)
    expect(esClaveFiltro('rol')).toBe(true)
  })

  it('rechaza una clave desconocida', () => {
    expect(esClaveFiltro('campus')).toBe(false)
  })
})

describe('filtrarUsuarios', () => {
  it('devuelve todo cuando no hay filtros', () => {
    expect(filtrarUsuarios(usuarios, {})).toHaveLength(3)
  })

  it('devuelve todo cuando el filtro esta vacio', () => {
    expect(filtrarUsuarios(usuarios, { estado: [] })).toHaveLength(3)
  })

  it('filtra por estado activo', () => {
    const resultado = filtrarUsuarios(usuarios, { estado: ['activo'] })
    expect(resultado).toHaveLength(2)
    expect(resultado.every((usuario) => usuario.estaActivo)).toBe(true)
  })

  it('filtra por estado inactivo', () => {
    const resultado = filtrarUsuarios(usuarios, { estado: ['inactivo'] })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].run).toBe(8765432)
  })

  it('filtra por un rol', () => {
    const resultado = filtrarUsuarios(usuarios, { rol: ['5'] })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].run).toBe(20123456)
  })

  it('incluye al usuario que tiene alguno de los roles seleccionados', () => {
    const resultado = filtrarUsuarios(usuarios, { rol: ['2', '3'] })
    expect(resultado).toHaveLength(2)
  })

  it('excluye al usuario sin roles cuando se filtra por rol', () => {
    const resultado = filtrarUsuarios(usuarios, { rol: ['2'] })
    expect(resultado.some((usuario) => usuario.run === 8765432)).toBe(false)
  })

  it('combina dos filtros exigiendo ambos', () => {
    const resultado = filtrarUsuarios(usuarios, { estado: ['activo'], rol: ['3'] })
    expect(resultado).toHaveLength(1)
    expect(resultado[0].run).toBe(20123456)
  })

  it('ignora una clave desconocida en vez de romper', () => {
    expect(filtrarUsuarios(usuarios, { campus: ['osorno'] })).toHaveLength(3)
  })
})
