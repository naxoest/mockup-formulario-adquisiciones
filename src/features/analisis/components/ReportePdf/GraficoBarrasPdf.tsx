import { Text, View } from '@react-pdf/renderer'
import { estilos } from './estilos'

export interface BarraPdf {
  etiqueta: string
  valor: number
  valorFormateado: string
}

interface GraficoBarrasPdfProps {
  barras: BarraPdf[]
}

export function GraficoBarrasPdf({ barras }: GraficoBarrasPdfProps) {
  if (barras.length === 0) {
    return <Text style={estilos.vacioGrafico}>Sin registros en el periodo</Text>
  }

  const maximo = Math.max(...barras.map((barra) => barra.valor))

  return (
    <View style={estilos.grafico} wrap={false}>
      {barras.map((barra) => {
        const proporcion = maximo > 0 ? barra.valor / maximo : 0

        return (
          <View key={barra.etiqueta} style={estilos.filaBarra}>
            <Text style={estilos.etiquetaBarra}>{barra.etiqueta}</Text>
            <View style={estilos.canalBarra}>
              <View style={[estilos.barra, { flexGrow: proporcion, flexBasis: 0 }]} />
              <View style={{ flexGrow: 1 - proporcion, flexBasis: 0 }} />
            </View>
            <Text style={estilos.valorBarra}>{barra.valorFormateado}</Text>
          </View>
        )
      })}
    </View>
  )
}
