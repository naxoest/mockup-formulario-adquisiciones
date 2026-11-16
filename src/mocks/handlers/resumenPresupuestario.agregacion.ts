import { toCivilDate } from '@/utils/date'
import type { ElementoSerie } from '@/features/inicio/schemas/indicadores.schema'

export interface MontoAnualParaResumen {
  anio: number
  monto: number
}

export interface SolicitudParaResumen {
  precompromisos: MontoAnualParaResumen[]
}

export interface MontoOrdenParaResumen extends MontoAnualParaResumen {
  id: number
}

export interface OrdenParaResumen {
  fechaEmision: string
  montos: MontoOrdenParaResumen[]
}

export interface MontoFacturaParaResumen {
  montoOrdenCompraId: number
  monto: number
}

export interface FacturaParaResumen {
  fechaEmision: string
  montos: MontoFacturaParaResumen[]
}

export interface TransaccionParaResumen {
  fecha: string
  solicitudes: SolicitudParaResumen[]
  ordenesDeCompra: OrdenParaResumen[]
  facturas: FacturaParaResumen[]
}

interface Movimientos {
  precompromiso: number
  compromiso: number
  facturado: number
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

function sinMovimientos(): Movimientos {
  return { precompromiso: 0, compromiso: 0, facturado: 0 }
}

export function agregarResumenPresupuestario(
  transacciones: TransaccionParaResumen[],
  fechaCorte: Date,
) {
  const corte = toCivilDate(fechaCorte)
  const anioCorte = fechaCorte.getFullYear()
  const inicioDelAnio = `${anioCorte}-01-01`
  const porMes = new Map<number, Movimientos>()

  function registrar(fecha: string, anio: number, concepto: keyof Movimientos, monto: number) {
    if (anio !== anioCorte) return

    const dia = fecha.slice(0, 10)

    if (dia > corte) return

    const mes = dia < inicioDelAnio ? 0 : Number(dia.slice(5, 7)) - 1
    const movimientos = porMes.get(mes) ?? sinMovimientos()
    movimientos[concepto] += monto
    porMes.set(mes, movimientos)
  }

  for (const transaccion of transacciones) {
    for (const solicitud of transaccion.solicitudes) {
      for (const precompromiso of solicitud.precompromisos) {
        registrar(transaccion.fecha, precompromiso.anio, 'precompromiso', precompromiso.monto)
      }
    }

    const anioPorLinea = new Map<number, number>()

    for (const orden of transaccion.ordenesDeCompra) {
      for (const linea of orden.montos) {
        anioPorLinea.set(linea.id, linea.anio)
        registrar(orden.fechaEmision, linea.anio, 'compromiso', linea.monto)
      }
    }

    for (const factura of transaccion.facturas) {
      for (const linea of factura.montos) {
        const anio = anioPorLinea.get(linea.montoOrdenCompraId)

        if (anio !== undefined) {
          registrar(factura.fechaEmision, anio, 'facturado', linea.monto)
        }
      }
    }
  }

  const serie: ElementoSerie[] = []

  if (porMes.size > 0) {
    const meses = [...porMes.keys()]
    const primero = Math.min(...meses)
    const ultimo = Math.max(...meses)
    const acumulado = sinMovimientos()

    for (const [mes, periodo] of MESES.entries()) {
      if (mes < primero || mes > ultimo) continue

      const movimientos = porMes.get(mes)

      if (movimientos) {
        acumulado.precompromiso += movimientos.precompromiso
        acumulado.compromiso += movimientos.compromiso
        acumulado.facturado += movimientos.facturado
      }

      serie.push({ periodo, ...acumulado })
    }
  }

  const cantidadTransacciones = transacciones.filter((transaccion) => {
    const dia = transaccion.fecha.slice(0, 10)
    return dia >= inicioDelAnio && dia <= corte
  }).length

  return { fechaCorte: corte, serie, cantidadTransacciones }
}
