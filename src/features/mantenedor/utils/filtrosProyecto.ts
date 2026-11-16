export const CLAVES_FILTRO_PROYECTO = ['estado'] as const

export type ClaveFiltroProyecto = (typeof CLAVES_FILTRO_PROYECTO)[number]

export function esClaveFiltroProyecto(clave: string): clave is ClaveFiltroProyecto {
  return (CLAVES_FILTRO_PROYECTO as readonly string[]).includes(clave)
}
