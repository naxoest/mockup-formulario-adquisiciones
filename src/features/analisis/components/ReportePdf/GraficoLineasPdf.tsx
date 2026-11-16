import { G, Line, Polyline, Svg, Text, View } from '@react-pdf/renderer'
import { estilos, NEGRO, REGLA, TINTA } from './estilos'

export interface PuntoLineaPdf {
  etiqueta: string
  comprometido: number
  facturado: number
}

interface GraficoLineasPdfProps {
  puntos: PuntoLineaPdf[]
  maximoFormateado: string
}

const ANCHO = 498
const ALTO = 156
const MARGEN = { arriba: 5, derecha: 5, abajo: 5, izquierda: 5 }
const ANCHO_INTERIOR = ANCHO - MARGEN.izquierda - MARGEN.derecha
const ALTO_INTERIOR = ALTO - MARGEN.arriba - MARGEN.abajo

export function GraficoLineasPdf({ puntos, maximoFormateado }: GraficoLineasPdfProps) {
  if (puntos.length < 2) {
    return <Text style={estilos.vacioGrafico}>Sin movimientos suficientes en el periodo</Text>
  }

  const maximo = Math.max(...puntos.flatMap((punto) => [punto.comprometido, punto.facturado]))
  const paso = ANCHO_INTERIOR / (puntos.length - 1)

  const trazar = (obtener: (punto: PuntoLineaPdf) => number) =>
    puntos
      .map((punto, indice) => {
        const proporcion = maximo > 0 ? obtener(punto) / maximo : 0
        return `${indice * paso},${ALTO_INTERIOR - proporcion * ALTO_INTERIOR}`
      })
      .join(' ')

  return (
    <View style={estilos.grafico} wrap={false}>
      <Text style={estilos.escalaLineas}>Máximo del periodo: {maximoFormateado}</Text>

      <Svg width={ANCHO} height={ALTO}>
        <G transform={`translate(${MARGEN.izquierda}, ${MARGEN.arriba})`}>
          <Line
            x1={0}
            y1={ALTO_INTERIOR}
            x2={ANCHO_INTERIOR}
            y2={ALTO_INTERIOR}
            stroke={NEGRO}
            strokeWidth={0.5}
          />
          <Line x1={0} y1={0} x2={ANCHO_INTERIOR} y2={0} stroke={REGLA} strokeWidth={0.5} />
          <Polyline
            points={trazar((punto) => punto.comprometido)}
            fill="none"
            stroke={TINTA}
            strokeWidth={1.2}
          />
          <Polyline
            points={trazar((punto) => punto.facturado)}
            fill="none"
            stroke={TINTA}
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />
        </G>
      </Svg>

      <View style={estilos.filaMeses}>
        {puntos.map((punto) => (
          <View key={punto.etiqueta} style={estilos.celdaMes}>
            <Text style={estilos.etiquetaMesGrafico}>{punto.etiqueta}</Text>
          </View>
        ))}
      </View>

      <View style={estilos.leyenda}>
        <View style={estilos.itemLeyenda}>
          <Svg width={22} height={3}>
            <Line x1={0} y1={1.5} x2={22} y2={1.5} stroke={TINTA} strokeWidth={1.2} />
          </Svg>
          <Text style={estilos.textoLeyenda}>Comprometido</Text>
        </View>
        <View style={estilos.itemLeyenda}>
          <Svg width={22} height={3}>
            <Line
              x1={0}
              y1={1.5}
              x2={22}
              y2={1.5}
              stroke={TINTA}
              strokeWidth={1.2}
              strokeDasharray="5 4"
            />
          </Svg>
          <Text style={estilos.textoLeyenda}>Facturado</Text>
        </View>
      </View>
    </View>
  )
}
