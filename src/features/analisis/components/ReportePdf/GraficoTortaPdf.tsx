import { Circle, Path, Svg, Text, View } from '@react-pdf/renderer'
import { estilos } from './estilos'
import { tintasSecuenciales } from './paleta'

export interface SectorPdf {
  etiqueta: string
  valor: number
  valorFormateado: string
  porcentajeFormateado: string
}

interface GraficoTortaPdfProps {
  sectores: SectorPdf[]
}

const DIAMETRO = 132
const RADIO = DIAMETRO / 2

function trazoSector(inicio: number, fin: number): string {
  const x1 = RADIO + RADIO * Math.cos(inicio)
  const y1 = RADIO + RADIO * Math.sin(inicio)
  const x2 = RADIO + RADIO * Math.cos(fin)
  const y2 = RADIO + RADIO * Math.sin(fin)
  const arcoGrande = fin - inicio > Math.PI ? 1 : 0

  return `M ${RADIO} ${RADIO} L ${x1} ${y1} A ${RADIO} ${RADIO} 0 ${arcoGrande} 1 ${x2} ${y2} Z`
}

export function GraficoTortaPdf({ sectores }: GraficoTortaPdfProps) {
  if (sectores.length === 0) {
    return <Text style={estilos.vacioGrafico}>Sin registros en el periodo</Text>
  }

  const total = sectores.reduce((acumulado, sector) => acumulado + sector.valor, 0)
  const tintas = tintasSecuenciales(sectores.length)

  const fracciones = sectores.map((sector) => (total > 0 ? sector.valor / total : 0))

  const trazos = sectores.map((sector, indice) => {
    const acumulado = fracciones.slice(0, indice).reduce((suma, valor) => suma + valor, 0)
    const inicio = -Math.PI / 2 + acumulado * Math.PI * 2
    const fin = inicio + fracciones[indice] * Math.PI * 2

    return {
      clave: sector.etiqueta,
      tinta: tintas[indice],
      fraccion: fracciones[indice],
      inicio,
      fin,
    }
  })

  const completo = trazos.find((trazo) => trazo.fraccion >= 0.9999)

  return (
    <View style={[estilos.grafico, estilos.filaTorta]} wrap={false}>
      <Svg width={DIAMETRO} height={DIAMETRO}>
        {completo ? (
          <Circle cx={RADIO} cy={RADIO} r={RADIO} fill={completo.tinta} />
        ) : (
          trazos.map((trazo) => (
            <Path key={trazo.clave} d={trazoSector(trazo.inicio, trazo.fin)} fill={trazo.tinta} />
          ))
        )}
      </Svg>

      <View style={estilos.listaTorta}>
        {sectores.map((sector, indice) => (
          <View key={sector.etiqueta} style={estilos.filaListaTorta}>
            <View style={[estilos.muestraTorta, { backgroundColor: tintas[indice] }]} />
            <Text style={estilos.etiquetaListaTorta}>{sector.etiqueta}</Text>
            <Text style={estilos.montoListaTorta}>{sector.valorFormateado}</Text>
            <Text style={estilos.porcentajeListaTorta}>{sector.porcentajeFormateado}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
