import { describe, expect, it } from 'vitest'
import {
  CR_MAXIMO,
  proyectoEdicionSchema,
  proyectoFormSchema,
  proyectoRequestSchema,
} from './proyecto.schema'
import { paginaProyectosResponseSchema, proyectoResponseSchema } from './proyectoResponse.schema'

describe('proyectoFormSchema', () => {
  it('valida datos correctos para el formulario', () => {
    const valido = proyectoFormSchema.safeParse({ cr: 101, nombre: 'Proyecto Innovacion' })
    expect(valido.success).toBe(true)
  })

  it('rechaza si falta el nombre o el cr', () => {
    const sinNombre = proyectoFormSchema.safeParse({ cr: 101, nombre: '' })
    expect(sinNombre.success).toBe(false)

    const sinCr = proyectoFormSchema.safeParse({ cr: null, nombre: 'Proyecto' })
    expect(sinCr.success).toBe(false)
  })

  it('rechaza CR que supere el maximo permitido', () => {
    const excedido = proyectoFormSchema.safeParse({ cr: CR_MAXIMO + 1, nombre: 'Proyecto' })
    expect(excedido.success).toBe(false)
  })
})

describe('proyectoRequestSchema y proyectoEdicionSchema', () => {
  it('valida peticion completa de creacion', () => {
    const datos = proyectoRequestSchema.parse({ cr: 200, nombre: 'Nuevo Proyecto' })
    expect(datos).toEqual({ cr: 200, nombre: 'Nuevo Proyecto' })
  })

  it('permite campos opcionales en la edicion parcial', () => {
    const soloNombre = proyectoEdicionSchema.parse({ nombre: 'Nombre Modificado' })
    expect(soloNombre).toEqual({ nombre: 'Nombre Modificado' })

    const soloCr = proyectoEdicionSchema.parse({ cr: 300 })
    expect(soloCr).toEqual({ cr: 300 })
  })
})

describe('proyectoResponseSchema', () => {
  it('valida la respuesta de un proyecto desde el backend', () => {
    const raw = {
      id: 1,
      cr: 101,
      nombre: 'Proyecto Fondecyt',
      activo: true,
      solicitudes: 0,
      registradoPor: 'Admin',
      fechaRegistro: '2026-03-30T10:00:00',
    }

    const resultado = proyectoResponseSchema.parse(raw)
    expect(resultado.id).toBe(1)
    expect(resultado.cr).toBe(101)
    expect(resultado.activo).toBe(true)
  })

  it('valida la estructura paginada con resumen', () => {
    const paginaRaw = {
      data: [
        {
          id: 1,
          cr: 101,
          nombre: 'Proyecto',
          activo: true,
          solicitudes: 1,
          registradoPor: 'Admin',
          fechaRegistro: '2026-03-30T10:00:00',
        },
      ],
      meta: {
        page: 1,
        perPage: 10,
        total: 1,
        totalPages: 1,
      },
      resumen: {
        registros: 1,
        inactivos: 0,
      },
    }

    const resultado = paginaProyectosResponseSchema.parse(paginaRaw)
    expect(resultado.data).toHaveLength(1)
    expect(resultado.meta.total).toBe(1)
    expect(resultado.resumen.registros).toBe(1)
  })
})
