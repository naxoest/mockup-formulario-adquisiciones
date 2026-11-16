import {
  estadoEvaluacionOptions,
  estadoSolicitudOptions,
  modalidadOptions,
  tipoSolicitanteOptions,
  tipoSolicitudOptions,
} from '@/mocks/data/listas.mock'
import type {
  OrdenDeCompra,
  Transaccion,
  UnidadSolicitante,
} from '@/features/transacciones/types/transaccion.types'
import type { SelectOption } from '@/types/select'

const FECHA_CIVIL = /^\d{4}-\d{2}-\d{2}$/

interface ConsultaRankingUnidades {
  campus: string[]
  desde: string | null
  hasta: string | null
  limite: number | null
}

interface AcumuladoUnidad {
  unidad: UnidadSolicitante
  comprometido: number
  ordenes: Set<number>
  ordenesValidas: Set<number>
  modalidades: Set<string>
}

interface MontosMes {
  comprometido: number
  facturado: number
}

interface ResumenModalidadAcumulado {
  registros: number
  comprometido: number
}

interface RegistroPerfil {
  id: number
  transaccionId: number
  fecha: string
  tipo: SelectOption
  modalidad: SelectOption
  ordenDeCompra: { id: number; codigo: string; estado: string }
  monto: number
  estadoSolicitud: SelectOption | null
  estadoEvaluacion: SelectOption | null
  observaciones: string | null
}

function leerFecha(parametros: URLSearchParams, clave: string): string | null {
  const valor = parametros.get(clave)
  return valor !== null && FECHA_CIVIL.test(valor) ? valor : null
}

export function leerConsultaRanking(parametros: URLSearchParams): ConsultaRankingUnidades {
  const limite = Number(parametros.get('limite'))

  return {
    campus: parametros.getAll('campus'),
    desde: leerFecha(parametros, 'desde'),
    hasta: leerFecha(parametros, 'hasta'),
    limite: Number.isInteger(limite) && limite > 0 ? limite : null,
  }
}

function etiquetar(valor: string, opciones: SelectOption[]): SelectOption {
  return opciones.find((opcion) => opcion.value === valor) ?? { value: valor, label: valor }
}

function participacion(parte: number, total: number): number {
  return total > 0 ? (parte / total) * 100 : 0
}

function sumar(valores: number[]): number {
  return valores.reduce((total, valor) => total + valor, 0)
}

function enPeriodo(fecha: string, consulta: ConsultaRankingUnidades): boolean {
  if (consulta.desde !== null && fecha < consulta.desde) return false
  if (consulta.hasta !== null && fecha > consulta.hasta) return false
  return true
}

function resumirUnidad(unidad: UnidadSolicitante) {
  return {
    id: unidad.id,
    nombre: unidad.nombre,
    cr: unidad.cr,
    tipo: etiquetar(unidad.tipo, tipoSolicitanteOptions),
    sedes: unidad.sedes,
  }
}

function claveMes(anio: number, mes: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

function completarMeses(porMes: Map<string, MontosMes>) {
  const meses = [...porMes.keys()].sort()
  const primero = meses[0]
  const ultimo = meses[meses.length - 1]

  if (!primero || !ultimo) return []

  let anio = Number(primero.slice(0, 4))
  let mes = Number(primero.slice(5, 7))
  const anioFinal = Number(ultimo.slice(0, 4))
  const mesFinal = Number(ultimo.slice(5, 7))
  const puntos: Array<{ mes: string; comprometido: number; facturado: number }> = []

  while (anio < anioFinal || (anio === anioFinal && mes <= mesFinal)) {
    const clave = claveMes(anio, mes)
    const montos = porMes.get(clave)

    puntos.push({
      mes: clave,
      comprometido: montos?.comprometido ?? 0,
      facturado: montos?.facturado ?? 0,
    })

    if (mes === 12) {
      anio += 1
      mes = 1
    } else {
      mes += 1
    }
  }

  return puntos
}

export function agregarRankingUnidades(
  transacciones: Transaccion[],
  consulta: ConsultaRankingUnidades,
) {
  const acumulados = new Map<number, AcumuladoUnidad>()

  for (const transaccion of transacciones) {
    if (transaccion.confirmadaEn === null || !enPeriodo(transaccion.fecha, consulta)) {
      continue
    }

    const unidadPorSolicitud = new Map(
      transaccion.solicitudes.map((solicitud) => [solicitud.id, solicitud.unidad]),
    )

    for (const orden of transaccion.ordenesDeCompra) {
      const valida = orden.estado !== 'cancelada'

      for (const monto of orden.montos) {
        const unidad = unidadPorSolicitud.get(monto.solicitudId)

        if (!unidad) continue

        const coincideCampus =
          consulta.campus.length === 0 ||
          unidad.sedes.some((sede) => consulta.campus.includes(sede.value))

        if (!coincideCampus) continue

        const acumulado = acumulados.get(unidad.id) ?? {
          unidad,
          comprometido: 0,
          ordenes: new Set<number>(),
          ordenesValidas: new Set<number>(),
          modalidades: new Set<string>(),
        }

        acumulado.ordenes.add(orden.id)

        if (valida) {
          acumulado.ordenesValidas.add(orden.id)
          acumulado.comprometido += monto.monto
          acumulado.modalidades.add(transaccion.modalidad)
        }

        acumulados.set(unidad.id, acumulado)
      }
    }
  }

  const conComprometido = [...acumulados.values()]
    .filter((acumulado) => acumulado.comprometido > 0)
    .sort(
      (a, b) =>
        b.comprometido - a.comprometido ||
        a.unidad.nombre.localeCompare(b.unidad.nombre, 'es-CL') ||
        a.unidad.id - b.unidad.id,
    )

  const comprometidoTotal = conComprometido.reduce(
    (total, acumulado) => total + acumulado.comprometido,
    0,
  )

  const seleccionados =
    consulta.limite === null ? conComprometido : conComprometido.slice(0, consulta.limite)

  return {
    totales: { comprometido: comprometidoTotal },
    data: seleccionados.map((acumulado, indice) => ({
      posicion: indice + 1,
      unidad: resumirUnidad(acumulado.unidad),
      comprometido: acumulado.comprometido,
      participacion: participacion(acumulado.comprometido, comprometidoTotal),
      ordenes: {
        validas: acumulado.ordenesValidas.size,
        total: acumulado.ordenes.size,
      },
      modalidades: [...acumulado.modalidades]
        .map((modalidad) => etiquetar(modalidad, modalidadOptions))
        .sort((a, b) => a.label.localeCompare(b.label, 'es-CL')),
    })),
  }
}

interface LineaPorSolicitud {
  id: number
  solicitudId: number
  monto: number
  facturado: number
}

function lineasPorSolicitud(
  orden: OrdenDeCompra,
  facturadoPorMonto: Map<number, number>,
): LineaPorSolicitud[] {
  const porSolicitud = new Map<number, LineaPorSolicitud>()

  for (const monto of orden.montos) {
    const facturado = facturadoPorMonto.get(monto.id) ?? 0
    const actual = porSolicitud.get(monto.solicitudId)

    if (actual) {
      actual.id = Math.min(actual.id, monto.id)
      actual.monto += monto.monto
      actual.facturado += facturado
    } else {
      porSolicitud.set(monto.solicitudId, {
        id: monto.id,
        solicitudId: monto.solicitudId,
        monto: monto.monto,
        facturado,
      })
    }
  }

  return [...porSolicitud.values()]
}

export function agregarPerfilUnidad(unidad: UnidadSolicitante, transacciones: Transaccion[]) {
  const registros: RegistroPerfil[] = []
  const porMes = new Map<string, MontosMes>()
  const porModalidad = new Map<string, ResumenModalidadAcumulado>()
  const ordenes = new Set<number>()
  const ordenesValidas = new Set<number>()
  let precomprometido = 0

  for (const transaccion of transacciones) {
    if (transaccion.confirmadaEn === null) continue

    const solicitudes = new Map(
      transaccion.solicitudes
        .filter((solicitud) => solicitud.unidad.id === unidad.id)
        .map((solicitud) => [solicitud.id, solicitud]),
    )

    if (solicitudes.size === 0) continue

    precomprometido += sumar(
      [...solicitudes.values()]
        .filter((solicitud) => solicitud.estado !== 'rechazada')
        .map((solicitud) => solicitud.montoCotizacion ?? 0),
    )

    const facturadoPorMonto = new Map<number, number>()

    for (const factura of transaccion.facturas) {
      if (factura.estado === 'rechazada') continue

      for (const montoFactura of factura.montos) {
        facturadoPorMonto.set(
          montoFactura.montoOrdenCompraId,
          (facturadoPorMonto.get(montoFactura.montoOrdenCompraId) ?? 0) + montoFactura.monto,
        )
      }
    }

    const mes = transaccion.fecha.slice(0, 7)

    for (const orden of transaccion.ordenesDeCompra) {
      const valida = orden.estado !== 'cancelada'

      for (const linea of lineasPorSolicitud(orden, facturadoPorMonto)) {
        const solicitud = solicitudes.get(linea.solicitudId)

        if (!solicitud) continue

        ordenes.add(orden.id)

        const montosMes = porMes.get(mes) ?? { comprometido: 0, facturado: 0 }
        montosMes.facturado += linea.facturado

        if (valida) {
          ordenesValidas.add(orden.id)
          montosMes.comprometido += linea.monto

          const resumen = porModalidad.get(transaccion.modalidad) ?? {
            registros: 0,
            comprometido: 0,
          }
          resumen.registros += 1
          resumen.comprometido += linea.monto
          porModalidad.set(transaccion.modalidad, resumen)
        }

        porMes.set(mes, montosMes)

        registros.push({
          id: linea.id,
          transaccionId: transaccion.id,
          fecha: transaccion.fecha,
          tipo: etiquetar(solicitud.tipoSolicitud, tipoSolicitudOptions),
          modalidad: etiquetar(transaccion.modalidad, modalidadOptions),
          ordenDeCompra: { id: orden.id, codigo: orden.codigo, estado: orden.estado },
          monto: linea.monto,
          estadoSolicitud:
            solicitud.estado === null ? null : etiquetar(solicitud.estado, estadoSolicitudOptions),
          estadoEvaluacion:
            solicitud.estadoEvaluacion === null
              ? null
              : etiquetar(solicitud.estadoEvaluacion, estadoEvaluacionOptions),
          observaciones: null,
        })
      }
    }
  }

  registros.sort(
    (a, b) =>
      b.fecha.localeCompare(a.fecha) ||
      b.transaccionId - a.transaccionId ||
      a.ordenDeCompra.id - b.ordenDeCompra.id ||
      a.id - b.id,
  )

  const comprometido = sumar([...porModalidad.values()].map((resumen) => resumen.comprometido))

  const comprometidoGlobal = agregarRankingUnidades(transacciones, {
    campus: [],
    desde: null,
    hasta: null,
    limite: null,
  }).totales.comprometido

  return {
    unidad: resumirUnidad(unidad),
    totales: {
      registros: registros.length,
      ocValidas: ordenesValidas.size,
      ordenes: ordenes.size,
      comprometido,
      comprometidoGlobal,
      participacionGlobal: participacion(comprometido, comprometidoGlobal),
      precomprometido,
    },
    porModalidad: [...porModalidad.entries()]
      .map(([modalidad, resumen]) => ({
        modalidad: etiquetar(modalidad, modalidadOptions),
        registros: resumen.registros,
        comprometido: resumen.comprometido,
        participacion: participacion(resumen.comprometido, comprometido),
      }))
      .sort((a, b) => b.comprometido - a.comprometido),
    evolucion: completarMeses(porMes),
    detalle: registros,
  }
}
