import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '@/config/env'
import { getIndicadores } from '@/features/inicio/api/indicadores'
import { server } from '@/mocks/server'

describe('getIndicadores', () => {
  it('obtiene el resumen presupuestario y lee cantidadTransacciones', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/resumen_presupuestario`, () =>
        HttpResponse.json({
          fechaCorte: '2026-03-31',
          cantidadTransacciones: 18,
          serie: [
            {
              periodo: '2026-03',
              precompromiso: 500,
              compromiso: 300,
              facturado: 100,
              ahorro: 50,
            },
          ],
        }),
      ),
    )

    const resultado = await getIndicadores()

    expect(resultado.cantidadTransacciones).toBe(18)
    expect(resultado.fechaCorte).toBe('2026-03-31')
    expect(resultado.serie).toHaveLength(1)
  })
})
