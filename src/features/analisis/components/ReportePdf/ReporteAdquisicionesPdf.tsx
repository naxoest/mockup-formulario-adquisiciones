import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { FiltrosReporte, ReporteAdquisiciones } from '@/features/analisis/types/reporte.types'
import { etiquetaMes } from '@/features/analisis/utils/reporte'
import { formatCLP } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'
import { estilos } from './estilos'
import { registrarFuentes } from './fuentes'
import { Cabecera, Indicador, Pie } from './Marco'
import { GraficoBarrasPdf } from './GraficoBarrasPdf'
import { GraficoColumnasPdf } from './GraficoColumnasPdf'
import { GraficoLineasPdf } from './GraficoLineasPdf'
import { GraficoTortaPdf } from './GraficoTortaPdf'
import { construirSintesis } from './sintesis'
import { TablaDistribucion, type ColumnaTabla } from './TablaDistribucion'

registrarFuentes()

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

interface ReporteAdquisicionesPdfProps {
  reporte: ReporteAdquisiciones
  filtros: FiltrosReporte
}

function textoPeriodo(reporte: ReporteAdquisiciones, filtros: FiltrosReporte): string {
  if (filtros.etiquetaPeriodo) return filtros.etiquetaPeriodo
  const { desde, hasta } = reporte.periodo
  if (desde && hasta) return `${formatoFecha.format(desde)} al ${formatoFecha.format(hasta)}`
  if (desde) return `Desde el ${formatoFecha.format(desde)}`
  if (hasta) return `Hasta el ${formatoFecha.format(hasta)}`
  return 'Periodo completo'
}

export function ReporteAdquisicionesPdf({ reporte, filtros }: ReporteAdquisicionesPdfProps) {
  const titulo = filtros.titulo ?? 'Reporte de adquisiciones'
  const emision = formatoFecha.format(new Date())
  const periodo = textoPeriodo(reporte, filtros)
  const parrafos = construirSintesis(reporte)

  const columnasTipo: ColumnaTabla<ReporteAdquisiciones['porTipo'][number]>[] = [
    { titulo: 'Tipo', ancho: '46%', celda: (fila) => fila.tipo.label },
    {
      titulo: 'Registros',
      ancho: '14%',
      derecha: true,
      celda: (fila) => String(fila.registros),
    },
    {
      titulo: 'Monto comprometido',
      ancho: '25%',
      derecha: true,
      celda: (fila) => formatCLP(fila.comprometido),
    },
    {
      titulo: '% del monto',
      ancho: '15%',
      derecha: true,
      celda: (fila) => formatPercentage(fila.participacion),
    },
  ]

  const columnasModalidad: ColumnaTabla<ReporteAdquisiciones['porModalidad'][number]>[] = [
    { titulo: 'Modalidad', ancho: '46%', celda: (fila) => fila.modalidad.label },
    {
      titulo: 'Registros',
      ancho: '14%',
      derecha: true,
      celda: (fila) => String(fila.registros),
    },
    {
      titulo: 'Monto comprometido',
      ancho: '25%',
      derecha: true,
      celda: (fila) => formatCLP(fila.comprometido),
    },
    {
      titulo: '% del monto',
      ancho: '15%',
      derecha: true,
      celda: (fila) => formatPercentage(fila.participacion),
    },
  ]

  const columnasCampus: ColumnaTabla<ReporteAdquisiciones['porCampus'][number]>[] = [
    { titulo: 'Campus', ancho: '60%', celda: (fila) => fila.campus.label },
    {
      titulo: 'Monto comprometido',
      ancho: '25%',
      derecha: true,
      celda: (fila) => formatCLP(fila.comprometido),
    },
    {
      titulo: '% del monto',
      ancho: '15%',
      derecha: true,
      celda: (fila) => formatPercentage(fila.participacion),
    },
  ]

  const columnasUnidad: ColumnaTabla<ReporteAdquisiciones['porUnidad'][number]>[] = [
    { titulo: '#', ancho: '5%', celda: (_fila, indice) => String(indice + 1) },
    { titulo: 'Unidad', ancho: '40%', celda: (fila) => fila.unidad.label },
    { titulo: 'Campus', ancho: '15%', celda: (fila) => fila.campus.label },
    {
      titulo: 'Monto comprometido',
      ancho: '25%',
      derecha: true,
      celda: (fila) => formatCLP(fila.comprometido),
    },
    {
      titulo: '% del monto',
      ancho: '15%',
      derecha: true,
      celda: (fila) => formatPercentage(fila.participacion),
    },
  ]

  const totalMonto = formatCLP(reporte.totales.comprometido)

  const sectoresTipo = reporte.porTipo.map((fila) => ({
    etiqueta: fila.tipo.label,
    valor: fila.comprometido,
    valorFormateado: formatCLP(fila.comprometido),
    porcentajeFormateado: formatPercentage(fila.participacion),
  }))

  const columnasModalidadGrafico = reporte.porModalidad.map((fila) => ({
    etiqueta: fila.modalidad.label,
    valor: fila.comprometido,
    valorFormateado: formatCLP(fila.comprometido),
  }))

  const columnasCampusGrafico = reporte.porCampus.map((fila) => ({
    etiqueta: fila.campus.label,
    valor: fila.comprometido,
    valorFormateado: formatCLP(fila.comprometido),
  }))

  const barrasUnidades = reporte.porUnidad.slice(0, 10).map((fila) => ({
    etiqueta: fila.unidad.label,
    valor: fila.comprometido,
    valorFormateado: formatCLP(fila.comprometido),
  }))

  const puntosEvolucion = reporte.evolucion.map((punto) => ({
    etiqueta: etiquetaMes(punto.mes),
    comprometido: punto.comprometido,
    facturado: punto.facturado,
  }))

  const maximoEvolucion = formatCLP(
    Math.max(0, ...reporte.evolucion.flatMap((punto) => [punto.comprometido, punto.facturado])),
  )

  return (
    <Document title={titulo}>
      <Page size="A4" style={estilos.pagina} wrap>
        <Cabecera />
        <Pie titulo={titulo} />

        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.periodo}>
          {periodo} · Generado el {emision}
        </Text>

        <View style={estilos.franja}>
          <Indicador etiqueta="REGISTROS" valor={String(reporte.totales.registros)} primero />
          <Indicador etiqueta="OC VÁLIDAS" valor={String(reporte.totales.ocValidas)} />
          <Indicador etiqueta="MONTO COMPROMETIDO" valor={totalMonto} />
          <Indicador
            etiqueta="CONCENTRACIÓN TOP 3"
            valor={formatPercentage(reporte.totales.concentracionTop3)}
          />
          <Indicador
            etiqueta="TRATO DIRECTO"
            valor={formatPercentage(reporte.totales.tratoDirectoParticipacion)}
          />
        </View>

        {parrafos.map((parrafo, indice) => (
          <Text key={indice} style={estilos.parrafo}>
            {parrafo}
          </Text>
        ))}

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>DISTRIBUCIÓN POR TIPO</Text>
          <GraficoTortaPdf sectores={sectoresTipo} />
          <TablaDistribucion
            columnas={columnasTipo}
            filas={reporte.porTipo}
            total={['Total', String(reporte.totales.registros), totalMonto, null]}
          />
        </View>

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>DISTRIBUCIÓN POR MODALIDAD</Text>
          <GraficoColumnasPdf columnas={columnasModalidadGrafico} />
          <TablaDistribucion
            columnas={columnasModalidad}
            filas={reporte.porModalidad}
            total={['Total', String(reporte.totales.registros), totalMonto, null]}
          />
        </View>

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>INVERSIÓN POR CAMPUS</Text>
          <GraficoColumnasPdf columnas={columnasCampusGrafico} />
          <TablaDistribucion
            columnas={columnasCampus}
            filas={reporte.porCampus}
            total={['Total', totalMonto, null]}
          />
        </View>

        <View break wrap={false}>
          <Text style={estilos.rotuloSeccion}>EVOLUCIÓN MENSUAL</Text>
          <GraficoLineasPdf puntos={puntosEvolucion} maximoFormateado={maximoEvolucion} />
        </View>
      </Page>

      <Page size="A4" style={estilos.pagina} wrap>
        <Cabecera />
        <Pie titulo={titulo} />

        <Text style={estilos.titulo}>Detalle por unidad</Text>
        <Text style={estilos.periodo}>{periodo}</Text>

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>DIEZ UNIDADES CON MAYOR MONTO COMPROMETIDO</Text>
          <GraficoBarrasPdf barras={barrasUnidades} />
        </View>

        <Text style={estilos.rotuloSeccion}>DETALLE COMPLETO</Text>
        <TablaDistribucion
          columnas={columnasUnidad}
          filas={reporte.porUnidad}
          total={['', 'Total', '', totalMonto, null]}
          encabezadoFijo
        />
      </Page>
    </Document>
  )
}
