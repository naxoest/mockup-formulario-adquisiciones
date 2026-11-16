import { describe, expect, it } from 'vitest'
import { CATALOGO_PORTADAS, claveDeArchivo } from './portadas'

const ARCHIVOS = Object.keys(import.meta.glob('/src/assets/portadas/*.{jpg,jpeg,png,webp}'))

const FORMATO_DE_CLAVE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

describe('claveDeArchivo', () => {
  it('toma el nombre del archivo sin su extension', () => {
    expect(claveDeArchivo('/src/assets/portadas/volcan-osorno.jpg')).toBe('volcan-osorno')
  })
})

describe('CATALOGO_PORTADAS', () => {
  it('registra exactamente los archivos de la carpeta de portadas', () => {
    const claves = CATALOGO_PORTADAS.map((portada) => portada.clave).sort()

    expect(ARCHIVOS.map(claveDeArchivo).sort()).toEqual(claves)
  })

  it('usa claves que cumplen el formato del contrato', () => {
    for (const { clave } of CATALOGO_PORTADAS) {
      expect(clave).toMatch(FORMATO_DE_CLAVE)
      expect(clave.length).toBeLessThanOrEqual(50)
    }
  })

  it('no repite claves', () => {
    const claves = CATALOGO_PORTADAS.map((portada) => portada.clave)

    expect(new Set(claves).size).toBe(claves.length)
  })
})
