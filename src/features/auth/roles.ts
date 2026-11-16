export const NOMBRES_ROL = ['administrador', 'analista', 'solicitante'] as const

export type NombreRol = (typeof NOMBRES_ROL)[number]

const ETIQUETAS_ROL: Record<NombreRol, string> = {
  administrador: 'Administrador',
  analista: 'Analista',
  solicitante: 'Solicitante',
}

export function esNombreRol(nombre: string): nombre is NombreRol {
  return NOMBRES_ROL.some((rol) => rol === nombre)
}

export function etiquetaRol(nombre: string): string {
  return esNombreRol(nombre) ? ETIQUETAS_ROL[nombre] : nombre
}
