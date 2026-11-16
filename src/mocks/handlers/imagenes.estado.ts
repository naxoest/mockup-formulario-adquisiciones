export interface ImagenSimulada {
  datos: ArrayBuffer
  tipoContenido: string
  version: string
}

const fotos = new Map<number, ImagenSimulada>()

let secuencia = 0

function nuevaVersion(): string {
  secuencia += 1
  return `${Date.now().toString(36)}-${secuencia.toString(36)}`
}

export function guardarFoto(
  run: number,
  datos: ArrayBuffer,
  tipoContenido: string,
): ImagenSimulada {
  const foto: ImagenSimulada = { datos, tipoContenido, version: nuevaVersion() }
  fotos.set(run, foto)
  return foto
}

export function obtenerFoto(run: number): ImagenSimulada | undefined {
  return fotos.get(run)
}

export function eliminarFoto(run: number): void {
  fotos.delete(run)
}

export function restablecerImagenes(): void {
  fotos.clear()
  secuencia = 0
}
