import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/apiClient'
import {
  mensajeErrorFoto,
  TAMANO_MAXIMO_IMAGEN,
  validarArchivoImagen,
  validarDimensionesFoto,
} from './imagen'

function archivo(tipo: string, bytes = 1): File {
  return new File([new Uint8Array(bytes)], 'imagen', { type: tipo })
}

describe('validarArchivoImagen', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('acepta %s', (tipo) => {
    expect(validarArchivoImagen(archivo(tipo))).toBeNull()
  })

  it.each(['image/gif', 'image/svg+xml', 'image/heic', 'application/pdf', ''])(
    'rechaza el tipo "%s"',
    (tipo) => {
      expect(validarArchivoImagen(archivo(tipo))).toBe(
        'La imagen debe estar en formato JPEG, PNG o WebP.',
      )
    },
  )

  it('acepta una imagen del tamaño maximo', () => {
    expect(validarArchivoImagen(archivo('image/jpeg', TAMANO_MAXIMO_IMAGEN))).toBeNull()
  })

  it('rechaza una imagen de mas de 10 MB', () => {
    expect(validarArchivoImagen(archivo('image/jpeg', TAMANO_MAXIMO_IMAGEN + 1))).toBe(
      'La imagen no puede superar los 10 MB.',
    )
  })
})

describe('validarDimensionesFoto', () => {
  it('acepta una imagen de 400 por 400 pixeles', () => {
    expect(validarDimensionesFoto(400, 400)).toBeNull()
  })

  it('rechaza una imagen con un lado menor a 400 pixeles', () => {
    expect(validarDimensionesFoto(1200, 399)).toBe(
      'La imagen debe medir al menos 400 × 400 píxeles.',
    )
  })
})

describe('mensajeErrorFoto', () => {
  it.each([
    [413, 'La imagen supera el tamaño que admite el servidor.'],
    [415, 'El servidor no admite el formato de la imagen.'],
    [422, 'El servidor no reconoció el archivo como una imagen válida.'],
  ])('traduce el estado %i', (estado, mensaje) => {
    const falla = new ApiError(estado, { error: 'texto del servidor' })

    expect(mensajeErrorFoto(falla, 'respaldo')).toBe(mensaje)
  })

  it('usa el mensaje del servidor para otros estados', () => {
    const falla = new ApiError(500, { error: 'Respuesta inesperada del servidor' })

    expect(mensajeErrorFoto(falla, 'respaldo')).toBe('Respuesta inesperada del servidor')
  })

  it('usa el respaldo para fallas que no vienen del servidor', () => {
    expect(mensajeErrorFoto(new Error('sin red'), 'respaldo')).toBe('respaldo')
  })
})
