import { describe, expect, it } from 'vitest'
import { construirFiltrosRequerimiento } from '@/features/requerimientos/components/TablaRequerimientos/filtros'
import type {
  OpcionEstadoRequerimiento,
  Requerimiento,
  SolicitanteRequerimiento,
} from '@/features/requerimientos/types/requerimiento.types'

function crearSolicitante(id: number, nombre: string, sede: string): SolicitanteRequerimiento {
  return {
    id,
    cr: 100 + id,
    nombre,
    sedes: [{ value: 'sede', label: sede }],
    tipo: 'carrera',
  }
}

function crearRequerimiento(id: number, solicitante: SolicitanteRequerimiento): Requerimiento {
  return {
    id,
    identificador: String(id),
    solicitante,
    materiales: `Material ${id}`,
    descripcion: null,
    cantidad: 1,
    estado: { value: 'comprado', label: 'Comprado' },
    modalidad: null,
    ordenDeCompra: null,
    fechaMaximaLlegada: null,
    fechaLlegada: null,
    observaciones: null,
    carpeta: null,
    actualizadoEn: '2026-09-29T09:05:00',
    eliminado: false,
  }
}

const arquitecturaPuertoMontt = crearSolicitante(3, 'Arquitectura', 'Puerto Montt')
const arquitecturaOsorno = crearSolicitante(2, 'Arquitectura', 'Osorno')
const biblioteca = crearSolicitante(8, 'Biblioteca', 'Osorno')

const requerimientos = [
  crearRequerimiento(1, biblioteca),
  crearRequerimiento(2, arquitecturaPuertoMontt),
  crearRequerimiento(3, arquitecturaOsorno),
  crearRequerimiento(4, biblioteca),
]

const estados: OpcionEstadoRequerimiento[] = [
  { value: 'comprado', label: 'Comprado' },
  { value: 'en_bodega', label: 'En bodega' },
  { value: 'no_comprado', label: 'No comprado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'desestimado', label: 'Desestimado' },
]

describe('construirFiltrosRequerimiento', () => {
  it('define los filtros de solicitante, estado y vigencia en ese orden', () => {
    const filtros = construirFiltrosRequerimiento(requerimientos, estados)

    expect(filtros.map((filtro) => filtro.key)).toEqual(['solicitante', 'estado', 'vigencia'])
  })

  it('ofrece cada solicitante una vez, ordenado y con su campus', () => {
    const [filtroSolicitante] = construirFiltrosRequerimiento(requerimientos, estados)

    expect(filtroSolicitante).toEqual({
      key: 'solicitante',
      label: 'Solicitante',
      type: 'multi',
      enableSelectAll: true,
      options: [
        { value: '2', label: 'Arquitectura (Osorno)' },
        { value: '3', label: 'Arquitectura (Puerto Montt)' },
        { value: '8', label: 'Biblioteca (Osorno)' },
      ],
    })
  })

  it('ofrece los estados en el orden del catálogo', () => {
    const [, filtroEstado] = construirFiltrosRequerimiento(requerimientos, estados)

    expect(filtroEstado).toEqual({
      key: 'estado',
      label: 'Estado',
      type: 'multi',
      enableSelectAll: true,
      options: estados,
    })
  })

  it('ofrece las vigencias de requerimientos vigentes y eliminados', () => {
    const [, , filtroVigencia] = construirFiltrosRequerimiento(requerimientos, estados)

    expect(filtroVigencia).toEqual({
      key: 'vigencia',
      label: 'Vigencia',
      type: 'multi',
      enableSelectAll: false,
      options: [
        { value: 'vigente', label: 'Vigentes' },
        { value: 'eliminado', label: 'Eliminados' },
      ],
    })
  })

  it('no ofrece solicitantes cuando no hay requerimientos', () => {
    const [filtroSolicitante] = construirFiltrosRequerimiento([], estados)

    expect(filtroSolicitante).toEqual({
      key: 'solicitante',
      label: 'Solicitante',
      type: 'multi',
      enableSelectAll: true,
      options: [],
    })
  })
})
