import { describe, expect, it } from 'vitest'
import { esClaveFiltroProyecto } from './filtrosProyecto'

describe('esClaveFiltroProyecto', () => {
  it('reconoce las claves de filtro validas', () => {
    expect(esClaveFiltroProyecto('estado')).toBe(true)
    expect(esClaveFiltroProyecto('tipo')).toBe(false)
    expect(esClaveFiltroProyecto('sede')).toBe(false)
  })
})
