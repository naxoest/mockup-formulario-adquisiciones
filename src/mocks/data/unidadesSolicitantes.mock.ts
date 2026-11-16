export interface CampusMock {
  value: string
  label: string
}

export const campusMock: CampusMock[] = [
  { value: 'osorno', label: 'Osorno' },
  { value: 'pto', label: 'Puerto Montt' },
  { value: 'castro', label: 'Castro' },
]

export function opcionesDeSedes(sedes: string[]): CampusMock[] {
  return campusMock.filter((campus) => sedes.includes(campus.value))
}

export interface UnidadSolicitanteMock {
  id: number
  label: string
  tipoSolicitante: string
  sedes: string[]
  cr: number
}

export const unidadesSolicitantesMock: UnidadSolicitanteMock[] = [
  {
    id: 1,
    label: 'Campos Clinicos',
    tipoSolicitante: 'carrera',
    sedes: ['osorno', 'pto'],
    cr: 105,
  },
  {
    id: 2,
    label: 'Arquitectura',
    tipoSolicitante: 'carrera',
    sedes: ['osorno'],
    cr: 101,
  },
  {
    id: 3,
    label: 'Arquitectura',
    tipoSolicitante: 'carrera',
    sedes: ['pto'],
    cr: 109,
  },
  {
    id: 4,
    label: 'Direccion de Informatica',
    tipoSolicitante: 'unidad',
    sedes: ['osorno', 'pto', 'castro'],
    cr: 106,
  },
  {
    id: 5,
    label: 'Mantencion',
    tipoSolicitante: 'unidad',
    sedes: ['osorno'],
    cr: 102,
  },
  {
    id: 6,
    label: 'Mantencion',
    tipoSolicitante: 'unidad',
    sedes: ['pto'],
    cr: 110,
  },
  {
    id: 7,
    label: 'DDE',
    tipoSolicitante: 'unidad',
    sedes: ['osorno'],
    cr: 103,
  },
  {
    id: 8,
    label: 'Biblioteca',
    tipoSolicitante: 'unidad',
    sedes: ['osorno', 'castro'],
    cr: 104,
  },
  {
    id: 9,
    label: 'Servicios Generales',
    tipoSolicitante: 'unidad',
    sedes: ['osorno'],
    cr: 107,
  },
  {
    id: 10,
    label: 'Rectoría',
    tipoSolicitante: 'unidad',
    sedes: ['osorno'],
    cr: 108,
  },
]
