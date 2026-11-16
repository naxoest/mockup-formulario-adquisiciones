import type { PerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'
import type { ReporteAdquisiciones } from '@/features/analisis/types/reporte.types'
import { formatCLP } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'

export function facturadoTotal(reporte: ReporteAdquisiciones): number {
  return reporte.evolucion.reduce((acumulado, punto) => acumulado + punto.facturado, 0)
}

export function construirSintesis(reporte: ReporteAdquisiciones): string[] {
  const { totales, porTipo, porUnidad, porCampus, porModalidad } = reporte
  const parrafos: string[] = []

  const sinOc = totales.registros - totales.ocValidas
  parrafos.push(
    `El periodo registra ${totales.registros} adquisiciones por un monto comprometido de ${formatCLP(totales.comprometido)}, ` +
      `de las cuales ${totales.ocValidas} cuentan con orden de compra válida` +
      (sinOc > 0 ? `, quedando ${sinOc} sin respaldo formal de orden.` : '.') +
      ` Se registran ${porModalidad.length} modalidades de compra distintas.`,
  )

  const tipoLider = porTipo[0]
  const unidadLider = porUnidad[0]
  const campusLider = porCampus[0]

  if (tipoLider && unidadLider && campusLider) {
    parrafos.push(
      `El gasto se concentra en ${tipoLider.tipo.label}, que absorbe el ${formatPercentage(tipoLider.participacion)} del monto. ` +
        `Las tres unidades de mayor gasto reúnen el ${formatPercentage(totales.concentracionTop3)} del total, encabezadas por ` +
        `${unidadLider.unidad.label} con ${formatCLP(unidadLider.comprometido)}. ` +
        `Por campus, ${campusLider.campus.label} lidera con el ${formatPercentage(campusLider.participacion)} de la inversión.`,
    )
  }

  const facturado = facturadoTotal(reporte)
  const brecha = totales.comprometido - facturado

  parrafos.push(
    `El Trato Directo representa el ${formatPercentage(totales.tratoDirectoParticipacion)} del monto comprometido. ` +
      `Frente a los ${formatCLP(totales.comprometido)} comprometidos se han facturado ${formatCLP(facturado)}, ` +
      (brecha > 0
        ? `de modo que quedan ${formatCLP(brecha)} comprometidos y aún no facturados al cierre del periodo.`
        : `sin brecha pendiente de facturación al cierre del periodo.`),
  )

  return parrafos
}

export function construirSintesisPerfil(perfil: PerfilUnidad): string[] {
  const { unidad, totales, porModalidad, evolucion } = perfil
  const parrafos: string[] = []

  if (totales.ordenes === 0) {
    parrafos.push(
      `${unidad.nombre} no registra órdenes de compra. Su monto precomprometido en cotizaciones de solicitudes no rechazadas asciende a ${formatCLP(totales.precomprometido)}.`,
    )
    return parrafos
  }

  const canceladas = totales.ordenes - totales.ocValidas

  parrafos.push(
    `${unidad.nombre} participa en ${totales.ordenes} ${totales.ordenes === 1 ? 'orden' : 'órdenes'} de compra, ` +
      `de las cuales ${totales.ocValidas} ${totales.ocValidas === 1 ? 'es válida' : 'son válidas'}` +
      (canceladas > 0
        ? ` y ${canceladas} ${canceladas === 1 ? 'fue cancelada' : 'fueron canceladas'}`
        : '') +
      `. Su monto comprometido es de ${formatCLP(totales.comprometido)}, equivalente al ${formatPercentage(totales.participacionGlobal)} ` +
      `del comprometido de todas las unidades, y su monto precomprometido es de ${formatCLP(totales.precomprometido)}.`,
  )

  const principal = porModalidad[0]

  if (principal) {
    parrafos.push(
      `La modalidad principal es ${principal.modalidad.label}, que concentra el ${formatPercentage(principal.participacion)} del monto comprometido de la unidad.`,
    )
  }

  const facturado = evolucion.reduce((acumulado, punto) => acumulado + punto.facturado, 0)
  const brecha = totales.comprometido - facturado

  parrafos.push(
    `Frente a los ${formatCLP(totales.comprometido)} comprometidos se han facturado ${formatCLP(facturado)}, ` +
      (brecha > 0
        ? `de modo que quedan ${formatCLP(brecha)} comprometidos y aún no facturados.`
        : 'sin brecha pendiente de facturación.'),
  )

  return parrafos
}
