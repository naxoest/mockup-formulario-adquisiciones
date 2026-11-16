import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { PerfilUnidad } from '@/features/analisis/types/perfilUnidad.types'
import { etiquetaMes } from '@/features/analisis/utils/reporte'
import { formatCLP } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'
import { estilos } from './estilos'
import { registrarFuentes } from './fuentes'
import { GraficoColumnasPdf } from './GraficoColumnasPdf'
import { GraficoLineasPdf } from './GraficoLineasPdf'
import { Cabecera, Indicador, Pie } from './Marco'
import { construirSintesisPerfil } from './sintesis'
import { TablaDistribucion, type ColumnaTabla } from './TablaDistribucion'

registrarFuentes()

const TITULO = 'Soporte de gasto por unidad'

const formatoFecha = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

type FilaModalidad = PerfilUnidad['porModalidad'][number]
type RegistroDetalle = PerfilUnidad['detalle'][number]

function fechaCivil(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-')
  return anio && mes && dia ? `${dia}-${mes}-${anio}` : fecha
}

interface ReportePerfilUnidadPdfProps {
  perfil: PerfilUnidad
}

export function ReportePerfilUnidadPdf({ perfil }: ReportePerfilUnidadPdfProps) {
  const { unidad, totales } = perfil
  const emision = formatoFecha.format(new Date())
  const sedes = unidad.sedes.map((sede) => sede.label).join(', ')
  const identificacion = `${unidad.tipo.label} · Campus ${sedes} · CR ${unidad.cr}`
  const parrafos = construirSintesisPerfil(perfil)
  const totalMonto = formatCLP(totales.comprometido)
  const registrosModalidad = perfil.porModalidad.reduce(
    (acumulado, fila) => acumulado + fila.registros,
    0,
  )

  const columnasModalidad: ColumnaTabla<FilaModalidad>[] = [
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

  const columnasDetalle: ColumnaTabla<RegistroDetalle>[] = [
    { titulo: '#', ancho: '5%', celda: (fila) => String(fila.transaccionId) },
    { titulo: 'Fecha', ancho: '11%', celda: (fila) => fechaCivil(fila.fecha) },
    { titulo: 'Tipo', ancho: '11%', celda: (fila) => fila.tipo.label },
    { titulo: 'Modalidad', ancho: '18%', celda: (fila) => fila.modalidad.label },
    {
      titulo: 'N° OC',
      ancho: '18%',
      celda: (fila) =>
        fila.ordenDeCompra.estado === 'cancelada'
          ? `${fila.ordenDeCompra.codigo} (cancelada)`
          : fila.ordenDeCompra.codigo,
    },
    {
      titulo: 'Monto OC',
      ancho: '12%',
      derecha: true,
      celda: (fila) => formatCLP(fila.monto),
    },
    {
      titulo: 'Estado',
      ancho: '12%',
      celda: (fila) => fila.estadoSolicitud?.label ?? 'Sin información',
    },
    {
      titulo: 'Evaluada',
      ancho: '13%',
      celda: (fila) => fila.estadoEvaluacion?.label ?? 'Sin información',
    },
  ]

  const columnasModalidadGrafico = perfil.porModalidad.map((fila) => ({
    etiqueta: fila.modalidad.label,
    valor: fila.comprometido,
    valorFormateado: formatCLP(fila.comprometido),
  }))

  const puntosEvolucion = perfil.evolucion.map((punto) => ({
    etiqueta: etiquetaMes(punto.mes),
    comprometido: punto.comprometido,
    facturado: punto.facturado,
  }))

  const maximoEvolucion = formatCLP(
    Math.max(0, ...perfil.evolucion.flatMap((punto) => [punto.comprometido, punto.facturado])),
  )

  return (
    <Document title={`${TITULO} · ${unidad.nombre}`}>
      <Page size="A4" style={estilos.pagina} wrap>
        <Cabecera />
        <Pie titulo={TITULO} />

        <Text style={estilos.titulo}>{TITULO}</Text>
        <Text style={estilos.subtitulo}>{unidad.nombre}</Text>
        <Text style={estilos.periodo}>
          {identificacion} · Generado el {emision}
        </Text>

        <View style={estilos.franja}>
          <Indicador etiqueta="REGISTROS" valor={String(totales.registros)} primero />
          <Indicador etiqueta="OC VÁLIDAS" valor={`${totales.ocValidas} de ${totales.ordenes}`} />
          <Indicador etiqueta="MONTO COMPROMETIDO" valor={totalMonto} />
          <Indicador
            etiqueta="% DEL TOTAL GLOBAL"
            valor={formatPercentage(totales.participacionGlobal)}
          />
          <Indicador etiqueta="PRECOMPROMETIDO" valor={formatCLP(totales.precomprometido)} />
        </View>

        {parrafos.map((parrafo, indice) => (
          <Text key={indice} style={estilos.parrafo}>
            {parrafo}
          </Text>
        ))}

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>DISTRIBUCIÓN POR MODALIDAD</Text>
          <GraficoColumnasPdf columnas={columnasModalidadGrafico} />
          {perfil.porModalidad.length > 0 ? (
            <TablaDistribucion
              columnas={columnasModalidad}
              filas={perfil.porModalidad}
              total={['Total', String(registrosModalidad), totalMonto, null]}
            />
          ) : null}
        </View>

        <View wrap={false}>
          <Text style={estilos.rotuloSeccion}>EVOLUCIÓN MENSUAL</Text>
          <GraficoLineasPdf puntos={puntosEvolucion} maximoFormateado={maximoEvolucion} />
        </View>
      </Page>

      <Page size="A4" style={estilos.pagina} wrap>
        <Cabecera />
        <Pie titulo={TITULO} />

        <Text style={estilos.titulo}>Detalle de transacciones</Text>
        <Text style={estilos.subtitulo}>{unidad.nombre}</Text>
        <Text style={estilos.periodo}>{identificacion}</Text>

        <Text style={estilos.rotuloSeccion}>MONTOS DE ORDEN DE COMPRA ATRIBUIDOS A LA UNIDAD</Text>
        {perfil.detalle.length > 0 ? (
          <TablaDistribucion columnas={columnasDetalle} filas={perfil.detalle} encabezadoFijo />
        ) : (
          <Text style={estilos.vacioGrafico}>La unidad no registra órdenes de compra.</Text>
        )}
      </Page>
    </Document>
  )
}
