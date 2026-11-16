import { describe, expect, it } from 'vitest'
import {
  periodoPresupuestarioResponseSchema,
  periodosPresupuestariosResponseSchema,
} from './periodoPresupuestarioResponse.schema'

describe('periodoPresupuestarioResponseSchema', () => {
  it('valida un periodo presupuestario con enCurso explícito', () => {
    const data = {
      value: '2026',
      label: '2026',
      anio: 2026,
      enCurso: true,
    }

    const resultado = periodoPresupuestarioResponseSchema.parse(data)

    expect(resultado).toEqual({
      value: '2026',
      label: '2026',
      anio: 2026,
      enCurso: true,
    })
  })

  it('asigna enCurso en false por defecto cuando no se proporciona', () => {
    const data = {
      value: '2025',
      label: '2025',
      anio: 2025,
    }

    const resultado = periodoPresupuestarioResponseSchema.parse(data)

    expect(resultado.enCurso).toBe(false)
  })

  it('rechaza cuando faltan campos obligatorios o los tipos son incorrectos', () => {
    expect(() =>
      periodoPresupuestarioResponseSchema.parse({
        value: '',
        label: '2026',
        anio: 2026,
      }),
    ).toThrow()

    expect(() =>
      periodoPresupuestarioResponseSchema.parse({
        value: '2026',
        label: '2026',
        anio: 2026.5,
      }),
    ).toThrow()
  })
})

describe('periodosPresupuestariosResponseSchema', () => {
  it('valida una lista de periodos presupuestarios', () => {
    const lista = [
      { value: '2025', label: '2025', anio: 2025, enCurso: false },
      { value: '2026', label: '2026', anio: 2026, enCurso: true },
    ]

    const resultado = periodosPresupuestariosResponseSchema.parse(lista)

    expect(resultado).toHaveLength(2)
    expect(resultado[0].enCurso).toBe(false)
    expect(resultado[1].enCurso).toBe(true)
  })
})
