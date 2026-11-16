import { describe, expect, it } from 'vitest'
import { construirSintesisPerfil } from '@/features/analisis/components/ReportePdf/sintesis'
import type { PerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'

const PERFIL: PerfilUnidad = {
  unidad: {
    id: 1,
    nombre: 'Campos Clinicos',
    cr: 105,
    tipo: { value: 'carrera', label: 'Carrera' },
    sedes: [{ value: 'osorno', label: 'Osorno' }],
  },
  totales: {
    registros: 4,
    ocValidas: 3,
    ordenes: 4,
    comprometido: 2340000,
    comprometidoGlobal: 46944726,
    participacionGlobal: (2340000 / 46944726) * 100,
    precomprometido: 7150000,
  },
  porModalidad: [
    {
      modalidad: { value: 'agil', label: 'Compra Ágil' },
      registros: 1,
      comprometido: 2100000,
      participacion: (2100000 / 2340000) * 100,
    },
  ],
  evolucion: [{ mes: '2026-03', comprometido: 2340000, facturado: 150000 }],
  detalle: [],
}

describe('construirSintesisPerfil', () => {
  it('resume ordenes validas y canceladas, modalidad principal y brecha de facturacion', () => {
    const parrafos = construirSintesisPerfil(PERFIL)

    expect(parrafos).toHaveLength(3)
    expect(parrafos[0]).toContain(
      'participa en 4 órdenes de compra, de las cuales 3 son válidas y 1 fue cancelada',
    )
    expect(parrafos[1]).toContain('La modalidad principal es Compra Ágil')
    expect(parrafos[2]).toContain(`quedan ${'$2.190.000'} comprometidos y aún no facturados`)
  })

  it('informa solo el precomprometido cuando la unidad no tiene ordenes de compra', () => {
    const parrafos = construirSintesisPerfil({
      ...PERFIL,
      totales: {
        ...PERFIL.totales,
        registros: 0,
        ocValidas: 0,
        ordenes: 0,
        comprometido: 0,
        participacionGlobal: 0,
      },
      porModalidad: [],
      evolucion: [],
    })

    expect(parrafos).toHaveLength(1)
    expect(parrafos[0]).toContain('Campos Clinicos no registra órdenes de compra')
  })
})
