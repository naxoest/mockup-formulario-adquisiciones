import { AUTOR_SIMULADO } from '@/mocks/data/requerimientos.mock'
import { proyectosMock } from '@/mocks/data/proyectos.mock'

const FECHA_REGISTRO_INICIAL = '2026-01-05T09:00:00'

export interface ProyectoAlmacenado {
  id: number
  cr: number
  nombre: string
  activo: boolean
  registradoPor: string
  fechaRegistro: string
}

function crearProyectosIniciales(): ProyectoAlmacenado[] {
  return proyectosMock.map((proyecto) => ({
    id: proyecto.id,
    cr: proyecto.cr,
    nombre: proyecto.nombre,
    activo: proyecto.activo ?? true,
    registradoPor: AUTOR_SIMULADO,
    fechaRegistro: FECHA_REGISTRO_INICIAL,
  }))
}

let proyectos = crearProyectosIniciales()

export function restablecerProyectos(): void {
  proyectos = crearProyectosIniciales()
}

export function obtenerProyectos(): ProyectoAlmacenado[] {
  return proyectos
}

export function buscarProyecto(id: number): ProyectoAlmacenado | undefined {
  return proyectos.find((proyecto) => proyecto.id === id)
}

export function siguienteIdProyecto(): number {
  return proyectos.length > 0 ? Math.max(...proyectos.map((proyecto) => proyecto.id)) + 1 : 1
}

export function agregarProyecto(proyecto: ProyectoAlmacenado): void {
  proyectos.push(proyecto)
}

export function reemplazarProyecto(proyecto: ProyectoAlmacenado): void {
  proyectos = proyectos.map((actual) => (actual.id === proyecto.id ? proyecto : actual))
}
