export interface ProyectoMock {
  id: number
  cr: number
  nombre: string
  activo?: boolean
}

export const proyectosMock: ProyectoMock[] = [
  {
    id: 1,
    cr: 201,
    nombre: 'Proyecto FONDECYT Regular 12001',
    activo: true,
  },
  {
    id: 2,
    cr: 202,
    nombre: 'Proyecto FIC R Innovación Regional',
    activo: true,
  },
  {
    id: 3,
    cr: 203,
    nombre: 'Proyecto Fortalecimiento Institucional',
    activo: true,
  },
  {
    id: 4,
    cr: 204,
    nombre: 'Proyecto Equipamiento Científico',
    activo: true,
  },
  {
    id: 5,
    cr: 205,
    nombre: 'Proyecto Convenio Desempeño Humanidades',
    activo: false,
  },
]
