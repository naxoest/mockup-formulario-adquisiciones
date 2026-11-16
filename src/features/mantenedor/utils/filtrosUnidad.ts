export const CLAVES_FILTRO = ['tipo', 'sede', 'estado'] as const

export type ClaveFiltro = (typeof CLAVES_FILTRO)[number]

export function esClaveFiltro(clave: string): clave is ClaveFiltro {
  return (CLAVES_FILTRO as readonly string[]).includes(clave)
}
