import { read, utils, write, type CellObject, type WorkBook, type WorkSheet } from 'xlsx'
import {
  MAXIMO_FILAS_IMPORTACION,
  type FilaPlanillaRequest,
  type ValorCelda,
} from '@/features/requerimientos/schemas/importacionRequest.schema'
import { LONGITUD_MAXIMA_IDENTIFICADOR } from '@/features/requerimientos/schemas/primitivos.schema'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import { ETIQUETAS_CAMPO } from '@/features/requerimientos/utils/trazabilidad'

type CampoPlanilla = Exclude<keyof FilaPlanillaRequest, 'fila'>

type CampoDato = Exclude<CampoPlanilla, 'identificador'>

type DatosFila = Record<CampoDato, ValorCelda>

interface ColumnaPlanilla {
  campo: CampoPlanilla
  encabezado: string
  ancho: number
}

export type ResultadoLecturaPlanilla =
  | {
      valida: true
      filas: FilaPlanillaRequest[]
      avisos: string[]
    }
  | {
      valida: false
      error: string
    }

const NOMBRE_HOJA = 'Requerimientos'
const ENCABEZADO_IDENTIFICADOR = '# Item'
const FORMATO_FECHA = 'dd-mm-yyyy'
const MS_POR_DIA = 86_400_000
const EPOCA_EXCEL = Date.UTC(1899, 11, 30)
const FIRMA_ZIP = [0x50, 0x4b, 0x03, 0x04]
const MAXIMO_ELEMENTOS_LISTADOS = 10
const PATRON_ENTERO_CANONICO = /^(0|[1-9]\d{0,14})$/

const COLUMNAS_PLANILLA: readonly ColumnaPlanilla[] = [
  { campo: 'identificador', encabezado: ENCABEZADO_IDENTIFICADOR, ancho: 8 },
  { campo: 'materiales', encabezado: ETIQUETAS_CAMPO.materiales, ancho: 40 },
  { campo: 'descripcion', encabezado: ETIQUETAS_CAMPO.descripcion, ancho: 40 },
  { campo: 'cantidad', encabezado: ETIQUETAS_CAMPO.cantidad, ancho: 10 },
  { campo: 'estado', encabezado: ETIQUETAS_CAMPO.estado, ancho: 16 },
  { campo: 'modalidad', encabezado: ETIQUETAS_CAMPO.modalidad, ancho: 24 },
  { campo: 'ordenDeCompra', encabezado: ETIQUETAS_CAMPO.ordenDeCompra, ancho: 16 },
  { campo: 'fechaMaximaLlegada', encabezado: ETIQUETAS_CAMPO.fechaMaximaLlegada, ancho: 14 },
  { campo: 'fechaLlegada', encabezado: ETIQUETAS_CAMPO.fechaLlegada, ancho: 14 },
  { campo: 'observaciones', encabezado: ETIQUETAS_CAMPO.observaciones, ancho: 40 },
  { campo: 'carpeta', encabezado: ETIQUETAS_CAMPO.carpeta, ancho: 40 },
]

const CAMPOS_OBLIGATORIOS: readonly CampoPlanilla[] = [
  'identificador',
  'materiales',
  'cantidad',
  'estado',
]

const CAMPOS_FECHA: ReadonlySet<CampoPlanilla> = new Set(['fechaMaximaLlegada', 'fechaLlegada'])

function normalizarEncabezado(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const CAMPO_POR_ENCABEZADO = new Map<string, CampoPlanilla>(
  COLUMNAS_PLANILLA.map((columna) => [normalizarEncabezado(columna.encabezado), columna.campo]),
)

const ENCABEZADO_POR_CAMPO = new Map<CampoPlanilla, string>(
  COLUMNAS_PLANILLA.map((columna) => [columna.campo, columna.encabezado]),
)

function invalida(error: string): ResultadoLecturaPlanilla {
  return { valida: false, error }
}

function esLibroXlsx(contenido: ArrayBuffer): boolean {
  if (contenido.byteLength < FIRMA_ZIP.length) {
    return false
  }

  const inicio = new Uint8Array(contenido, 0, FIRMA_ZIP.length)
  return FIRMA_ZIP.every((byte, indice) => inicio[indice] === byte)
}

function fechaCivilDesdeFecha(fecha: Date): string {
  const anio = String(fecha.getUTCFullYear()).padStart(4, '0')
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getUTCDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function serialDesdeFechaCivil(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return (Date.UTC(anio, mes - 1, dia) - EPOCA_EXCEL) / MS_POR_DIA
}

function valorCelda(celda: CellObject | undefined): ValorCelda {
  if (celda === undefined) {
    return null
  }

  switch (celda.t) {
    case 'n':
      return typeof celda.v === 'number' && Number.isFinite(celda.v) ? celda.v : null
    case 'd':
      return celda.v instanceof Date ? fechaCivilDesdeFecha(celda.v) : null
    case 's': {
      const texto = String(celda.v ?? '').trim()
      return texto === '' ? null : texto
    }
    case 'b':
    case 'e':
      return utils.format_cell(celda)
    case 'z':
      return null
  }
}

function valorCarpeta(celda: CellObject): ValorCelda {
  const destino = celda.l?.Target.trim() ?? ''
  return destino === '' ? valorCelda(celda) : destino
}

function identificadorDeCelda(celda: CellObject | undefined): string | null {
  if (celda === undefined || celda.t === 'e') {
    return null
  }

  const valor = valorCelda(celda)
  return valor === null ? null : String(valor)
}

function valorIdentificador(identificador: string): string | number {
  return PATRON_ENTERO_CANONICO.test(identificador) ? Number(identificador) : identificador
}

function datosVacios(): DatosFila {
  return {
    materiales: null,
    descripcion: null,
    cantidad: null,
    estado: null,
    modalidad: null,
    ordenDeCompra: null,
    fechaMaximaLlegada: null,
    fechaLlegada: null,
    observaciones: null,
    carpeta: null,
  }
}

function enumerar(elementos: readonly string[]): string {
  if (elementos.length > MAXIMO_ELEMENTOS_LISTADOS) {
    const restantes = elementos.length - MAXIMO_ELEMENTOS_LISTADOS
    return `${elementos.slice(0, MAXIMO_ELEMENTOS_LISTADOS).join(', ')} y ${restantes} más`
  }

  if (elementos.length <= 1) {
    return elementos.join('')
  }

  return `${elementos.slice(0, -1).join(', ')} y ${elementos[elementos.length - 1]}`
}

function enumerarFilas(filas: readonly number[]): string {
  const sustantivo = filas.length === 1 ? 'la fila' : 'las filas'
  return `${sustantivo} ${enumerar(filas.map(String))}`
}

function agruparCeldasPorFila(hoja: WorkSheet): Map<number, Map<number, CellObject>> {
  const celdasPorFila = new Map<number, Map<number, CellObject>>()

  for (const direccion of Object.keys(hoja)) {
    if (direccion.startsWith('!')) {
      continue
    }

    const { r, c } = utils.decode_cell(direccion)
    const celda: CellObject = hoja[direccion]
    const celdasFila = celdasPorFila.get(r) ?? new Map<number, CellObject>()
    celdasFila.set(c, celda)
    celdasPorFila.set(r, celdasFila)
  }

  return celdasPorFila
}

function listarEncabezados(campos: readonly CampoPlanilla[]): string {
  return campos.map((campo) => `«${ENCABEZADO_POR_CAMPO.get(campo)}»`).join(', ')
}

function describirRepetidos(filasPorIdentificador: ReadonlyMap<string, number[]>): string | null {
  const descripciones = [...filasPorIdentificador]
    .filter(([, filas]) => filas.length > 1)
    .map(([identificador, filas]) => `«${identificador}» está en ${enumerarFilas(filas)}`)

  if (descripciones.length === 0) {
    return null
  }

  const visibles = descripciones.slice(0, MAXIMO_ELEMENTOS_LISTADOS).join('; ')
  const restantes = descripciones.length - MAXIMO_ELEMENTOS_LISTADOS
  const resto = restantes > 0 ? `; y ${restantes} valores repetidos más` : ''

  return `Los valores de «${ENCABEZADO_IDENTIFICADOR}» no pueden repetirse: ${visibles}${resto}.`
}

export function leerPlanilla(contenido: ArrayBuffer): ResultadoLecturaPlanilla {
  if (!esLibroXlsx(contenido)) {
    return invalida(
      'El archivo no es un libro de Excel (.xlsx) válido o está protegido con contraseña.',
    )
  }

  let libro: WorkBook

  try {
    libro = read(contenido, { type: 'array', cellDates: true })
  } catch {
    return invalida('No fue posible leer el archivo. Es posible que esté dañado.')
  }

  if (libro.SheetNames.length === 0) {
    return invalida('El libro no contiene hojas.')
  }

  const nombreHoja = libro.SheetNames[0]
  const celdasPorFila = agruparCeldasPorFila(libro.Sheets[nombreHoja])
  const encabezados = celdasPorFila.get(0) ?? new Map<number, CellObject>()
  const campoPorColumna = new Map<number, CampoPlanilla>()
  const camposEncontrados = new Set<CampoPlanilla>()
  const columnasConEncabezado = new Set<number>()
  const encabezadosIgnorados: string[] = []

  for (const [columna, celda] of [...encabezados].sort(([a], [b]) => a - b)) {
    const valor = valorCelda(celda)

    if (valor === null) {
      continue
    }

    const texto = String(valor).trim()
    const campo = CAMPO_POR_ENCABEZADO.get(normalizarEncabezado(texto))
    columnasConEncabezado.add(columna)

    if (campo === undefined) {
      encabezadosIgnorados.push(texto)
      continue
    }

    if (camposEncontrados.has(campo)) {
      return invalida(`La columna «${texto}» está repetida en la fila de encabezados.`)
    }

    camposEncontrados.add(campo)
    campoPorColumna.set(columna, campo)
  }

  const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !camposEncontrados.has(campo))

  if (faltantes.length > 0) {
    return invalida(
      `La primera fila de la hoja «${nombreHoja}» debe contener los encabezados obligatorios. Faltan: ${listarEncabezados(faltantes)}.`,
    )
  }

  const filas: FilaPlanillaRequest[] = []
  const filasPorIdentificador = new Map<string, number[]>()
  const filasSinIdentificador: number[] = []
  const filasConIdentificadorExtenso: number[] = []
  const filasSoloConIdentificador: number[] = []
  const columnasSinEncabezado = new Set<number>()
  const celdasConError: string[] = []
  const indicesFila = [...celdasPorFila.keys()].filter((r) => r > 0).sort((a, b) => a - b)

  for (const r of indicesFila) {
    const numeroFila = r + 1
    const datos = datosVacios()
    let celdaIdentificador: CellObject | undefined
    let tieneDatos = false

    for (const [columna, celda] of celdasPorFila.get(r) ?? []) {
      const campo = campoPorColumna.get(columna)

      if (campo === 'identificador') {
        celdaIdentificador = celda
        continue
      }

      const valor = campo === 'carpeta' ? valorCarpeta(celda) : valorCelda(celda)

      if (valor === null) {
        continue
      }

      if (campo === undefined) {
        if (!columnasConEncabezado.has(columna)) {
          columnasSinEncabezado.add(columna)
        }
        continue
      }

      if (celda.t === 'e') {
        celdasConError.push(`${utils.encode_cell({ r, c: columna })} (${valor})`)
      }

      datos[campo] = valor
      tieneDatos = true
    }

    const identificador = identificadorDeCelda(celdaIdentificador)

    if (!tieneDatos) {
      if (identificador !== null) {
        filasSoloConIdentificador.push(numeroFila)
      }
      continue
    }

    if (identificador === null) {
      filasSinIdentificador.push(numeroFila)
      continue
    }

    if (identificador.length > LONGITUD_MAXIMA_IDENTIFICADOR) {
      filasConIdentificadorExtenso.push(numeroFila)
      continue
    }

    filas.push({ fila: numeroFila, identificador, ...datos })
    filasPorIdentificador.set(identificador, [
      ...(filasPorIdentificador.get(identificador) ?? []),
      numeroFila,
    ])
  }

  const filasConDatos =
    filas.length + filasSinIdentificador.length + filasConIdentificadorExtenso.length

  if (filasConDatos === 0) {
    return invalida('La planilla no contiene filas con datos.')
  }

  if (filasConDatos > MAXIMO_FILAS_IMPORTACION) {
    return invalida(
      `La planilla contiene ${filasConDatos} filas con datos y el máximo permitido es ${MAXIMO_FILAS_IMPORTACION}.`,
    )
  }

  if (filasSinIdentificador.length > 0) {
    return invalida(
      `Falta el valor de «${ENCABEZADO_IDENTIFICADOR}» en ${enumerarFilas(filasSinIdentificador)}. Cada fila debe tener un valor que la identifique.`,
    )
  }

  if (filasConIdentificadorExtenso.length > 0) {
    return invalida(
      `El valor de «${ENCABEZADO_IDENTIFICADOR}» supera los ${LONGITUD_MAXIMA_IDENTIFICADOR} caracteres en ${enumerarFilas(filasConIdentificadorExtenso)}.`,
    )
  }

  const repetidos = describirRepetidos(filasPorIdentificador)

  if (repetidos !== null) {
    return invalida(repetidos)
  }

  const avisos: string[] = []

  if (libro.SheetNames.length > 1) {
    avisos.push(
      `El libro contiene ${libro.SheetNames.length} hojas. Solo se leyó la primera, «${nombreHoja}».`,
    )
  }

  if (encabezadosIgnorados.length > 0) {
    avisos.push(
      `Se ignoraron las columnas que no forman parte de la planilla: ${encabezadosIgnorados.map((texto) => `«${texto}»`).join(', ')}.`,
    )
  }

  if (columnasSinEncabezado.size > 0) {
    const letras = [...columnasSinEncabezado].sort((a, b) => a - b).map(utils.encode_col)
    avisos.push(`Se ignoraron datos en columnas sin encabezado: ${letras.join(', ')}.`)
  }

  if (filasSoloConIdentificador.length > 0) {
    const verbo = filasSoloConIdentificador.length === 1 ? 'Se ignoró' : 'Se ignoraron'
    const complemento = filasSoloConIdentificador.length === 1 ? 'solo tiene' : 'solo tienen'
    avisos.push(
      `${verbo} ${enumerarFilas(filasSoloConIdentificador)} porque ${complemento} valor en «${ENCABEZADO_IDENTIFICADOR}».`,
    )
  }

  if (celdasConError.length > 0) {
    avisos.push(`Las siguientes celdas contienen errores de fórmula: ${celdasConError.join(', ')}.`)
  }

  return { valida: true, filas, avisos }
}

function valorPlanilla(requerimiento: Requerimiento, campo: CampoPlanilla): string | number | null {
  switch (campo) {
    case 'identificador':
      return valorIdentificador(requerimiento.identificador)
    case 'estado':
      return requerimiento.estado.label
    case 'modalidad':
      return requerimiento.modalidad?.label ?? null
    case 'fechaMaximaLlegada':
    case 'fechaLlegada': {
      const fecha = requerimiento[campo]
      return fecha === null ? null : serialDesdeFechaCivil(fecha)
    }
    case 'materiales':
    case 'descripcion':
    case 'cantidad':
    case 'ordenDeCompra':
    case 'observaciones':
    case 'carpeta':
      return requerimiento[campo]
  }
}

export function generarPlanilla(requerimientos: readonly Requerimiento[]): ArrayBuffer {
  const hoja = utils.aoa_to_sheet([
    COLUMNAS_PLANILLA.map((columna) => columna.encabezado),
    ...requerimientos.map((requerimiento) =>
      COLUMNAS_PLANILLA.map((columna) => valorPlanilla(requerimiento, columna.campo)),
    ),
  ])

  COLUMNAS_PLANILLA.forEach((columna, c) => {
    if (!CAMPOS_FECHA.has(columna.campo)) {
      return
    }

    requerimientos.forEach((_, indice) => {
      const celda: CellObject | undefined = hoja[utils.encode_cell({ r: indice + 1, c })]

      if (celda !== undefined) {
        celda.z = FORMATO_FECHA
      }
    })
  })

  hoja['!cols'] = COLUMNAS_PLANILLA.map((columna) => ({ wch: columna.ancho }))

  const libro = utils.book_new()
  utils.book_append_sheet(libro, hoja, NOMBRE_HOJA)

  return write(libro, { bookType: 'xlsx', type: 'array', compression: true })
}
