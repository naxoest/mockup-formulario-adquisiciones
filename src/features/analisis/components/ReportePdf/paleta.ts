const BASE = { r: 0, g: 60, b: 166 }
const ACLARADO_MAXIMO = 0.74

function mezclarConBlanco(proporcion: number): string {
  const canal = (valor: number) =>
    Math.round(valor + (255 - valor) * proporcion)
      .toString(16)
      .padStart(2, '0')

  return `#${canal(BASE.r)}${canal(BASE.g)}${canal(BASE.b)}`
}

export function tintasSecuenciales(cantidad: number): string[] {
  if (cantidad <= 1) return [mezclarConBlanco(0)]

  return Array.from({ length: cantidad }, (_, indice) =>
    mezclarConBlanco((indice / (cantidad - 1)) * ACLARADO_MAXIMO),
  )
}
