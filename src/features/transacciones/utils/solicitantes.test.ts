import { describe, expect, it } from 'vitest'
import { claveSolicitantePersistido, nuevaClaveSolicitante } from './solicitantes'

describe('claveSolicitantePersistido', () => {
  it('deriva la clave del identificador del servidor', () => {
    expect(claveSolicitantePersistido(1)).toBe('servidor-1')
  })

  it('produce la misma clave para el mismo identificador', () => {
    expect(claveSolicitantePersistido(7)).toBe(claveSolicitantePersistido(7))
  })

  it('produce claves distintas para identificadores distintos', () => {
    expect(claveSolicitantePersistido(1)).not.toBe(claveSolicitantePersistido(2))
  })
})

describe('nuevaClaveSolicitante', () => {
  it('produce una clave distinta en cada llamada', () => {
    expect(nuevaClaveSolicitante()).not.toBe(nuevaClaveSolicitante())
  })

  it('no colisiona con las claves derivadas del servidor', () => {
    const nuevas = Array.from({ length: 50 }, () => nuevaClaveSolicitante())
    const derivadas = Array.from({ length: 50 }, (_, indice) =>
      claveSolicitantePersistido(indice + 1),
    )

    expect(nuevas.some((clave) => derivadas.includes(clave))).toBe(false)
  })
})
