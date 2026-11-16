// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { calcularHuella } from './huella'

function bytes(texto: string): ArrayBuffer {
  return new TextEncoder().encode(texto).slice().buffer
}

describe('calcularHuella', () => {
  it('calcula el SHA-256 en hexadecimal en minúsculas', async () => {
    await expect(calcularHuella(bytes('abc'))).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('calcula la huella de un contenido vacío', async () => {
    await expect(calcularHuella(new ArrayBuffer(0))).resolves.toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('produce huellas distintas para contenidos distintos', async () => {
    const [primera, segunda] = await Promise.all([
      calcularHuella(bytes('planilla 1')),
      calcularHuella(bytes('planilla 2')),
    ])

    expect(primera).toMatch(/^[0-9a-f]{64}$/)
    expect(primera).not.toBe(segunda)
  })
})
