import { describe, expect, it } from 'vitest'
import {
  busquedaMantenedorSchema,
  SECCION_INICIAL,
  SECCIONES_MANTENEDOR,
} from './busquedaMantenedor.schema'

describe('busquedaMantenedorSchema', () => {
  it('incluye carreras-y-unidades y proyectos en las secciones permitidas', () => {
    expect(SECCIONES_MANTENEDOR).toEqual(['carreras-y-unidades', 'proyectos'])
    expect(SECCION_INICIAL).toBe('carreras-y-unidades')
  })

  it('admite la seccion proyectos en los parametros de busqueda', () => {
    const resultado = busquedaMantenedorSchema.parse({ seccion: 'proyectos' })

    expect(resultado.seccion).toBe('proyectos')
  })

  it('descarta secciones desconocidas devolviendo undefined', () => {
    const resultado = busquedaMantenedorSchema.parse({ seccion: 'desconocida' })

    expect(resultado.seccion).toBeUndefined()
  })
})
