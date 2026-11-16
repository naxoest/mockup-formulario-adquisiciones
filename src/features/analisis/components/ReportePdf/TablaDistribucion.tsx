import { Text, View } from '@react-pdf/renderer'
import { estilos } from './estilos'

export interface ColumnaTabla<T> {
  titulo: string
  ancho: string
  derecha?: boolean
  celda: (fila: T, indice: number) => string
}

interface TablaDistribucionProps<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  total?: (string | null)[]
  encabezadoFijo?: boolean
}

function estiloCelda(derecha: boolean | undefined, ultima: boolean) {
  if (!derecha) return estilos.celda
  return ultima ? estilos.celdaDerecha : estilos.celdaDerechaIntermedia
}

export function TablaDistribucion<T>({
  columnas,
  filas,
  total,
  encabezadoFijo = false,
}: TablaDistribucionProps<T>) {
  const ultimaColumna = columnas.length - 1

  return (
    <View>
      <View style={estilos.filaEncabezado} fixed={encabezadoFijo}>
        {columnas.map((columna, posicion) => (
          <Text
            key={columna.titulo}
            style={[
              estilos.textoEncabezado,
              estiloCelda(columna.derecha, posicion === ultimaColumna),
              { width: columna.ancho },
            ]}
          >
            {columna.titulo}
          </Text>
        ))}
      </View>

      {filas.map((fila, indice) => (
        <View key={indice} style={estilos.fila} wrap={false}>
          {columnas.map((columna, posicion) => (
            <Text
              key={columna.titulo}
              style={[
                estiloCelda(columna.derecha, posicion === ultimaColumna),
                { width: columna.ancho },
              ]}
            >
              {columna.celda(fila, indice)}
            </Text>
          ))}
        </View>
      ))}

      {total ? (
        <View style={estilos.filaTotal} wrap={false}>
          {columnas.map((columna, posicion) => (
            <Text
              key={columna.titulo}
              style={[
                estiloCelda(columna.derecha, posicion === ultimaColumna),
                { width: columna.ancho },
              ]}
            >
              {total[posicion] ?? ''}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  )
}
