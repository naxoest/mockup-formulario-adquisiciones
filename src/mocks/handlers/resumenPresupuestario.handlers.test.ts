import { describe, expect, it } from 'vitest'
import { pedirResumenPresupuestario } from '@/mocks/pruebas'

const RUTA = '/api/resumen_presupuestario'

const MESES: string[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

describe('GET /resumen_presupuestario', () => {
  it('responde con la forma que valida el esquema del frontend', async () => {
    const { respuesta, cuerpo } = await pedirResumenPresupuestario(RUTA)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.fechaCorte).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(cuerpo.serie.every((elemento) => MESES.includes(elemento.periodo))).toBe(true)
    expect(Number.isInteger(cuerpo.cantidadTransacciones)).toBe(true)
    expect(cuerpo.cantidadTransacciones).toBe(10)
  })

  it('entrega montos acumulados que nunca disminuyen', async () => {
    const { cuerpo } = await pedirResumenPresupuestario(RUTA)

    for (const concepto of ['precompromiso', 'compromiso', 'facturado'] as const) {
      const montos = cuerpo.serie.map((elemento) => elemento[concepto])

      expect(montos).toEqual([...montos].sort((a, b) => a - b))
    }
  })
})
