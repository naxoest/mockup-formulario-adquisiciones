import type { FactoresCriticidad } from '@/features/transacciones/types/monitoreo.types'
import type { SelectOption } from '@/types/select'

export interface RegistroMonitoreoAlmacenado {
  transaccionId: number
  factores: FactoresCriticidad | null
  ultimoMovimiento: Date | null
  proximaAccion: string | null
  fechaProximaRevision: Date | null
  bloqueadorPrincipal: string | null
  escalarAJefatura: boolean
  cerrado: boolean
  observaciones: string | null
}

export const bloqueadoresMock: SelectOption[] = [
  { value: 'presupuesto', label: 'Presupuesto' },
  { value: 'adquisiciones', label: 'Adquisiciones' },
  { value: 'proveedores', label: 'Proveedores' },
  { value: 'gestion_no_iniciada', label: 'Gestión no iniciada' },
  { value: 'carrera', label: 'Carrera' },
  { value: 'equipo_enlace_compras', label: 'Equipo enlace compras' },
  { value: 'otros', label: 'Otros' },
]

function hace(dias: number): Date {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha
}

function en(dias: number): Date {
  return hace(-dias)
}

export const monitoreoMock: RegistroMonitoreoAlmacenado[] = [
  {
    transaccionId: 1,
    ultimoMovimiento: new Date('2026-03-24T10:12:00-03:00'),
    factores: {
      impactoAcademico: 5,
      urgenciaTemporal: 4,
      exposicionInstitucional: 4,
      riesgoOperacional: 3,
    },
    proximaAccion: 'Gestionar la orden de compra de la solicitud de Rectoría',
    fechaProximaRevision: hace(1),
    bloqueadorPrincipal: 'proveedores',
    escalarAJefatura: true,
    cerrado: false,
    observaciones:
      'La orden aceptada cubre siete solicitudes. La de Rectoría espera una orden con otro proveedor.',
  },
  {
    transaccionId: 2,
    ultimoMovimiento: new Date('2026-04-05T08:50:00-03:00'),
    factores: {
      impactoAcademico: 4,
      urgenciaTemporal: 4,
      exposicionInstitucional: 4,
      riesgoOperacional: 4,
    },
    proximaAccion: 'Obtener la aceptación de la segunda orden de compra',
    fechaProximaRevision: en(1),
    bloqueadorPrincipal: 'proveedores',
    escalarAJefatura: false,
    cerrado: false,
    observaciones:
      'La segunda orden sigue enviada al proveedor y la factura de la primera espera la revisión de conformidad.',
  },
  {
    transaccionId: 3,
    ultimoMovimiento: hace(2),
    factores: {
      impactoAcademico: 4,
      urgenciaTemporal: 3,
      exposicionInstitucional: 3,
      riesgoOperacional: 3,
    },
    proximaAccion: 'Obtener la aceptación de la orden de convenio marco',
    fechaProximaRevision: en(3),
    bloqueadorPrincipal: 'proveedores',
    escalarAJefatura: false,
    cerrado: false,
    observaciones:
      'La orden de compra se envió por convenio marco y espera la aceptación del proveedor.',
  },
  {
    transaccionId: 4,
    ultimoMovimiento: hace(9),
    factores: {
      impactoAcademico: 2,
      urgenciaTemporal: 2,
      exposicionInstitucional: 2,
      riesgoOperacional: 3,
    },
    proximaAccion: null,
    fechaProximaRevision: null,
    bloqueadorPrincipal: null,
    escalarAJefatura: false,
    cerrado: true,
    observaciones: 'Proceso facturado y con recepción conforme.',
  },
  {
    transaccionId: 5,
    ultimoMovimiento: hace(0),
    factores: {
      impactoAcademico: 4,
      urgenciaTemporal: 5,
      exposicionInstitucional: 4,
      riesgoOperacional: 5,
    },
    proximaAccion: 'Emitir la orden de compra del convenio de suministro',
    fechaProximaRevision: en(2),
    bloqueadorPrincipal: 'adquisiciones',
    escalarAJefatura: true,
    cerrado: false,
    observaciones: 'Las dos solicitudes están cotizadas y falta emitir la orden de compra.',
  },
  {
    transaccionId: 6,
    ultimoMovimiento: new Date('2026-07-18T09:20:00-04:00'),
    factores: null,
    proximaAccion: 'Asignar analista responsable',
    fechaProximaRevision: en(1),
    bloqueadorPrincipal: 'gestion_no_iniciada',
    escalarAJefatura: false,
    cerrado: false,
    observaciones: 'La transacción perdió a su analista principal y espera una nueva asignación.',
  },
  {
    transaccionId: 7,
    ultimoMovimiento: hace(0),
    factores: {
      impactoAcademico: 2,
      urgenciaTemporal: 1,
      exposicionInstitucional: 2,
      riesgoOperacional: 2,
    },
    proximaAccion: null,
    fechaProximaRevision: null,
    bloqueadorPrincipal: null,
    escalarAJefatura: false,
    cerrado: true,
    observaciones: 'Las dos solicitudes fueron rechazadas y no queda gestión pendiente.',
  },
  {
    transaccionId: 8,
    ultimoMovimiento: hace(4),
    factores: {
      impactoAcademico: 5,
      urgenciaTemporal: 5,
      exposicionInstitucional: 5,
      riesgoOperacional: 5,
    },
    proximaAccion: 'Coordinar la entrega con el proveedor',
    fechaProximaRevision: hace(2),
    bloqueadorPrincipal: 'proveedores',
    escalarAJefatura: true,
    cerrado: false,
    observaciones: 'La orden fue aceptada y la entrega está pendiente de coordinación.',
  },
  {
    transaccionId: 9,
    ultimoMovimiento: hace(1),
    factores: {
      impactoAcademico: 3,
      urgenciaTemporal: 3,
      exposicionInstitucional: 3,
      riesgoOperacional: 3,
    },
    proximaAccion: 'Obtener la aceptación de la orden por el proveedor',
    fechaProximaRevision: en(5),
    bloqueadorPrincipal: 'proveedores',
    escalarAJefatura: false,
    cerrado: false,
    observaciones: 'La orden se envió al proveedor adjudicado en la licitación pública.',
  },
  {
    transaccionId: 10,
    ultimoMovimiento: null,
    factores: null,
    proximaAccion: null,
    fechaProximaRevision: null,
    bloqueadorPrincipal: null,
    escalarAJefatura: false,
    cerrado: false,
    observaciones: null,
  },
]
