import { describe, expect, it } from 'vitest'
import { CLAVES_FILTRO, construirFiltrosTransaccion } from './filtros'

const ANALISTAS = [
  { run: 16234875, nombre: 'Camila Ferrada' },
  { run: 17890123, nombre: 'Rodrigo Paillán' },
]

describe('construirFiltrosTransaccion', () => {
  const filtros = construirFiltrosTransaccion(ANALISTAS)

  it('define un filtro por cada clave declarada cuando recibe el catalogo de analistas', () => {
    const declaradas = [...CLAVES_FILTRO].sort()
    const definidas = filtros.map((filtro) => filtro.key).sort()

    expect(definidas).toEqual(declaradas)
  })

  it('omite el filtro de analista principal sin catalogo de analistas', () => {
    const claves = construirFiltrosTransaccion(null).map((filtro) => filtro.key)

    expect(claves).not.toContain('principal')
  })

  it('no repite claves entre filtros', () => {
    const claves = filtros.map((filtro) => filtro.key)

    expect(new Set(claves).size).toBe(claves.length)
  })

  it('declara todos los filtros como seleccion multiple', () => {
    expect(filtros.every((filtro) => filtro.type === 'multi')).toBe(true)
  })

  it('no repite valores dentro de un mismo filtro', () => {
    for (const filtro of filtros) {
      if (filtro.type !== 'multi') continue

      const valores = filtro.options.map((opcion) => opcion.value)

      expect(new Set(valores).size).toBe(valores.length)
    }
  })
})
