import { Image, Text, View } from '@react-pdf/renderer'
import logoAcreditacion from '@/assets/acreditacionLogo.png'
import logoReporte from '@/assets/reportLogo.png'
import { estilos } from './estilos'

export function Cabecera() {
  return (
    <View style={estilos.cabecera} fixed>
      <Image src={logoReporte} style={estilos.logoReporte} />
      <Image src={logoAcreditacion} style={estilos.logoAcreditacion} />
    </View>
  )
}

interface PieProps {
  titulo: string
}

export function Pie({ titulo }: PieProps) {
  return (
    <View style={estilos.pie} fixed>
      <Text>{titulo} · Uso interno</Text>
      <Text
        fixed
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  )
}

interface IndicadorProps {
  etiqueta: string
  valor: string
  primero?: boolean
}

export function Indicador({ etiqueta, valor, primero }: IndicadorProps) {
  return (
    <View style={primero ? estilos.indicador : [estilos.indicador, estilos.indicadorConRegla]}>
      <Text style={estilos.etiquetaIndicador}>{etiqueta}</Text>
      <Text style={estilos.valorIndicador}>{valor}</Text>
    </View>
  )
}
