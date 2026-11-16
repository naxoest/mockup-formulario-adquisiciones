import type { PortadaCatalogo } from '@/features/usuarios/types/imagen.types'

export const CATALOGO_PORTADAS: readonly PortadaCatalogo[] = [
  { clave: 'sede-osorno', nombre: 'Sede Osorno', encuadre: 'object-[50%_25%]' },
  { clave: 'sede-puerto-montt', nombre: 'Sede Puerto Montt', encuadre: 'object-[50%_45%]' },
  { clave: 'sede-castro', nombre: 'Sede Castro', encuadre: 'object-[50%_100%]' },
  { clave: 'sede-santiago', nombre: 'Sede Santiago', encuadre: 'object-[50%_20%]' },
  { clave: 'santiago', nombre: 'Santiago', encuadre: 'object-[50%_25%]' },
  { clave: 'palafitos-de-chiloe', nombre: 'Palafitos de Chiloé', encuadre: 'object-[50%_25%]' },
  { clave: 'puerto-montt', nombre: 'Puerto Montt', encuadre: 'object-[50%_35%]' },
  { clave: 'volcan-osorno', nombre: 'Volcán Osorno', encuadre: 'object-[50%_20%]' },
  {
    clave: 'plaza-de-armas-de-osorno',
    nombre: 'Plaza de Armas de Osorno',
    encuadre: 'object-[50%_35%]',
  },
  {
    clave: 'saltos-del-petrohue',
    nombre: 'Saltos de Petrohué',
    encuadre: 'object-[50%_30%]',
  },
  {
    clave: 'torres-del-paine',
    nombre: 'Torres del Paine',
    encuadre: 'object-[50%_25%]',
  },
  {
    clave: 'la-union',
    nombre: 'La Unión',
    encuadre: 'object-[50%_25%]',
  },
  {
    clave: 'san-pablo',
    nombre: 'San Pablo',
    encuadre: 'object-[50%_25%]',
  },
  {
    clave: 'puerto-varas',
    nombre: 'Puerto Varas',
    encuadre: 'object-[50%_43%]',
  },
  {
    clave: 'parque-nacional-puyehue',
    nombre: 'Parque Nacional Puyehue',
    encuadre: 'object-[50%_40%]',
  },
  {
    clave: 'frutillar-bajo',
    nombre: 'Frutillar Bajo',
    encuadre: 'object-[50%_60%]',
  },
]

export function claveDeArchivo(ruta: string): string {
  const archivo = ruta.slice(ruta.lastIndexOf('/') + 1)
  const punto = archivo.lastIndexOf('.')
  return punto === -1 ? archivo : archivo.slice(0, punto)
}
