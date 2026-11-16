import { ApiError } from '@/lib/apiClient'
import type { Area } from 'react-easy-crop'
import type { ImagenProcesada } from '@/features/usuarios/types/imagen.types'

export const TIPOS_IMAGEN_ADMITIDOS = ['image/jpeg', 'image/png', 'image/webp'] as const

export const TAMANO_MAXIMO_IMAGEN = 10 * 1024 * 1024

export const LADO_FOTO = 400

const CALIDAD_JPEG = 0.9

const MENSAJES_DEL_SERVIDOR: Partial<Record<number, string>> = {
  413: 'La imagen supera el tamaño que admite el servidor.',
  415: 'El servidor no admite el formato de la imagen.',
  422: 'El servidor no reconoció el archivo como una imagen válida.',
}

export function validarArchivoImagen(archivo: File): string | null {
  if (!(TIPOS_IMAGEN_ADMITIDOS as readonly string[]).includes(archivo.type)) {
    return 'La imagen debe estar en formato JPEG, PNG o WebP.'
  }

  if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
    return 'La imagen no puede superar los 10 MB.'
  }

  return null
}

export function validarDimensionesFoto(ancho: number, alto: number): string | null {
  if (ancho >= LADO_FOTO && alto >= LADO_FOTO) {
    return null
  }

  return `La imagen debe medir al menos ${LADO_FOTO} × ${LADO_FOTO} píxeles.`
}

export function mensajeErrorFoto(falla: unknown, respaldo: string): string {
  if (falla instanceof ApiError) {
    return MENSAJES_DEL_SERVIDOR[falla.status] ?? falla.message
  }

  return respaldo
}

export async function cargarImagen(url: string): Promise<HTMLImageElement> {
  const imagen = new Image()
  imagen.src = url
  await imagen.decode()
  return imagen
}

export async function recortarFoto(imagen: HTMLImageElement, area: Area): Promise<ImagenProcesada> {
  const lienzo = document.createElement('canvas')
  lienzo.width = LADO_FOTO
  lienzo.height = LADO_FOTO

  const contexto = lienzo.getContext('2d')

  if (contexto === null) {
    throw new Error('El navegador no permite procesar imágenes.')
  }

  contexto.fillStyle = 'white'
  contexto.fillRect(0, 0, LADO_FOTO, LADO_FOTO)
  contexto.imageSmoothingQuality = 'high'
  contexto.drawImage(imagen, area.x, area.y, area.width, area.height, 0, 0, LADO_FOTO, LADO_FOTO)

  const blob = await new Promise<Blob | null>((resolver) => {
    lienzo.toBlob(resolver, 'image/jpeg', CALIDAD_JPEG)
  })

  if (blob === null) {
    throw new Error('No se pudo generar la imagen.')
  }

  return { datos: await blob.arrayBuffer(), tipo: 'image/jpeg' }
}
