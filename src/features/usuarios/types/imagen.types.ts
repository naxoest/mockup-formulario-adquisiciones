export interface ImagenProcesada {
  datos: ArrayBuffer
  tipo: string
}

export type EncuadrePortada = `object-[${string}]`

export interface PortadaCatalogo {
  clave: string
  nombre: string
  encuadre: EncuadrePortada
}

export interface PortadaResuelta extends PortadaCatalogo {
  src: string
  srcSet: string
  miniatura: string
}
