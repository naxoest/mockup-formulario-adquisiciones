import { describe, expect, it } from 'vitest'
import { read, utils, write, type CellObject, type WorkSheet } from 'xlsx'
import {
  MAXIMO_FILAS_IMPORTACION,
  type ValorCelda,
} from '@/features/requerimientos/schemas/importacionRequest.schema'
import type {
  Requerimiento,
  SolicitanteRequerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import { generarPlanilla, leerPlanilla } from '@/features/requerimientos/utils/planilla'

const ENCABEZADOS_ORIGINALES = [
  '# Item',
  'Materiales',
  'Cantidad',
  'Estado',
  'Mecanismo de compra',
  'Orden de Compra',
  'Fecha máxima de llegada',
  'Fecha de llegada',
  'Observaciones',
  'Carpeta',
]

const ENCABEZADOS_PLANILLA = [
  '# Item',
  'Materiales',
  'Descripción',
  'Cantidad',
  'Estado',
  'Mecanismo de compra',
  'Orden de compra',
  'Fecha máxima de llegada',
  'Fecha de llegada',
  'Observaciones',
  'Carpeta',
]

const ENCABEZADOS_MINIMOS = ['# Item', 'Materiales', 'Cantidad', 'Estado']

const solicitante: SolicitanteRequerimiento = {
  id: 1,
  cr: 101,
  nombre: 'Ingeniería Civil',
  sedes: [{ value: 'osorno', label: 'Osorno' }],
  tipo: 'carrera',
}

const requerimientos: Requerimiento[] = [
  {
    id: 7,
    identificador: '1',
    solicitante,
    materiales: 'Guantes de nitrilo',
    descripcion: 'Talla M',
    cantidad: 30,
    estado: { value: 'entregado', label: 'Entregado' },
    modalidad: { value: 'agil', label: 'Compra Ágil' },
    ordenDeCompra: '5413',
    fechaMaximaLlegada: '2026-10-05',
    fechaLlegada: '2026-09-30',
    observaciones: null,
    carpeta: 'https://drive.example.com/carpeta',
    actualizadoEn: '2026-09-29T21:05:47',
    eliminado: false,
  },
  {
    id: 8,
    identificador: '007',
    solicitante,
    materiales: 'Mascarillas',
    descripcion: null,
    cantidad: 2,
    estado: { value: 'comprado', label: 'Comprado' },
    modalidad: null,
    ordenDeCompra: null,
    fechaMaximaLlegada: null,
    fechaLlegada: null,
    observaciones: 'Sin observaciones del proveedor',
    carpeta: null,
    actualizadoEn: '2026-09-29T21:05:47',
    eliminado: false,
  },
]

function crearHoja(filas: ValorCelda[][], fechas: string[] = []): WorkSheet {
  const hoja = utils.aoa_to_sheet(filas)

  for (const direccion of fechas) {
    const celda: CellObject = hoja[direccion]
    celda.z = 'dd-mm-yyyy'
  }

  return hoja
}

function crearLibro(hojas: Record<string, WorkSheet>, fecha1904 = false): ArrayBuffer {
  const libro = utils.book_new()

  for (const [nombre, hoja] of Object.entries(hojas)) {
    utils.book_append_sheet(libro, hoja, nombre)
  }

  if (fecha1904) {
    libro.Workbook = { WBProps: { date1904: true } }
  }

  return write(libro, { bookType: 'xlsx', type: 'array' })
}

function bytes(valores: number[]): ArrayBuffer {
  return new Uint8Array(valores).buffer
}

describe('leerPlanilla', () => {
  it('lee las columnas por encabezado y conserva el ítem de cada fila', () => {
    const contenido = crearLibro({
      'Hoja 1': crearHoja(
        [
          ENCABEZADOS_ORIGINALES,
          [1, 'Guantes de nitrilo', 30, 'Entregado a carrera', 'AG', 5413, 46300],
          ['A-2', 'Mascarillas', 15, 'Comprado', 'AG', 'G32', null, null, 'Urgente'],
        ],
        ['G2'],
      ),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: true,
      filas: [
        {
          fila: 2,
          identificador: '1',
          materiales: 'Guantes de nitrilo',
          descripcion: null,
          cantidad: 30,
          estado: 'Entregado a carrera',
          modalidad: 'AG',
          ordenDeCompra: 5413,
          fechaMaximaLlegada: '2026-10-05',
          fechaLlegada: null,
          observaciones: null,
          carpeta: null,
        },
        {
          fila: 3,
          identificador: 'A-2',
          materiales: 'Mascarillas',
          descripcion: null,
          cantidad: 15,
          estado: 'Comprado',
          modalidad: 'AG',
          ordenDeCompra: 'G32',
          fechaMaximaLlegada: null,
          fechaLlegada: null,
          observaciones: 'Urgente',
          carpeta: null,
        },
      ],
      avisos: [],
    })
  })

  it('reconoce los encabezados sin distinguir mayúsculas, tildes ni espacios extra', () => {
    const contenido = crearLibro({
      Datos: crearHoja([
        ['# ITEM', 'MATERIALES', '  cantidad ', 'Estado', 'Mecanismo de Compra', 'Descripcion'],
        [12, 'Guantes', 3, 'Comprado', 'Compra Ágil', 'Talla M'],
      ]),
    })

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [
        {
          fila: 2,
          identificador: '12',
          materiales: 'Guantes',
          cantidad: 3,
          estado: 'Comprado',
          modalidad: 'Compra Ágil',
          descripcion: 'Talla M',
        },
      ],
      avisos: [],
    })
  })

  it('convierte a fecha civil solo los números con formato de fecha', () => {
    const contenido = crearLibro({
      Datos: crearHoja(
        [
          [...ENCABEZADOS_MINIMOS, 'Fecha máxima de llegada', 'Fecha de llegada'],
          [1, 'Guantes', 3, 'Comprado', 46300, 46295],
        ],
        ['E2'],
      ),
    })

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [{ fechaMaximaLlegada: '2026-10-05', fechaLlegada: 46295 }],
    })
  })

  it('respeta el sistema de fechas 1904 del libro', () => {
    const contenido = crearLibro(
      {
        Datos: crearHoja(
          [
            [...ENCABEZADOS_MINIMOS, 'Fecha máxima de llegada', 'Fecha de llegada'],
            [1, 'Guantes', 3, 'Comprado', 44838, 44833],
          ],
          ['E2', 'F2'],
        ),
      },
      true,
    )

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [{ fechaMaximaLlegada: '2026-10-05', fechaLlegada: '2026-09-30' }],
    })
  })

  it('omite las filas sin datos y conserva el número de fila del archivo', () => {
    const contenido = crearLibro({
      Datos: crearHoja([
        [...ENCABEZADOS_MINIMOS, 'Observaciones'],
        [1, '  Guantes  ', 3, 'Comprado', '   '],
        [],
        [null, null, null, null, null, 'Resumen'],
        [4, 'Mascarillas', 5, 'Comprado'],
      ]),
    })

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [
        { fila: 2, identificador: '1', materiales: 'Guantes', observaciones: null },
        { fila: 5, identificador: '4', materiales: 'Mascarillas' },
      ],
      avisos: ['Se ignoraron datos en columnas sin encabezado: F.'],
    })
  })

  it('usa el destino del hipervínculo en la columna Carpeta', () => {
    const hoja = crearHoja([
      [...ENCABEZADOS_MINIMOS, 'Carpeta'],
      [1, 'Guantes', 3, 'Comprado', 'Carpeta del proyecto'],
      [2, 'Mascarillas', 1, 'Comprado', 'https://example.com/carpeta'],
    ])
    const celda: CellObject = hoja.E2
    celda.l = { Target: 'https://drive.google.com/drive/folders/abc' }

    expect(leerPlanilla(crearLibro({ Datos: hoja }))).toMatchObject({
      valida: true,
      filas: [
        { fila: 2, carpeta: 'https://drive.google.com/drive/folders/abc' },
        { fila: 3, carpeta: 'https://example.com/carpeta' },
      ],
    })
  })

  it('envía el texto de las celdas con error de fórmula y lo informa como aviso', () => {
    const hoja = crearHoja([ENCABEZADOS_MINIMOS, [1, 'Guantes', 3, 'Comprado']])
    hoja.C2 = { t: 'e', v: 0x2a }

    expect(leerPlanilla(crearLibro({ Datos: hoja }))).toMatchObject({
      valida: true,
      filas: [{ fila: 2, cantidad: '#N/A' }],
      avisos: ['Las siguientes celdas contienen errores de fórmula: C2 (#N/A).'],
    })
  })

  it('lee solo la primera hoja e informa las demás', () => {
    const contenido = crearLibro({
      Datos: crearHoja([ENCABEZADOS_MINIMOS, [1, 'Guantes', 3, 'Comprado']]),
      Resumen: crearHoja([['Total'], [3]]),
    })

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [{ fila: 2, materiales: 'Guantes' }],
      avisos: ['El libro contiene 2 hojas. Solo se leyó la primera, «Datos».'],
    })
  })

  it('ignora las filas que solo tienen ítem e informa cuáles son', () => {
    const contenido = crearLibro({
      Datos: crearHoja([ENCABEZADOS_MINIMOS, [1, 'Guantes', 3, 'Comprado'], [2], [3]]),
    })

    expect(leerPlanilla(contenido)).toMatchObject({
      valida: true,
      filas: [{ fila: 2, identificador: '1' }],
      avisos: ['Se ignoraron las filas 3 y 4 porque solo tienen valor en «# Item».'],
    })
  })

  it('rechaza la planilla si alguna fila con datos no tiene ítem', () => {
    const contenido = crearLibro({
      Datos: crearHoja([
        ENCABEZADOS_MINIMOS,
        [1, 'Guantes', 3, 'Comprado'],
        [null, 'Mascarillas', 5, 'Comprado'],
        ['   ', 'Batas', 2, 'Comprado'],
      ]),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error:
        'Falta el valor de «# Item» en las filas 3 y 4. Cada fila debe tener un valor que la identifique.',
    })
  })

  it('considera faltante un ítem con error de fórmula', () => {
    const hoja = crearHoja([ENCABEZADOS_MINIMOS, [1, 'Guantes', 3, 'Comprado']])
    hoja.A2 = { t: 'e', v: 0x2a }

    expect(leerPlanilla(crearLibro({ Datos: hoja }))).toEqual({
      valida: false,
      error:
        'Falta el valor de «# Item» en la fila 2. Cada fila debe tener un valor que la identifique.',
    })
  })

  it('abrevia la lista de filas cuando son muchas', () => {
    const filas = Array.from({ length: 12 }, (_, indice) => [
      null,
      `Material ${indice}`,
      1,
      'Comprado',
    ])
    const contenido = crearLibro({ Datos: crearHoja([ENCABEZADOS_MINIMOS, ...filas]) })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error:
        'Falta el valor de «# Item» en las filas 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 y 2 más. Cada fila debe tener un valor que la identifique.',
    })
  })

  it('rechaza los ítems repetidos e indica en qué filas están', () => {
    const contenido = crearLibro({
      Datos: crearHoja([
        ENCABEZADOS_MINIMOS,
        [5, 'Guantes', 1, 'Comprado'],
        ['5', 'Mascarillas', 1, 'Comprado'],
        [7, 'Batas', 1, 'Comprado'],
        [7, 'Cofias', 1, 'Comprado'],
      ]),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error:
        'Los valores de «# Item» no pueden repetirse: «5» está en las filas 2 y 3; «7» está en las filas 4 y 5.',
    })
  })

  it('rechaza un ítem que supera la longitud máxima', () => {
    const contenido = crearLibro({
      Datos: crearHoja([ENCABEZADOS_MINIMOS, ['x'.repeat(51), 'Guantes', 1, 'Comprado']]),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error: 'El valor de «# Item» supera los 50 caracteres en la fila 2.',
    })
  })

  it('rechaza un contenido que no es un libro .xlsx', () => {
    const error =
      'El archivo no es un libro de Excel (.xlsx) válido o está protegido con contraseña.'

    expect(leerPlanilla(bytes([0x61, 0x2c, 0x62, 0x0a]))).toEqual({ valida: false, error })
    expect(leerPlanilla(new ArrayBuffer(0))).toEqual({ valida: false, error })
  })

  it('rechaza un archivo dañado con firma de ZIP', () => {
    expect(leerPlanilla(bytes([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0, 0, 0]))).toMatchObject({
      valida: false,
    })
  })

  it('rechaza la planilla si faltan encabezados obligatorios', () => {
    const contenido = crearLibro({
      'Hoja 1': crearHoja([
        ['Materiales', 'Observaciones'],
        ['Guantes', 'Urgente'],
      ]),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error:
        'La primera fila de la hoja «Hoja 1» debe contener los encabezados obligatorios. Faltan: «# Item», «Cantidad», «Estado».',
    })
  })

  it('rechaza la planilla si un encabezado está repetido', () => {
    const contenido = crearLibro({
      Datos: crearHoja([
        [...ENCABEZADOS_MINIMOS, 'materiales'],
        [1, 'Guantes', 3, 'Comprado', 'Mascarillas'],
      ]),
    })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error: 'La columna «materiales» está repetida en la fila de encabezados.',
    })
  })

  it('rechaza la planilla sin filas con datos', () => {
    const contenido = crearLibro({ Datos: crearHoja([ENCABEZADOS_MINIMOS]) })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error: 'La planilla no contiene filas con datos.',
    })
  })

  it('rechaza la planilla que supera el máximo de filas', () => {
    const total = MAXIMO_FILAS_IMPORTACION + 1
    const filas = Array.from({ length: total }, (_, indice) => [
      indice + 1,
      `Material ${indice}`,
      1,
      'Comprado',
    ])
    const contenido = crearLibro({ Datos: crearHoja([ENCABEZADOS_MINIMOS, ...filas]) })

    expect(leerPlanilla(contenido)).toEqual({
      valida: false,
      error: `La planilla contiene ${total} filas con datos y el máximo permitido es ${MAXIMO_FILAS_IMPORTACION}.`,
    })
  })
})

describe('generarPlanilla', () => {
  it('genera la hoja con la columna del ítem y los encabezados de la planilla', () => {
    const libro = read(generarPlanilla(requerimientos), { type: 'array' })
    const filas = utils.sheet_to_json<ValorCelda[]>(libro.Sheets.Requerimientos, { header: 1 })

    expect(libro.SheetNames).toEqual(['Requerimientos'])
    expect(filas[0]).toEqual(ENCABEZADOS_PLANILLA)
  })

  it('escribe como número los ítems enteros y como texto los demás', () => {
    const libro = read(generarPlanilla(requerimientos), { type: 'array' })
    const hoja = libro.Sheets.Requerimientos

    expect(hoja.A2).toMatchObject({ t: 'n', v: 1 })
    expect(hoja.A3).toMatchObject({ t: 's', v: '007' })
  })

  it('escribe las fechas como fechas de Excel con formato día-mes-año', () => {
    const libro = read(generarPlanilla(requerimientos), { type: 'array', cellNF: true })
    const hoja = libro.Sheets.Requerimientos

    expect(hoja.H2).toMatchObject({ t: 'n', v: 46300, z: 'dd-mm-yyyy' })
    expect(hoja.I2).toMatchObject({ t: 'n', v: 46295, z: 'dd-mm-yyyy' })
  })

  it('genera solo los encabezados cuando no hay requerimientos', () => {
    const libro = read(generarPlanilla([]), { type: 'array' })
    const filas = utils.sheet_to_json<ValorCelda[]>(libro.Sheets.Requerimientos, { header: 1 })

    expect(filas).toEqual([ENCABEZADOS_PLANILLA])
  })

  it('produce una planilla que se vuelve a leer con los mismos valores', () => {
    expect(leerPlanilla(generarPlanilla(requerimientos))).toEqual({
      valida: true,
      filas: [
        {
          fila: 2,
          identificador: '1',
          materiales: 'Guantes de nitrilo',
          descripcion: 'Talla M',
          cantidad: 30,
          estado: 'Entregado',
          modalidad: 'Compra Ágil',
          ordenDeCompra: '5413',
          fechaMaximaLlegada: '2026-10-05',
          fechaLlegada: '2026-09-30',
          observaciones: null,
          carpeta: 'https://drive.example.com/carpeta',
        },
        {
          fila: 3,
          identificador: '007',
          materiales: 'Mascarillas',
          descripcion: null,
          cantidad: 2,
          estado: 'Comprado',
          modalidad: null,
          ordenDeCompra: null,
          fechaMaximaLlegada: null,
          fechaLlegada: null,
          observaciones: 'Sin observaciones del proveedor',
          carpeta: null,
        },
      ],
      avisos: [],
    })
  })
})
