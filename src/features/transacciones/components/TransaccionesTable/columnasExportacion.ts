import type { TransaccionListado } from '@/features/transacciones/types/transaccion.types'
import { etiquetaCriticidad } from '@/features/transacciones/components/IndicadorCriticidad/IndicadorCriticidad.utils'

export type TipoColumnaExportacion = 'texto' | 'entero' | 'decimal' | 'fecha' | 'enlace'

export type ValorExportacion = string | number | null

export interface ColumnaExportacion {
  encabezado: string
  tipo: TipoColumnaExportacion
  ancho: number
  valor: (transaccion: TransaccionListado) => ValorExportacion
}

function unirEtiquetas(etiquetas: readonly string[]): string | null {
  return etiquetas.length === 0 ? null : etiquetas.join(', ')
}

function etiquetasDeTipos(transaccion: TransaccionListado): string[] {
  return Array.from(new Map(transaccion.tipos.map((tipo) => [tipo.value, tipo.label])).values())
}

export const COLUMNAS_EXPORTACION: readonly ColumnaExportacion[] = [
  {
    encabezado: 'Número',
    tipo: 'entero',
    ancho: 10,
    valor: (transaccion) => transaccion.id,
  },
  {
    encabezado: 'Nombre',
    tipo: 'texto',
    ancho: 48,
    valor: (transaccion) => transaccion.nombre,
  },
  {
    encabezado: 'Carpeta de antecedentes',
    tipo: 'enlace',
    ancho: 40,
    valor: (transaccion) => transaccion.linkCarpetaAntecedentes,
  },
  {
    encabezado: 'Estado',
    tipo: 'texto',
    ancho: 18,
    valor: (transaccion) => transaccion.estado?.label ?? null,
  },
  {
    encabezado: 'Índice de criticidad',
    tipo: 'decimal',
    ancho: 20,
    valor: (transaccion) => transaccion.criticidad?.indice ?? null,
  },
  {
    encabezado: 'Nivel de criticidad',
    tipo: 'texto',
    ancho: 19,
    valor: (transaccion) =>
      transaccion.criticidad === null
        ? 'Sin evaluar'
        : etiquetaCriticidad(transaccion.criticidad.nivel),
  },
  {
    encabezado: 'Analista principal',
    tipo: 'texto',
    ancho: 28,
    valor: (transaccion) => transaccion.analistas.principal?.nombre ?? 'Sin principal',
  },
  {
    encabezado: 'Analistas de apoyo',
    tipo: 'texto',
    ancho: 40,
    valor: (transaccion) =>
      unirEtiquetas(transaccion.analistas.apoyo.map((analista) => analista.nombre)),
  },
  {
    encabezado: 'Modalidad',
    tipo: 'texto',
    ancho: 24,
    valor: (transaccion) => transaccion.modalidad.label,
  },
  {
    encabezado: 'Tipo',
    tipo: 'texto',
    ancho: 20,
    valor: (transaccion) => unirEtiquetas(etiquetasDeTipos(transaccion)),
  },
  {
    encabezado: 'Unidades',
    tipo: 'entero',
    ancho: 10,
    valor: (transaccion) => transaccion.solicitudes.unidades,
  },
  {
    encabezado: 'Carreras',
    tipo: 'entero',
    ancho: 10,
    valor: (transaccion) => transaccion.solicitudes.carreras,
  },
  {
    encabezado: 'Fecha',
    tipo: 'fecha',
    ancho: 14,
    valor: (transaccion) => transaccion.fecha,
  },
]
