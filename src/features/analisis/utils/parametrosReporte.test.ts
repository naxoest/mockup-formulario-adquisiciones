import { construirParametrosReporte } from '@/features/analisis/utils/parametrosReporte'
import type { FiltrosReporte } from '@/features/analisis/types/reporte.types'

const vacios: FiltrosReporte = { desde: null, hasta: null, titulo: null, etiquetaPeriodo: null }

describe('construirParametrosReporte', () => {
  it('devuelve cadena vacia sin filtros', () => {
    expect(construirParametrosReporte(vacios)).toBe('')
  })

  it('incluye el periodo completo', () => {
    expect(
      construirParametrosReporte({ ...vacios, desde: '2026-01-01', hasta: '2026-08-19' }),
    ).toBe('?desde=2026-01-01&hasta=2026-08-19')
  })

  it('incluye solo el extremo definido', () => {
    expect(construirParametrosReporte({ ...vacios, desde: '2026-01-01' })).toBe('?desde=2026-01-01')
  })

  it('codifica el titulo y la etiqueta', () => {
    expect(
      construirParametrosReporte({
        ...vacios,
        titulo: 'Reporte de agosto',
        etiquetaPeriodo: 'agosto de 2026',
      }),
    ).toBe('?titulo=Reporte+de+agosto&etiquetaPeriodo=agosto+de+2026')
  })
})
