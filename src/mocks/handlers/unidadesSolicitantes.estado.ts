import { AUTOR_SIMULADO } from '@/mocks/data/requerimientos.mock'
import { unidadesSolicitantesMock } from '@/mocks/data/unidadesSolicitantes.mock'

const FECHA_REGISTRO_INICIAL = '2026-01-05T09:00:00'

export interface UnidadSolicitanteAlmacenada {
  id: number
  cr: number
  nombre: string
  tipo: string
  sedes: string[]
  activo: boolean
  registradoPor: string
  fechaRegistro: string
}

function crearUnidadesIniciales(): UnidadSolicitanteAlmacenada[] {
  return unidadesSolicitantesMock.map((unidad) => ({
    id: unidad.id,
    cr: unidad.cr,
    nombre: unidad.label,
    tipo: unidad.tipoSolicitante,
    sedes: [...unidad.sedes],
    activo: true,
    registradoPor: AUTOR_SIMULADO,
    fechaRegistro: FECHA_REGISTRO_INICIAL,
  }))
}

let unidades = crearUnidadesIniciales()

export function restablecerUnidadesSolicitantes(): void {
  unidades = crearUnidadesIniciales()
}

export function obtenerUnidadesSolicitantes(): UnidadSolicitanteAlmacenada[] {
  return unidades
}

export function buscarUnidadSolicitante(id: number): UnidadSolicitanteAlmacenada | undefined {
  return unidades.find((unidad) => unidad.id === id)
}

export function siguienteIdUnidadSolicitante(): number {
  return Math.max(...unidades.map((unidad) => unidad.id)) + 1
}

export function agregarUnidadSolicitante(unidad: UnidadSolicitanteAlmacenada): void {
  unidades.push(unidad)
}

export function reemplazarUnidadSolicitante(unidad: UnidadSolicitanteAlmacenada): void {
  unidades = unidades.map((actual) => (actual.id === unidad.id ? unidad : actual))
}
