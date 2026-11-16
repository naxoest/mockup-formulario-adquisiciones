import { CATALOGO_PORTADAS, claveDeArchivo } from '@/features/usuarios/utils/portadas'
import type { PortadaResuelta } from '@/features/usuarios/types/imagen.types'

const conjuntos = import.meta.glob<string>('/src/assets/portadas/*.{jpg,jpeg,png,webp}', {
  query: '?w=1200;2400&withoutEnlargement&format=webp&as=srcset',
  import: 'default',
  eager: true,
})

const fuentes = import.meta.glob<string>('/src/assets/portadas/*.{jpg,jpeg,png,webp}', {
  query: '?w=1200&withoutEnlargement&format=webp',
  import: 'default',
  eager: true,
})

const miniaturas = import.meta.glob<string>('/src/assets/portadas/*.{jpg,jpeg,png,webp}', {
  query: '?w=600&withoutEnlargement&format=webp',
  import: 'default',
  eager: true,
})

function porClave(importados: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(importados).map(([ruta, valor]) => [claveDeArchivo(ruta), valor]))
}

const conjuntosPorClave = porClave(conjuntos)
const fuentesPorClave = porClave(fuentes)
const miniaturasPorClave = porClave(miniaturas)

export const PORTADAS: readonly PortadaResuelta[] = CATALOGO_PORTADAS.flatMap((portada) => {
  const srcSet = conjuntosPorClave.get(portada.clave)
  const src = fuentesPorClave.get(portada.clave)
  const miniatura = miniaturasPorClave.get(portada.clave)

  if (srcSet === undefined || src === undefined || miniatura === undefined) {
    return []
  }

  return [{ ...portada, src, srcSet, miniatura }]
})

export function buscarPortada(clave: string | null): PortadaResuelta | undefined {
  return clave === null ? undefined : PORTADAS.find((portada) => portada.clave === clave)
}
