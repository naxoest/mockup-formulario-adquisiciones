import { catalogosAdquisicionesMock } from '@/mocks/data/filtrosAdquisiciones.mock'
import type { TransaccionReporteMock } from '@/mocks/data/reporteAdquisiciones.mock'

interface OpcionMock {
  value: string
  label: string
}

interface FiltrosConsulta {
  desde: string | null
  hasta: string | null
}

export function leerFiltrosConsulta(parametros: URLSearchParams): FiltrosConsulta {
  return {
    desde: parametros.get('desde'),
    hasta: parametros.get('hasta'),
  }
}

function resolverOpcion(catalogo: OpcionMock[], value: string): OpcionMock {
  return catalogo.find((opcion) => opcion.value === value) ?? { value, label: value }
}

function participacion(parte: number, total: number): number {
  return total > 0 ? (parte / total) * 100 : 0
}

function sumar(transacciones: TransaccionReporteMock[], campo: 'comprometido' | 'facturado') {
  return transacciones.reduce((acumulado, item) => acumulado + item[campo], 0)
}

function agrupar<T>(
  transacciones: TransaccionReporteMock[],
  clave: (item: TransaccionReporteMock) => string,
  construir: (grupo: TransaccionReporteMock[], valor: string) => T,
): T[] {
  const grupos = new Map<string, TransaccionReporteMock[]>()

  for (const item of transacciones) {
    const llave = clave(item)
    const existente = grupos.get(llave)
    if (existente) {
      existente.push(item)
    } else {
      grupos.set(llave, [item])
    }
  }

  return [...grupos.entries()].map(([valor, grupo]) => construir(grupo, valor))
}

export function agregarReporte(transacciones: TransaccionReporteMock[], filtros: FiltrosConsulta) {
  const seleccionadas = transacciones.filter((item) => {
    if (filtros.desde && item.fecha < filtros.desde) return false
    if (filtros.hasta && item.fecha > filtros.hasta) return false
    return true
  })

  const fechas = seleccionadas.map((item) => item.fecha).sort()
  const comprometido = sumar(seleccionadas, 'comprometido')

  const porUnidad = agrupar(
    seleccionadas,
    (item) => item.unidad,
    (grupo, valor) => ({
      unidad: resolverOpcion(catalogosAdquisicionesMock.unidades, valor),
      campus: resolverOpcion(catalogosAdquisicionesMock.campus, grupo[0]?.campus ?? ''),
      comprometido: sumar(grupo, 'comprometido'),
      participacion: participacion(sumar(grupo, 'comprometido'), comprometido),
    }),
  ).sort((a, b) => b.comprometido - a.comprometido)

  const porModalidad = agrupar(
    seleccionadas,
    (item) => item.modalidad,
    (grupo, valor) => ({
      modalidad: resolverOpcion(catalogosAdquisicionesMock.modalidades, valor),
      registros: grupo.length,
      comprometido: sumar(grupo, 'comprometido'),
      participacion: participacion(sumar(grupo, 'comprometido'), comprometido),
    }),
  ).sort((a, b) => b.comprometido - a.comprometido)

  const tratoDirecto = porModalidad.find((fila) => fila.modalidad.value === 'trato_directo')
  const top3 = porUnidad.slice(0, 3).reduce((total, fila) => total + fila.comprometido, 0)

  return {
    periodo: {
      desde: filtros.desde ?? fechas[0] ?? null,
      hasta: filtros.hasta ?? fechas[fechas.length - 1] ?? null,
    },
    totales: {
      registros: seleccionadas.length,
      ocValidas: seleccionadas.filter((item) => item.esValida).length,
      comprometido,
      concentracionTop3: participacion(top3, comprometido),
      tratoDirectoParticipacion: tratoDirecto?.participacion ?? 0,
    },
    evolucion: agrupar(
      seleccionadas,
      (item) => item.fecha.slice(0, 7),
      (grupo, mes) => ({
        mes,
        comprometido: sumar(grupo, 'comprometido'),
        facturado: sumar(grupo, 'facturado'),
      }),
    ).sort((a, b) => a.mes.localeCompare(b.mes)),
    porTipo: agrupar(
      seleccionadas,
      (item) => item.tipo,
      (grupo, valor) => ({
        tipo: resolverOpcion(catalogosAdquisicionesMock.tipos, valor),
        registros: grupo.length,
        comprometido: sumar(grupo, 'comprometido'),
        participacion: participacion(sumar(grupo, 'comprometido'), comprometido),
      }),
    ).sort((a, b) => b.comprometido - a.comprometido),
    porModalidad,
    porUnidad,
    porCampus: agrupar(
      seleccionadas,
      (item) => item.campus,
      (grupo, valor) => ({
        campus: resolverOpcion(catalogosAdquisicionesMock.campus, valor),
        comprometido: sumar(grupo, 'comprometido'),
        participacion: participacion(sumar(grupo, 'comprometido'), comprometido),
      }),
    ).sort((a, b) => b.comprometido - a.comprometido),
  }
}
