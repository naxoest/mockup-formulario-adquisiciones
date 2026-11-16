import type {
  ContextoEvento,
  EventoHistorial,
  ReferenciaEntidad,
  TonoEvento,
  UnidadEvento,
} from '@/features/transacciones/types/historial.types'
import type {
  EstadoSolicitud,
  EstadoTransaccion,
} from '@/features/transacciones/types/transaccion.types'
import {
  transaccionesMock,
  type FacturaAlmacenada,
  type OrdenDeCompraAlmacenada,
  type PasoRegistradoAlmacenado,
  type PrecompromisoAlmacenado,
  type SolicitudAlmacenada,
  type TransaccionAlmacenada,
} from '@/mocks/data/transacciones.mock'
import { asignacionesMock, asignacionesTerminadasMock } from '@/mocks/data/asignaciones.mock'
import { monitoreoMock } from '@/mocks/data/monitoreo.mock'
import { usuariosMock } from '@/mocks/data/usuarios.mock'
import { estadoTransaccionOptions } from '@/mocks/data/listas.mock'
import {
  estadoDe,
  montoCotizacionDe,
  resolverUnidad,
} from '@/mocks/handlers/transacciones.derivacion'
import { nombreDeAnalista } from '@/mocks/handlers/analistas.nombre'
import { formatCLP } from '@/utils/currency'

const RUN_ADMINISTRADOR = 12345678
const MILISEGUNDOS_POR_MINUTO = 60_000
const MILISEGUNDOS_POR_HORA = 60 * MILISEGUNDOS_POR_MINUTO

const ADQUISICIONES: UnidadEvento = { nombre: 'Departamento de Adquisiciones' }

export const EXPLICACION_HITO: Record<EstadoTransaccion, string> = {
  en_cotizacion: 'Hay solicitudes que aún no tienen monto de cotización registrado.',
  cotizada: 'Todas las solicitudes vigentes tienen monto de cotización registrado.',
  presupuesto_solicitado: 'El presupuesto de la transacción fue solicitado.',
  presupuesto_asignado: 'El presupuesto de la transacción fue asignado.',
  enviada_a_adquisiciones: 'La transacción fue enviada a adquisiciones.',
  analista_asignado: 'Adquisiciones asignó un analista al proceso de compra.',
  aprobada: 'El proceso de compra fue aprobado.',
  aprobada_con_observaciones:
    'El proceso de compra fue aprobado con observaciones que deben subsanarse.',
  subsanada: 'Se subsanaron las observaciones de la aprobación.',
  publicada: 'El proceso de compra fue publicado.',
  evaluada: 'Las ofertas del proceso de compra fueron evaluadas.',
  facturada: 'Todo lo comprometido quedó facturado y aceptado.',
  cerrada: 'La transacción concluyó su tramitación.',
  rechazada: 'Todas las solicitudes de la transacción fueron rechazadas.',
}

const LLEGAN_A_ASIGNACION: Array<EstadoSolicitud | null> = [
  'asignado',
  'en_proceso',
  'completada',
  'rechazada',
]

const LLEGAN_A_PROCESO: Array<EstadoSolicitud | null> = ['en_proceso', 'completada']

type CrearEvento = (id: string, fecha: string) => EventoHistorial

interface Paso {
  aplicar?: (borrador: TransaccionAlmacenada) => void
  crear?: CrearEvento
}

interface PasoFechado {
  paso: Paso
  instante: number
}

interface DatosEventoEntidad {
  entidad: ReferenciaEntidad
  contexto?: ContextoEvento
  titulo: string
  monto?: number | null
  anterior: string | null
  posterior: string
  tono: TonoEvento
  autor: string
}

function nombreDeRun(run: number): string {
  const usuario = usuariosMock.find((item) => item.run === run)

  if (!usuario) {
    throw new Error(`Los datos simulados no contienen al usuario ${run}`)
  }

  return nombreDeAnalista(usuario)
}

function etiquetaEstado(estado: EstadoTransaccion): string {
  return estadoTransaccionOptions.find((opcion) => opcion.value === estado)?.label ?? estado
}

function referenciaSolicitud(id: number): ReferenciaEntidad {
  return { tipo: 'solicitud', id, codigo: `#${id}` }
}

function referenciaOrden(orden: OrdenDeCompraAlmacenada): ReferenciaEntidad {
  return { tipo: 'ordenDeCompra', id: orden.id, codigo: orden.codigo }
}

function referenciaFactura(factura: FacturaAlmacenada): ReferenciaEntidad {
  return { tipo: 'factura', id: factura.id, codigo: String(factura.folio) }
}

function registro(titulo: string, autor: string, observacion = ''): CrearEvento {
  return (id, fecha) => ({ clase: 'registro', id, fecha, titulo, observacion, autor })
}

function eventoPaso(registrado: PasoRegistradoAlmacenado): CrearEvento {
  return (id, fecha) => ({
    clase: 'paso',
    id,
    fecha,
    accion: 'registrado',
    paso: registrado.paso,
    titulo: `Paso registrado: ${etiquetaEstado(registrado.paso)}`,
    fechaHecho: registrado.fecha,
    observacion: registrado.observacion,
    autor: nombreDeRun(registrado.registradoPor),
  })
}

function pasoDeProceso(registrado: PasoRegistradoAlmacenado): Paso {
  return {
    aplicar: (borrador) => {
      borrador.pasos.push({ ...registrado })
    },
    crear: eventoPaso(registrado),
  }
}

function eventoEntidad(datos: DatosEventoEntidad): CrearEvento {
  return (id, fecha) => ({
    clase: 'evento',
    id,
    fecha,
    entidad: datos.entidad,
    contexto: datos.contexto ?? {},
    titulo: datos.titulo,
    monto: datos.monto ?? null,
    transicion: { anterior: datos.anterior, posterior: datos.posterior, tono: datos.tono },
    observacion: '',
    autor: datos.autor,
  })
}

function solicitudDe(borrador: TransaccionAlmacenada, id: number): SolicitudAlmacenada {
  const solicitud = borrador.solicitudes.find((item) => item.id === id)

  if (!solicitud) {
    throw new Error(`La solicitud ${id} no pertenece a la transacción ${borrador.id}`)
  }

  return solicitud
}

function ordenDe(borrador: TransaccionAlmacenada, id: number): OrdenDeCompraAlmacenada {
  const orden = borrador.ordenesDeCompra.find((item) => item.id === id)

  if (!orden) {
    throw new Error(`La orden ${id} no pertenece a la transacción ${borrador.id}`)
  }

  return orden
}

function facturaDe(borrador: TransaccionAlmacenada, id: number): FacturaAlmacenada {
  const factura = borrador.facturas.find((item) => item.id === id)

  if (!factura) {
    throw new Error(`La factura ${id} no pertenece a la transacción ${borrador.id}`)
  }

  return factura
}

function copiarPrecompromisos(
  precompromisos: PrecompromisoAlmacenado[],
): PrecompromisoAlmacenado[] {
  return precompromisos.map((precompromiso) => ({
    anio: precompromiso.anio,
    monto: precompromiso.monto,
  }))
}

function llegaAProceso(solicitud: SolicitudAlmacenada): boolean {
  return (
    LLEGAN_A_PROCESO.includes(solicitud.estado) ||
    (solicitud.estado === 'rechazada' && solicitud.precompromisos.length > 0)
  )
}

function estadoInicial(transaccion: TransaccionAlmacenada): TransaccionAlmacenada {
  return {
    ...transaccion,
    confirmadaEn: null,
    solicitudes: transaccion.solicitudes.map((solicitud) => ({
      ...solicitud,
      estado: null,
      precompromisos: [],
    })),
    pasos: [],
    ordenesDeCompra: [],
    facturas: [],
  }
}

function pasosPrevios(transaccion: TransaccionAlmacenada, siguienteGestor: () => string): Paso[] {
  const pasos: Paso[] = []

  for (const solicitud of transaccion.solicitudes) {
    if (!LLEGAN_A_ASIGNACION.includes(solicitud.estado)) continue

    pasos.push({
      aplicar: (borrador) => {
        solicitudDe(borrador, solicitud.id).estado = 'asignado'
      },
      crear: eventoEntidad({
        entidad: referenciaSolicitud(solicitud.id),
        contexto: { unidad: ADQUISICIONES },
        titulo: 'Adquisiciones tomó la solicitud para tramitarla',
        anterior: 'Enviada',
        posterior: 'Asignado',
        tono: 'enCurso',
        autor: siguienteGestor(),
      }),
    })
  }

  for (const solicitud of transaccion.solicitudes) {
    const monto = montoCotizacionDe(solicitud.precompromisos)

    if (llegaAProceso(solicitud)) {
      pasos.push({
        aplicar: (borrador) => {
          const destino = solicitudDe(borrador, solicitud.id)
          destino.estado = 'en_proceso'
          destino.precompromisos = copiarPrecompromisos(solicitud.precompromisos)
        },
        crear: eventoEntidad({
          entidad: referenciaSolicitud(solicitud.id),
          contexto: { unidad: ADQUISICIONES },
          titulo:
            monto === null
              ? 'Adquisiciones inició el proceso de compra de la solicitud'
              : 'Adquisiciones registró la cotización por',
          monto,
          anterior: 'Asignado',
          posterior: 'En proceso',
          tono: 'enCurso',
          autor: siguienteGestor(),
        }),
      })
    } else if (monto !== null) {
      pasos.push({
        aplicar: (borrador) => {
          solicitudDe(borrador, solicitud.id).precompromisos = copiarPrecompromisos(
            solicitud.precompromisos,
          )
        },
        crear: registro(
          `Adquisiciones registró la cotización de la solicitud #${solicitud.id} por ${formatCLP(monto)}`,
          siguienteGestor(),
        ),
      })
    }
  }

  return pasos
}

function pasosPosteriores(
  transaccion: TransaccionAlmacenada,
  siguienteGestor: () => string,
): Paso[] {
  const pasos: Paso[] = []

  for (const orden of transaccion.ordenesDeCompra) {
    pasos.push({
      aplicar: (borrador) => {
        borrador.ordenesDeCompra.push({
          ...orden,
          estado: 'enviada_a_proveedor',
          montos: orden.montos.map((monto) => ({ ...monto })),
        })
      },
      crear: eventoEntidad({
        entidad: referenciaOrden(orden),
        contexto: {
          relacionadas: Array.from(new Set(orden.montos.map((monto) => monto.solicitudId))).map(
            referenciaSolicitud,
          ),
        },
        titulo: 'Adquisiciones envió la orden de compra al proveedor por',
        monto: orden.montos.reduce((total, monto) => total + monto.monto, 0),
        anterior: null,
        posterior: 'Enviada a proveedor',
        tono: 'enCurso',
        autor: siguienteGestor(),
      }),
    })

    if (orden.estado === 'aceptada' || orden.estado === 'recepcion_conforme') {
      pasos.push({
        aplicar: (borrador) => {
          ordenDe(borrador, orden.id).estado = 'aceptada'
        },
        crear: eventoEntidad({
          entidad: referenciaOrden(orden),
          titulo: 'El proveedor aceptó la orden de compra',
          anterior: 'Enviada a proveedor',
          posterior: 'Aceptada',
          tono: 'logrado',
          autor: siguienteGestor(),
        }),
      })
    }

    if (orden.estado === 'recepcion_conforme') {
      pasos.push({
        aplicar: (borrador) => {
          ordenDe(borrador, orden.id).estado = 'recepcion_conforme'
        },
        crear: eventoEntidad({
          entidad: referenciaOrden(orden),
          titulo: 'Se registró la recepción conforme de la orden de compra',
          anterior: 'Aceptada',
          posterior: 'Recepción conforme',
          tono: 'logrado',
          autor: siguienteGestor(),
        }),
      })
    }

    if (orden.estado === 'cancelada') {
      pasos.push({
        aplicar: (borrador) => {
          ordenDe(borrador, orden.id).estado = 'cancelada'
        },
        crear: eventoEntidad({
          entidad: referenciaOrden(orden),
          titulo: 'Adquisiciones canceló la orden de compra',
          anterior: 'Enviada a proveedor',
          posterior: 'Cancelada',
          tono: 'detenido',
          autor: siguienteGestor(),
        }),
      })
    }
  }

  for (const factura of transaccion.facturas) {
    const ordenesCubiertas = transaccion.ordenesDeCompra.filter((orden) =>
      orden.montos.some((monto) =>
        factura.montos.some((linea) => linea.montoOrdenCompraId === monto.id),
      ),
    )

    pasos.push({
      aplicar: (borrador) => {
        borrador.facturas.push({
          ...factura,
          estado: 'pendiente',
          montos: factura.montos.map((monto) => ({ ...monto })),
        })
      },
      crear: eventoEntidad({
        entidad: referenciaFactura(factura),
        contexto: { relacionadas: ordenesCubiertas.map(referenciaOrden) },
        titulo: 'Adquisiciones ingresó la factura del proveedor por',
        monto: factura.montos.reduce((total, monto) => total + monto.monto, 0),
        anterior: null,
        posterior: 'Pendiente',
        tono: 'espera',
        autor: siguienteGestor(),
      }),
    })

    if (factura.estado === 'aceptada' || factura.estado === 'rechazada') {
      const aceptada = factura.estado === 'aceptada'

      pasos.push({
        aplicar: (borrador) => {
          facturaDe(borrador, factura.id).estado = factura.estado
        },
        crear: eventoEntidad({
          entidad: referenciaFactura(factura),
          titulo: aceptada ? 'Se aceptó la factura' : 'Se rechazó la factura',
          anterior: 'Pendiente',
          posterior: aceptada ? 'Aceptada' : 'Rechazada',
          tono: aceptada ? 'logrado' : 'detenido',
          autor: siguienteGestor(),
        }),
      })
    }
  }

  for (const solicitud of transaccion.solicitudes) {
    if (solicitud.estado === 'completada') {
      pasos.push({
        aplicar: (borrador) => {
          solicitudDe(borrador, solicitud.id).estado = 'completada'
        },
        crear: eventoEntidad({
          entidad: referenciaSolicitud(solicitud.id),
          contexto: { unidad: ADQUISICIONES },
          titulo: 'Adquisiciones completó la solicitud',
          anterior: 'En proceso',
          posterior: 'Completada',
          tono: 'logrado',
          autor: siguienteGestor(),
        }),
      })
    }

    if (solicitud.estado === 'rechazada') {
      pasos.push({
        aplicar: (borrador) => {
          solicitudDe(borrador, solicitud.id).estado = 'rechazada'
        },
        crear: eventoEntidad({
          entidad: referenciaSolicitud(solicitud.id),
          contexto: { unidad: ADQUISICIONES },
          titulo: 'Adquisiciones rechazó la solicitud',
          anterior: llegaAProceso(solicitud) ? 'En proceso' : 'Asignado',
          posterior: 'Rechazada',
          tono: 'detenido',
          autor: siguienteGestor(),
        }),
      })
    }
  }

  return pasos
}

function fecharSecuencia(pasos: Paso[], desde: number): PasoFechado[] {
  return pasos.map((paso, indice) => ({
    paso,
    instante: desde + indice * MILISEGUNDOS_POR_MINUTO,
  }))
}

function repartir(pasos: Paso[], desde: number, hasta: number): PasoFechado[] {
  const tramo = Math.max(hasta - desde, pasos.length * MILISEGUNDOS_POR_MINUTO)

  return pasos.map((paso, indice) => ({
    paso,
    instante: desde + Math.round((tramo * (indice + 1)) / pasos.length),
  }))
}

function ultimoMovimientoDe(transaccionId: number): number | null {
  const registroMonitoreo = monitoreoMock.find((item) => item.transaccionId === transaccionId)

  return registroMonitoreo?.ultimoMovimiento?.getTime() ?? null
}

function ejecutar(transaccion: TransaccionAlmacenada, pasos: PasoFechado[]): EventoHistorial[] {
  const borrador = estadoInicial(transaccion)
  const eventos: EventoHistorial[] = []
  let estadoPrevio: EstadoTransaccion | null = null

  pasos.forEach(({ paso, instante }, indice) => {
    const fecha = new Date(instante).toISOString()

    paso.aplicar?.(borrador)

    if (paso.crear) {
      eventos.push(paso.crear(`gen-${transaccion.id}-${indice + 1}`, fecha))
    }

    const estado = estadoDe(borrador)

    if (estado !== null && estado !== estadoPrevio) {
      eventos.push({
        clase: 'hito',
        id: `gen-${transaccion.id}-hito-${indice + 1}`,
        fecha,
        estado: etiquetaEstado(estado),
        explicacion: EXPLICACION_HITO[estado],
      })
    }

    estadoPrevio = estado
  })

  return eventos
}

function generarHistorial(transaccion: TransaccionAlmacenada): EventoHistorial[] {
  const asignaciones = asignacionesMock.filter((item) => item.transaccionId === transaccion.id)
  const terminadas = asignacionesTerminadasMock.filter(
    (item) => item.transaccionId === transaccion.id,
  )
  const principal =
    asignaciones.find((item) => item.participacion === 'principal') ??
    terminadas.find((item) => item.participacion === 'principal')
  const apoyo = asignaciones.filter((item) => item.participacion === 'apoyo')

  const administrador = nombreDeRun(RUN_ADMINISTRADOR)
  const responsable = principal ? nombreDeRun(principal.run) : administrador
  const gestores = [responsable, ...apoyo.map((item) => nombreDeRun(item.run))]
  let turno = 0

  const siguienteGestor = (): string => {
    const autor = gestores[turno % gestores.length]
    turno += 1
    return autor
  }

  const creacion = Date.parse(transaccion.creadaEn)
  const inicio: Paso[] = []

  if (principal) {
    inicio.push({ crear: registro(`${responsable} quedó como analista principal`, responsable) })
  }

  const confirmadaEn = transaccion.confirmadaEn

  if (confirmadaEn === null) {
    inicio.push({ crear: registro('Transacción creada', responsable) })
    return ejecutar(transaccion, fecharSecuencia(inicio, creacion))
  }

  transaccion.solicitudes.forEach((solicitud, posicion) => {
    const unidad = resolverUnidad(solicitud.unidadId)

    inicio.push({
      crear: eventoEntidad({
        entidad: referenciaSolicitud(solicitud.id),
        contexto: {
          unidad: { nombre: unidad.nombre },
          campus: unidad.sedes.map((sede) => sede.label).join(', '),
        },
        titulo:
          posicion === 0
            ? `${unidad.nombre} ingresó la solicitud y creó la transacción`
            : `${unidad.nombre} sumó su solicitud a la transacción`,
        anterior: null,
        posterior: 'Enviada',
        tono: 'registrado',
        autor: responsable,
      }),
    })
  })

  const confirmacion: Paso = {
    aplicar: (borrador) => {
      borrador.confirmadaEn = confirmadaEn
      borrador.solicitudes.forEach((solicitud) => {
        solicitud.estado = 'enviada'
      })
    },
  }

  const previos: Paso[] = [
    ...apoyo.map((item) => ({
      crear: registro(`${nombreDeRun(item.run)} se sumó como analista de apoyo`, administrador),
    })),
    ...pasosPrevios(transaccion, siguienteGestor),
  ]
  const posteriores = pasosPosteriores(transaccion, siguienteGestor)

  const cierre: PasoFechado[] = terminadas.map((item) => ({
    paso: {
      crear: registro(
        `Terminó la asignación de ${nombreDeRun(item.run)} como analista ${item.participacion === 'principal' ? 'principal' : 'de apoyo'}`,
        administrador,
        item.motivo,
      ),
    },
    instante: Date.parse(item.terminadaEn),
  }))

  const confirmada = Date.parse(confirmadaEn)
  const fin = ultimoMovimientoDe(transaccion.id) ?? confirmada

  const proceso: PasoFechado[] = transaccion.pasos.map((registrado) => ({
    paso: pasoDeProceso(registrado),
    instante: Date.parse(registrado.registradoEn),
  }))

  const gestion: PasoFechado[] =
    proceso.length === 0
      ? repartir([...previos, ...posteriores], confirmada, fin)
      : [
          ...repartir(previos, confirmada, proceso[0].instante - MILISEGUNDOS_POR_HORA),
          ...proceso,
          ...repartir(posteriores, proceso[proceso.length - 1].instante, fin),
        ]

  return ejecutar(transaccion, [
    ...fecharSecuencia(inicio, creacion),
    { paso: confirmacion, instante: confirmada },
    ...gestion,
    ...cierre,
  ])
}

export function generarHistoriales(
  existentes: ReadonlyMap<number, EventoHistorial[]>,
): Map<number, EventoHistorial[]> {
  return new Map(
    transaccionesMock
      .filter((transaccion) => !existentes.has(transaccion.id))
      .map((transaccion): [number, EventoHistorial[]] => [
        transaccion.id,
        generarHistorial(transaccion),
      ]),
  )
}

function ordenarPorFecha(eventos: EventoHistorial[]): EventoHistorial[] {
  return [...eventos].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))
}

export function incorporarPasos(
  existentes: ReadonlyMap<number, EventoHistorial[]>,
): Map<number, EventoHistorial[]> {
  return new Map(
    Array.from(existentes, ([transaccionId, eventos]): [number, EventoHistorial[]] => {
      const transaccion = transaccionesMock.find((item) => item.id === transaccionId)

      if (!transaccion) {
        return [transaccionId, eventos]
      }

      const deProceso = transaccion.pasos.flatMap((registrado, indice): EventoHistorial[] => [
        eventoPaso(registrado)(`paso-${transaccionId}-${indice + 1}`, registrado.registradoEn),
        {
          clase: 'hito',
          id: `paso-${transaccionId}-hito-${indice + 1}`,
          fecha: registrado.registradoEn,
          estado: etiquetaEstado(registrado.paso),
          explicacion: EXPLICACION_HITO[registrado.paso],
        },
      ])

      return [transaccionId, ordenarPorFecha([...eventos, ...deProceso])]
    }),
  )
}
