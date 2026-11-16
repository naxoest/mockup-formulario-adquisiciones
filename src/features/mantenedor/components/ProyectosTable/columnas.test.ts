import { describe, expect, it } from 'vitest'
import { construirColumnasProyectos } from './columnas'
import { construirFiltrosProyectos } from './filtros'

describe('construirColumnasProyectos', () => {
  it('define las columnas esperadas con sus campos y ordenamiento', () => {
    const columnas = construirColumnasProyectos()
    const campos = columnas.map((col) => col.field)

    expect(campos).toEqual(['nombre', 'cr', 'solicitudes', 'activo'])
    expect(columnas.every((col) => col.sortable)).toBe(true)
    expect(columnas.find((col) => col.field === 'activo')?.type).toBe('boolean')
  })
})

describe('construirFiltrosProyectos', () => {
  it('define el filtro por estado activo e inactivo', () => {
    const filtros = construirFiltrosProyectos()

    expect(filtros).toHaveLength(1)
    expect(filtros[0]).toEqual({
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
      ],
    })
  })
})
