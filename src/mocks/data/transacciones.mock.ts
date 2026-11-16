import type {
  EstadoEvaluacion,
  EstadoFactura,
  EstadoOrdenDeCompra,
  EstadoSolicitud,
  PasoProceso,
} from '@/features/transacciones/types/transaccion.types'
import { asignacionesMock } from '@/mocks/data/asignaciones.mock'

export interface PrecompromisoAlmacenado {
  anio: number
  monto: number
}

export interface SolicitudAlmacenada {
  id: number
  unidadId: number
  tipoSolicitud: string
  codigoSaserviSabienes: string | null
  financiamiento: string | null
  estado: EstadoSolicitud | null
  estadoEvaluacion: EstadoEvaluacion | null
  precompromisos: PrecompromisoAlmacenado[]
}

export interface MontoOrdenDeCompraAlmacenado {
  id: number
  solicitudId: number
  anio: number
  monto: number
}

export interface OrdenDeCompraAlmacenada {
  id: number
  codigo: string
  fechaEmision: string
  estado: EstadoOrdenDeCompra
  montos: MontoOrdenDeCompraAlmacenado[]
}

export interface MontoFacturaAlmacenado {
  id: number
  montoOrdenCompraId: number
  monto: number
}

export interface FacturaAlmacenada {
  id: number
  folio: number
  estado: EstadoFactura
  fechaEmision: string
  montos: MontoFacturaAlmacenado[]
}

export interface PasoRegistradoAlmacenado {
  paso: PasoProceso
  fecha: string
  observacion: string | null
  registradoEn: string
  registradoPor: number
}

export interface TransaccionAlmacenada {
  id: number
  nombre: string
  linkCarpetaAntecedentes: string | null
  fecha: string
  modalidad: string
  creadaEn: string
  confirmadaEn: string | null
  pasos: PasoRegistradoAlmacenado[]
  solicitudes: SolicitudAlmacenada[]
  ordenesDeCompra: OrdenDeCompraAlmacenada[]
  facturas: FacturaAlmacenada[]
}

function registradoPorPrincipal(transaccionId: number): number {
  const principal = asignacionesMock.find(
    (asignacion) =>
      asignacion.transaccionId === transaccionId && asignacion.participacion === 'principal',
  )

  if (!principal) {
    throw new Error(
      `La transacción ${transaccionId} no tiene analista principal en los datos simulados`,
    )
  }

  return principal.run
}

function pasoRegistrado(
  transaccionId: number,
  paso: PasoProceso,
  registradoEn: string,
  observacion: string | null = null,
): PasoRegistradoAlmacenado {
  return {
    paso,
    fecha: registradoEn.slice(0, 10),
    observacion,
    registradoEn,
    registradoPor: registradoPorPrincipal(transaccionId),
  }
}

export const transaccionesMock: TransaccionAlmacenada[] = [
  {
    id: 1,
    nombre: 'Compra consolidada de inicio del año académico',
    linkCarpetaAntecedentes: 'https://example.org/carpetas/antecedentes-transaccion-1',
    fecha: '2026-03-20',
    modalidad: 'agil',
    creadaEn: '2026-03-12T09:14:00-03:00',
    confirmadaEn: '2026-03-12T10:41:00-03:00',
    pasos: [
      pasoRegistrado(1, 'presupuesto_solicitado', '2026-03-16T13:30:00-03:00'),
      pasoRegistrado(1, 'presupuesto_asignado', '2026-03-16T14:15:00-03:00'),
      pasoRegistrado(1, 'enviada_a_adquisiciones', '2026-03-16T15:00:00-03:00'),
      pasoRegistrado(1, 'analista_asignado', '2026-03-17T09:30:00-03:00'),
      pasoRegistrado(1, 'aprobada', '2026-03-17T12:00:00-03:00'),
      pasoRegistrado(
        1,
        'publicada',
        '2026-03-17T16:00:00-03:00',
        'Publicada en Mercado Público como compra ágil.',
      ),
      pasoRegistrado(
        1,
        'evaluada',
        '2026-03-18T17:00:00-03:00',
        'Se seleccionan las ofertas de menor valor que cumplen las bases.',
      ),
    ],
    solicitudes: [
      {
        id: 101,
        unidadId: 1,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 2000000 }],
      },
      {
        id: 102,
        unidadId: 4,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [
          { anio: 2026, monto: 1500000 },
          { anio: 2027, monto: 1000000 },
          { anio: 2028, monto: 1000000 },
        ],
      },
      {
        id: 103,
        unidadId: 2,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 1200000 }],
      },
      {
        id: 104,
        unidadId: 5,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 800000 }],
      },
      {
        id: 105,
        unidadId: 7,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 1500000 }],
      },
      {
        id: 106,
        unidadId: 8,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 900000 }],
      },
      {
        id: 107,
        unidadId: 9,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 1100000 }],
      },
      {
        id: 108,
        unidadId: 10,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: null,
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 2519471 }],
      },
    ],
    ordenesDeCompra: [
      {
        id: 201,
        codigo: 'OC 5413-52-SE26',
        fechaEmision: '2026-03-19',
        estado: 'aceptada',
        montos: [
          { id: 301, solicitudId: 101, anio: 2026, monto: 2100000 },
          { id: 302, solicitudId: 102, anio: 2026, monto: 1500000 },
          { id: 319, solicitudId: 102, anio: 2027, monto: 1000000 },
          { id: 320, solicitudId: 102, anio: 2028, monto: 1000000 },
          { id: 303, solicitudId: 103, anio: 2026, monto: 1200000 },
          { id: 304, solicitudId: 104, anio: 2026, monto: 800000 },
          { id: 305, solicitudId: 105, anio: 2026, monto: 1500000 },
          { id: 306, solicitudId: 106, anio: 2026, monto: 900000 },
          { id: 307, solicitudId: 107, anio: 2026, monto: 1100000 },
        ],
      },
    ],
    facturas: [],
  },
  {
    id: 2,
    nombre: 'Calibración de equipos y licencias de red',
    linkCarpetaAntecedentes: null,
    fecha: '2026-03-20',
    modalidad: 'privada',
    creadaEn: '2026-03-15T08:30:00-03:00',
    confirmadaEn: '2026-03-15T09:02:00-03:00',
    pasos: [
      pasoRegistrado(2, 'presupuesto_solicitado', '2026-03-17T07:45:00-03:00'),
      pasoRegistrado(2, 'presupuesto_asignado', '2026-03-17T08:30:00-03:00'),
      pasoRegistrado(2, 'enviada_a_adquisiciones', '2026-03-17T09:15:00-03:00'),
      pasoRegistrado(2, 'analista_asignado', '2026-03-17T11:40:00-03:00'),
      pasoRegistrado(2, 'aprobada', '2026-03-18T10:30:00-03:00'),
      pasoRegistrado(2, 'publicada', '2026-03-18T15:00:00-03:00'),
      pasoRegistrado(
        2,
        'evaluada',
        '2026-03-19T16:45:00-03:00',
        'Se seleccionan las ofertas de calibración y de licencias.',
      ),
    ],
    solicitudes: [
      {
        id: 109,
        unidadId: 1,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'en_evaluacion',
        precompromisos: [{ anio: 2026, monto: 150000 }],
      },
      {
        id: 110,
        unidadId: 4,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'en_evaluacion',
        precompromisos: [
          { anio: 2026, monto: 153545 },
          { anio: 2027, monto: 51181 },
        ],
      },
    ],
    ordenesDeCompra: [
      {
        id: 202,
        codigo: 'OC 5423-31-AG26',
        fechaEmision: '2026-03-20',
        estado: 'aceptada',
        montos: [{ id: 308, solicitudId: 109, anio: 2026, monto: 150000 }],
      },
      {
        id: 203,
        codigo: 'OC 5423-31-TEST',
        fechaEmision: '2026-03-26',
        estado: 'enviada_a_proveedor',
        montos: [
          { id: 309, solicitudId: 109, anio: 2026, monto: 90000 },
          { id: 310, solicitudId: 110, anio: 2026, monto: 153545 },
          { id: 321, solicitudId: 110, anio: 2027, monto: 51181 },
        ],
      },
    ],
    facturas: [
      {
        id: 401,
        folio: 88214,
        estado: 'pendiente',
        fechaEmision: '2026-04-05',
        montos: [{ id: 501, montoOrdenCompraId: 308, monto: 150000 }],
      },
    ],
  },
  {
    id: 3,
    nombre: 'Mobiliario para sala magna',
    linkCarpetaAntecedentes: 'https://example.org/carpetas/antecedentes-transaccion-3',
    fecha: '2026-04-10',
    modalidad: 'conveniomarco',
    creadaEn: '2026-04-01T11:00:00-03:00',
    confirmadaEn: '2026-04-01T11:35:00-03:00',
    pasos: [
      pasoRegistrado(3, 'presupuesto_solicitado', '2026-04-07T08:30:00-04:00'),
      pasoRegistrado(3, 'presupuesto_asignado', '2026-04-07T09:15:00-04:00'),
      pasoRegistrado(3, 'enviada_a_adquisiciones', '2026-04-07T10:00:00-04:00'),
      pasoRegistrado(3, 'analista_asignado', '2026-04-08T09:30:00-04:00'),
      pasoRegistrado(
        3,
        'aprobada',
        '2026-04-14T12:00:00-04:00',
        'Se aprueba la compra por convenio marco.',
      ),
    ],
    solicitudes: [
      {
        id: 111,
        unidadId: 2,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: '000123',
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 2500000 }],
      },
      {
        id: 112,
        unidadId: 9,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 2000000 }],
      },
    ],
    ordenesDeCompra: [
      {
        id: 204,
        codigo: 'OC 5413-88-CM26',
        fechaEmision: '2026-04-20',
        estado: 'enviada_a_proveedor',
        montos: [
          { id: 311, solicitudId: 111, anio: 2026, monto: 2500000 },
          { id: 312, solicitudId: 112, anio: 2026, monto: 2000000 },
        ],
      },
    ],
    facturas: [],
  },
  {
    id: 4,
    nombre: 'Habilitación de talleres de la sede Puerto Montt',
    linkCarpetaAntecedentes: null,
    fecha: '2026-05-05',
    modalidad: 'publica',
    creadaEn: '2026-04-20T09:00:00-03:00',
    confirmadaEn: '2026-04-20T09:40:00-03:00',
    pasos: [
      pasoRegistrado(4, 'presupuesto_solicitado', '2026-04-22T08:30:00-04:00'),
      pasoRegistrado(4, 'presupuesto_asignado', '2026-04-22T09:15:00-04:00'),
      pasoRegistrado(4, 'enviada_a_adquisiciones', '2026-04-22T10:00:00-04:00'),
      pasoRegistrado(4, 'analista_asignado', '2026-04-23T09:15:00-04:00'),
      pasoRegistrado(4, 'aprobada', '2026-04-27T11:00:00-04:00'),
      pasoRegistrado(4, 'publicada', '2026-04-28T09:00:00-04:00'),
      pasoRegistrado(4, 'evaluada', '2026-05-06T16:00:00-04:00'),
    ],
    solicitudes: [
      {
        id: 113,
        unidadId: 3,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: '45820',
        financiamiento: 'institucional',
        estado: 'completada',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 10000000 }],
      },
      {
        id: 114,
        unidadId: 6,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: '45821',
        financiamiento: 'institucional',
        estado: 'completada',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 8500000 }],
      },
    ],
    ordenesDeCompra: [
      {
        id: 205,
        codigo: 'OC 5413-90-LP26',
        fechaEmision: '2026-05-08',
        estado: 'recepcion_conforme',
        montos: [
          { id: 313, solicitudId: 113, anio: 2026, monto: 10000000 },
          { id: 314, solicitudId: 114, anio: 2026, monto: 8500000 },
        ],
      },
    ],
    facturas: [
      {
        id: 402,
        folio: 90551,
        estado: 'aceptada',
        fechaEmision: '2026-05-18',
        montos: [
          { id: 502, montoOrdenCompraId: 313, monto: 10000000 },
          { id: 503, montoOrdenCompraId: 314, monto: 8500000 },
        ],
      },
    ],
  },
  {
    id: 5,
    nombre: 'Insumos clínicos y mobiliario de atención estudiantil',
    linkCarpetaAntecedentes: 'https://example.org/carpetas/antecedentes-transaccion-5',
    fecha: '2026-05-12',
    modalidad: 'conveniosuministro',
    creadaEn: '2026-05-02T14:10:00-03:00',
    confirmadaEn: '2026-05-02T14:45:00-03:00',
    pasos: [],
    solicitudes: [
      {
        id: 115,
        unidadId: 1,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: '9031',
        financiamiento: 'institucional',
        estado: 'asignado',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 1200000 }],
      },
      {
        id: 116,
        unidadId: 7,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'asignado',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 1300000 }],
      },
    ],
    ordenesDeCompra: [],
    facturas: [],
  },
  {
    id: 6,
    nombre: 'Servicios para Arquitectura y Biblioteca',
    linkCarpetaAntecedentes: null,
    fecha: '2026-06-01',
    modalidad: 'directo',
    creadaEn: '2026-05-25T10:20:00-03:00',
    confirmadaEn: '2026-05-25T10:55:00-03:00',
    pasos: [],
    solicitudes: [
      {
        id: 117,
        unidadId: 2,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'asignado',
        estadoEvaluacion: 'en_evaluacion',
        precompromisos: [{ anio: 2026, monto: 450000 }],
      },
      {
        id: 118,
        unidadId: 8,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'enviada',
        estadoEvaluacion: null,
        precompromisos: [],
      },
    ],
    ordenesDeCompra: [],
    facturas: [],
  },
  {
    id: 7,
    nombre: 'Equipamiento y servicios para Rectoría e Informática',
    linkCarpetaAntecedentes: 'https://example.org/carpetas/antecedentes-transaccion-7',
    fecha: '2026-06-15',
    modalidad: 'agil',
    creadaEn: '2026-06-05T13:00:00-03:00',
    confirmadaEn: '2026-06-05T13:30:00-03:00',
    pasos: [],
    solicitudes: [
      {
        id: 119,
        unidadId: 10,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'rechazada',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 170000 }],
      },
      {
        id: 120,
        unidadId: 4,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'rechazada',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 150000 }],
      },
    ],
    ordenesDeCompra: [],
    facturas: [],
  },
  {
    id: 8,
    nombre: 'Equipamiento eléctrico para Campos Clínicos y Servicios Generales',
    linkCarpetaAntecedentes: null,
    fecha: '2026-07-22',
    modalidad: 'privada',
    creadaEn: '2026-07-10T08:00:00-03:00',
    confirmadaEn: '2026-07-10T08:35:00-03:00',
    pasos: [
      pasoRegistrado(8, 'presupuesto_solicitado', '2026-07-14T08:30:00-04:00'),
      pasoRegistrado(8, 'presupuesto_asignado', '2026-07-14T09:15:00-04:00'),
      pasoRegistrado(8, 'enviada_a_adquisiciones', '2026-07-14T10:00:00-04:00'),
      pasoRegistrado(8, 'analista_asignado', '2026-07-15T09:00:00-04:00'),
      pasoRegistrado(8, 'aprobada', '2026-07-20T12:00:00-04:00'),
      pasoRegistrado(8, 'publicada', '2026-07-22T10:00:00-04:00'),
      pasoRegistrado(8, 'evaluada', '2026-07-29T16:00:00-04:00'),
    ],
    solicitudes: [
      {
        id: 121,
        unidadId: 1,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 3800000 }],
      },
      {
        id: 122,
        unidadId: 9,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: 'proyectos',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 4000000 }],
      },
    ],
    ordenesDeCompra: [
      {
        id: 206,
        codigo: 'OC 5413-44-LPR26',
        fechaEmision: '2026-07-31',
        estado: 'aceptada',
        montos: [
          { id: 315, solicitudId: 121, anio: 2026, monto: 3800000 },
          { id: 316, solicitudId: 122, anio: 2026, monto: 4000000 },
        ],
      },
    ],
    facturas: [],
  },
  {
    id: 9,
    nombre: 'Suscripción a bases de datos bibliográficas',
    linkCarpetaAntecedentes: 'https://example.org/carpetas/antecedentes-transaccion-9',
    fecha: '2026-08-05',
    modalidad: 'publica',
    creadaEn: '2026-07-25T16:00:00-03:00',
    confirmadaEn: '2026-07-25T16:20:00-03:00',
    pasos: [
      pasoRegistrado(9, 'presupuesto_solicitado', '2026-07-29T08:30:00-04:00'),
      pasoRegistrado(9, 'presupuesto_asignado', '2026-07-29T09:15:00-04:00'),
      pasoRegistrado(9, 'enviada_a_adquisiciones', '2026-07-29T10:00:00-04:00'),
      pasoRegistrado(9, 'analista_asignado', '2026-07-30T09:30:00-04:00'),
      pasoRegistrado(
        9,
        'aprobada_con_observaciones',
        '2026-08-03T11:00:00-04:00',
        'Se solicita precisar las especificaciones técnicas de las bases.',
      ),
      pasoRegistrado(
        9,
        'subsanada',
        '2026-08-05T15:00:00-04:00',
        'Se ajustaron las especificaciones técnicas según lo observado.',
      ),
      pasoRegistrado(9, 'publicada', '2026-08-06T10:00:00-04:00'),
      pasoRegistrado(9, 'evaluada', '2026-08-12T17:00:00-04:00'),
    ],
    solicitudes: [
      {
        id: 123,
        unidadId: 7,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [
          { anio: 2026, monto: 4000000 },
          { anio: 2027, monto: 2000000 },
        ],
      },
      {
        id: 124,
        unidadId: 8,
        tipoSolicitud: 'SASERVI',
        codigoSaserviSabienes: null,
        financiamiento: 'institucional',
        estado: 'en_proceso',
        estadoEvaluacion: 'evaluado',
        precompromisos: [{ anio: 2026, monto: 6400000 }],
      },
    ],
    ordenesDeCompra: [
      {
        id: 207,
        codigo: 'OC 5423-77-LP26',
        fechaEmision: '2026-08-14',
        estado: 'enviada_a_proveedor',
        montos: [
          { id: 317, solicitudId: 123, anio: 2026, monto: 4000000 },
          { id: 322, solicitudId: 123, anio: 2027, monto: 2000000 },
          { id: 318, solicitudId: 124, anio: 2026, monto: 6400000 },
        ],
      },
    ],
    facturas: [],
  },
  {
    id: 10,
    nombre: 'Habilitación de sala de estudio en biblioteca',
    linkCarpetaAntecedentes: null,
    fecha: '2026-08-28',
    modalidad: 'agil',
    creadaEn: '2026-08-20T11:05:00-03:00',
    confirmadaEn: null,
    pasos: [],
    solicitudes: [
      {
        id: 125,
        unidadId: 5,
        tipoSolicitud: 'SABIENES',
        codigoSaserviSabienes: null,
        financiamiento: null,
        estado: null,
        estadoEvaluacion: null,
        precompromisos: [],
      },
    ],
    ordenesDeCompra: [],
    facturas: [],
  },
]
