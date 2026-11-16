import { Text, View } from '@react-pdf/renderer'
import { estilos } from './estilos'
import type { BarraPdf } from './GraficoBarrasPdf'

interface GraficoColumnasPdfProps {
  columnas: BarraPdf[]
}

export function GraficoColumnasPdf({ columnas }: GraficoColumnasPdfProps) {
  if (columnas.length === 0) {
    return <Text style={estilos.vacioGrafico}>Sin registros en el periodo</Text>
  }

  const maximo = Math.max(...columnas.map((columna) => columna.valor))

  return (
    <View style={estilos.grafico} wrap={false}>
      <View style={estilos.areaColumnas}>
        {columnas.map((columna) => {
          const proporcion = maximo > 0 ? columna.valor / maximo : 0

          return (
            <View key={columna.etiqueta} style={estilos.columna}>
              <View style={{ flexGrow: 1 - proporcion, flexBasis: 0 }} />
              <View style={[estilos.barraVertical, { flexGrow: proporcion, flexBasis: 0 }]} />
            </View>
          )
        })}
      </View>

      <View style={estilos.ejeColumnas} />

      <View style={estilos.filaEtiquetasColumnas}>
        {columnas.map((columna) => (
          <View key={columna.etiqueta} style={estilos.celdaEtiquetaColumna}>
            <Text style={estilos.etiquetaColumna}>{columna.etiqueta}</Text>
            <Text style={estilos.valorColumna}>{columna.valorFormateado}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
