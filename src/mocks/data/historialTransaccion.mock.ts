import type {
  EventoHistorial,
  ReferenciaEntidad,
} from '@/features/transacciones/types/historial.types'

function solicitud(id: number): ReferenciaEntidad {
  return { tipo: 'solicitud', id, codigo: `#${id}` }
}

function orden(id: number, codigo: string): ReferenciaEntidad {
  return { tipo: 'ordenDeCompra', id, codigo }
}

function factura(id: number, folio: number): ReferenciaEntidad {
  return { tipo: 'factura', id, codigo: String(folio) }
}

const CAMPOS_CLINICOS = { nombre: 'Campos Clinicos' }
const INFORMATICA = { nombre: 'Direccion de Informatica' }
const ARQUITECTURA = { nombre: 'Arquitectura' }
const MANTENCION = { nombre: 'Mantencion' }
const DDE = { nombre: 'DDE' }
const BIBLIOTECA = { nombre: 'Biblioteca' }
const GENERALES = { nombre: 'Servicios Generales' }
const RECTORIA = { nombre: 'Rectoría' }
const ADQUISICIONES = { nombre: 'Departamento de Adquisiciones' }

const OSORNO = 'Osorno'

const FERRADA = 'Camila Ferrada'
const ARAVENA = 'Sebastián Aravena'
const PAILLAN = 'Rodrigo Paillán'
const OYARZUN = 'Marcela Oyarzún'
const ROJAS = 'Ana Rojas'

const OC_201 = orden(201, 'OC 5413-52-SE26')
const OC_202 = orden(202, 'OC 5423-31-AG26')
const OC_203 = orden(203, 'OC 5423-31-TEST')
const FAC_401 = factura(401, 88214)

function asignacion(
  id: string,
  fecha: string,
  solicitudId: number,
  autor: string,
): EventoHistorial {
  return {
    clase: 'evento',
    id,
    fecha,
    entidad: solicitud(solicitudId),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones tomó la solicitud para tramitarla',
    monto: null,
    transicion: { anterior: 'Enviada', posterior: 'Asignado', tono: 'enCurso' },
    observacion: '',
    autor,
  }
}

const eventosTransaccion1: EventoHistorial[] = [
  {
    clase: 'evento',
    id: 'ev-1-01',
    fecha: '2026-03-12T09:14:00-03:00',
    entidad: solicitud(101),
    contexto: { unidad: CAMPOS_CLINICOS, campus: OSORNO },
    titulo: 'Campos Clinicos ingresó la primera solicitud y creó la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Reposición de equipamiento de simulación clínica del pabellón docente.',
    autor: FERRADA,
  },
  {
    clase: 'registro',
    id: 'reg-1-01',
    fecha: '2026-03-12T09:14:00-03:00',
    titulo: 'Camila Ferrada quedó como analista principal',
    observacion: '',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-02',
    fecha: '2026-03-12T09:31:00-03:00',
    entidad: solicitud(102),
    contexto: { unidad: INFORMATICA, campus: OSORNO },
    titulo: 'Direccion de Informatica sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Renovación de servidores del datacenter, fuera de soporte desde enero.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-03',
    fecha: '2026-03-12T09:48:00-03:00',
    entidad: solicitud(103),
    contexto: { unidad: ARQUITECTURA, campus: OSORNO },
    titulo: 'Arquitectura sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Mesas de dibujo técnico para el taller de primer año.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-04',
    fecha: '2026-03-12T10:02:00-03:00',
    entidad: solicitud(104),
    contexto: { unidad: MANTENCION, campus: OSORNO },
    titulo: 'Mantencion sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Servicio de mantención preventiva de climatización para el semestre.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-05',
    fecha: '2026-03-12T10:19:00-03:00',
    entidad: solicitud(105),
    contexto: { unidad: DDE, campus: OSORNO },
    titulo: 'DDE sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Mobiliario para las salas de atención estudiantil del segundo piso.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-06',
    fecha: '2026-03-12T10:27:00-03:00',
    entidad: solicitud(106),
    contexto: { unidad: BIBLIOTECA, campus: OSORNO },
    titulo: 'Biblioteca sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Servicio de encuadernación y restauración de colección patrimonial.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-07',
    fecha: '2026-03-12T10:34:00-03:00',
    entidad: solicitud(107),
    contexto: { unidad: GENERALES, campus: OSORNO },
    titulo: 'Servicios Generales sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Reposición de luminarias de emergencia del edificio administrativo.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-08',
    fecha: '2026-03-12T10:41:00-03:00',
    entidad: solicitud(108),
    contexto: { unidad: RECTORIA, campus: OSORNO },
    titulo: 'Rectoría sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Servicio de producción para la ceremonia de inicio del año académico.',
    autor: FERRADA,
  },
  {
    clase: 'hito',
    id: 'hito-1-01',
    fecha: '2026-03-12T10:41:00-03:00',
    estado: 'En cotización',
    explicacion: 'Ocho solicitudes quedaron asociadas a esta transacción y esperan su cotización.',
  },
  {
    clase: 'registro',
    id: 'reg-1-02',
    fecha: '2026-03-13T11:00:00-03:00',
    titulo: 'Sebastián Aravena se sumó como analista de apoyo',
    observacion: '',
    autor: ROJAS,
  },
  {
    clase: 'evento',
    id: 'ev-1-09',
    fecha: '2026-03-13T11:30:00-03:00',
    entidad: solicitud(101),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones tomó la solicitud para tramitarla',
    monto: null,
    transicion: { anterior: 'Enviada', posterior: 'Asignado', tono: 'enCurso' },
    observacion: 'Corresponde a modalidad de compra ágil por el monto estimado.',
    autor: FERRADA,
  },
  asignacion('ev-1-09-102', '2026-03-13T11:35:00-03:00', 102, ARAVENA),
  asignacion('ev-1-09-103', '2026-03-13T11:40:00-03:00', 103, FERRADA),
  asignacion('ev-1-09-104', '2026-03-13T11:45:00-03:00', 104, ARAVENA),
  asignacion('ev-1-09-105', '2026-03-13T11:50:00-03:00', 105, FERRADA),
  asignacion('ev-1-09-106', '2026-03-13T11:55:00-03:00', 106, ARAVENA),
  asignacion('ev-1-09-107', '2026-03-13T12:00:00-03:00', 107, FERRADA),
  asignacion('ev-1-09-108', '2026-03-13T12:05:00-03:00', 108, ARAVENA),
  {
    clase: 'evento',
    id: 'ev-1-10',
    fecha: '2026-03-13T14:02:00-03:00',
    entidad: solicitud(101),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 2000000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Se adjudica la oferta de menor valor entre las tres recibidas.',
    autor: FERRADA,
  },

  {
    clase: 'evento',
    id: 'ev-1-11',
    fecha: '2026-03-16T10:12:00-03:00',
    entidad: solicitud(102),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 3500000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Incluye garantía extendida a tres años exigida por la unidad.',
    autor: ARAVENA,
  },
  {
    clase: 'evento',
    id: 'ev-1-12',
    fecha: '2026-03-16T11:40:00-03:00',
    entidad: solicitud(103),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 1200000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Se consolida el despacho con las demás solicitudes del campus.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-13',
    fecha: '2026-03-16T12:10:00-03:00',
    entidad: solicitud(104),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 800000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Servicio cotizado por el semestre completo, con visitas mensuales.',
    autor: ARAVENA,
  },
  {
    clase: 'evento',
    id: 'ev-1-14',
    fecha: '2026-03-16T12:45:00-03:00',
    entidad: solicitud(105),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 1500000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Se descartó la oferta más barata por no incluir instalación.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-15',
    fecha: '2026-03-16T13:20:00-03:00',
    entidad: solicitud(106),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 900000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Único proveedor regional con experiencia en material patrimonial.',
    autor: ARAVENA,
  },
  {
    clase: 'evento',
    id: 'ev-1-16',
    fecha: '2026-03-16T13:55:00-03:00',
    entidad: solicitud(107),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 1100000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Cotización ajustada tras revisar el catastro de luminarias.',
    autor: FERRADA,
  },
  {
    clase: 'evento',
    id: 'ev-1-17',
    fecha: '2026-03-16T14:30:00-03:00',
    entidad: solicitud(108),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 2519471,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Última solicitud de la transacción en quedar cotizada.',
    autor: ARAVENA,
  },
  {
    clase: 'hito',
    id: 'hito-1-03',
    fecha: '2026-03-16T14:30:00-03:00',
    estado: 'Cotizada',
    explicacion: 'Las ocho solicitudes tienen monto de cotización registrado.',
  },
  {
    clase: 'evento',
    id: 'ev-1-18',
    fecha: '2026-03-19T09:40:00-03:00',
    entidad: OC_201,
    contexto: {
      relacionadas: [
        solicitud(101),
        solicitud(102),
        solicitud(103),
        solicitud(104),
        solicitud(105),
        solicitud(106),
        solicitud(107),
      ],
    },
    titulo: 'Adquisiciones envió la orden de compra al proveedor por',
    monto: 11100000,
    transicion: { anterior: null, posterior: 'Enviada a proveedor', tono: 'enCurso' },
    observacion:
      'Se agrupan siete solicitudes en una sola orden para aprovechar un único despacho. La solicitud de Rectoría queda fuera por tramitarse con otro proveedor. La línea de Campos Clinicos supera en 100.000 su cotización por el costo de instalación.',
    autor: FERRADA,
  },

  {
    clase: 'evento',
    id: 'ev-1-19',
    fecha: '2026-03-24T10:12:00-03:00',
    entidad: OC_201,
    contexto: {},
    titulo: 'El proveedor aceptó la orden de compra',
    monto: null,
    transicion: { anterior: 'Enviada a proveedor', posterior: 'Aceptada', tono: 'logrado' },
    observacion:
      'Con la aceptación la institución queda comprometida a pagar el monto de la orden. Entrega comprometida para el 27 de marzo.',
    autor: FERRADA,
  },
]

const eventosTransaccion2: EventoHistorial[] = [
  {
    clase: 'evento',
    id: 'ev-2-01',
    fecha: '2026-03-15T08:30:00-03:00',
    entidad: solicitud(109),
    contexto: { unidad: CAMPOS_CLINICOS, campus: OSORNO },
    titulo: 'Campos Clinicos ingresó la solicitud y creó la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Servicio de calibración de equipos de laboratorio.',
    autor: PAILLAN,
  },
  {
    clase: 'registro',
    id: 'reg-2-01',
    fecha: '2026-03-15T08:30:00-03:00',
    titulo: 'Rodrigo Paillán quedó como analista principal',
    observacion: '',
    autor: PAILLAN,
  },
  {
    clase: 'evento',
    id: 'ev-2-02',
    fecha: '2026-03-15T09:02:00-03:00',
    entidad: solicitud(110),
    contexto: { unidad: INFORMATICA, campus: OSORNO },
    titulo: 'Direccion de Informatica sumó su solicitud a la transacción',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Renovación de licencias de software de gestión de red.',
    autor: PAILLAN,
  },
  {
    clase: 'hito',
    id: 'hito-2-01',
    fecha: '2026-03-15T09:02:00-03:00',
    estado: 'En cotización',
    explicacion: 'Dos solicitudes quedaron asociadas a esta transacción y esperan su cotización.',
  },
  {
    clase: 'registro',
    id: 'reg-2-02',
    fecha: '2026-03-16T09:00:00-03:00',
    titulo: 'Marcela Oyarzún se sumó como analista de apoyo',
    observacion: '',
    autor: ROJAS,
  },
  asignacion('ev-2-02-109', '2026-03-16T10:00:00-03:00', 109, PAILLAN),
  asignacion('ev-2-02-110', '2026-03-16T10:05:00-03:00', 110, OYARZUN),
  {
    clase: 'evento',
    id: 'ev-2-03',
    fecha: '2026-03-16T11:30:00-03:00',
    entidad: solicitud(109),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 150000,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Calibración anual con certificación acreditada.',
    autor: PAILLAN,
  },

  {
    clase: 'evento',
    id: 'ev-2-04',
    fecha: '2026-03-16T16:10:00-03:00',
    entidad: solicitud(110),
    contexto: { unidad: ADQUISICIONES },
    titulo: 'Adquisiciones registró la cotización por',
    monto: 204726,
    transicion: { anterior: 'Asignado', posterior: 'En proceso', tono: 'enCurso' },
    observacion: 'Renovación por doce meses, con el mismo distribuidor del año anterior.',
    autor: OYARZUN,
  },
  {
    clase: 'hito',
    id: 'hito-2-03',
    fecha: '2026-03-16T16:10:00-03:00',
    estado: 'Cotizada',
    explicacion: 'Las dos solicitudes tienen monto de cotización registrado.',
  },
  {
    clase: 'evento',
    id: 'ev-2-05',
    fecha: '2026-03-20T09:10:00-03:00',
    entidad: OC_202,
    contexto: { relacionadas: [solicitud(109)] },
    titulo: 'Adquisiciones envió la orden de compra al proveedor por',
    monto: 150000,
    transicion: { anterior: null, posterior: 'Enviada a proveedor', tono: 'enCurso' },
    observacion: 'Se emite por separado para no retrasar el servicio de calibración.',
    autor: PAILLAN,
  },

  {
    clase: 'evento',
    id: 'ev-2-06',
    fecha: '2026-03-23T11:00:00-03:00',
    entidad: OC_202,
    contexto: {},
    titulo: 'El proveedor aceptó la orden de compra',
    monto: null,
    transicion: { anterior: 'Enviada a proveedor', posterior: 'Aceptada', tono: 'logrado' },
    observacion: 'Servicio agendado para la primera semana de abril.',
    autor: PAILLAN,
  },
  {
    clase: 'evento',
    id: 'ev-2-07',
    fecha: '2026-03-26T16:20:00-03:00',
    entidad: OC_203,
    contexto: { relacionadas: [solicitud(109), solicitud(110)] },
    titulo: 'Adquisiciones envió la segunda orden de compra al proveedor por',
    monto: 294726,
    transicion: { anterior: null, posterior: 'Enviada a proveedor', tono: 'enCurso' },
    observacion:
      'Cubre las licencias y una ampliación del servicio de calibración solicitada después de la primera orden.',
    autor: OYARZUN,
  },
  {
    clase: 'evento',
    id: 'ev-2-08',
    fecha: '2026-04-05T08:50:00-03:00',
    entidad: FAC_401,
    contexto: { relacionadas: [OC_202] },
    titulo: 'Adquisiciones ingresó la factura del proveedor por',
    monto: 150000,
    transicion: { anterior: null, posterior: 'Pendiente', tono: 'espera' },
    observacion:
      'El monto facturado coincide con el total de la primera orden. Queda a la espera de la revisión de conformidad.',
    autor: PAILLAN,
  },
]

export const eventosHistorialMock = new Map<number, EventoHistorial[]>([
  [1, eventosTransaccion1],
  [2, eventosTransaccion2],
])
