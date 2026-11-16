import { describe, expect, it } from 'vitest'
import type { FileUploadItem } from './FileUpload.types'
import {
  buildAcceptAttribute,
  fileUploadItemSchema,
  formatBytes,
  getCategoryExtensions,
  getFileCategory,
  getItemKey,
  planAddition,
  validateFile,
  validateFileName,
} from './FileUpload.utils'

function makeFile(name: string, size: number, type: string, lastModified = 1): File {
  return new File([new Uint8Array(size)], name, { type, lastModified })
}

function withSize(file: File, size: number): File {
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('formatBytes', () => {
  it('formatea con coma decimal y unidad adecuada', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(512)).toBe('512 Bytes')
    expect(formatBytes(1536)).toBe('1,5 KB')
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB')
  })
})

describe('getFileCategory', () => {
  it('exige que el tipo MIME y la extensión coincidan', () => {
    expect(getFileCategory({ name: 'orden.pdf', type: 'application/pdf' })).toBe('document')
    expect(getFileCategory({ name: 'foto.jpg', type: 'application/pdf' })).toBeNull()
  })

  it('resuelve por extensión cuando el tipo MIME no es confiable', () => {
    expect(getFileCategory({ name: 'foto.heic', type: '' })).toBe('image')
    expect(getFileCategory({ name: 'foto.heic', type: 'application/octet-stream' })).toBe('image')
  })

  it('rechaza nombres sin extensión', () => {
    expect(getFileCategory({ name: 'sin_extension', type: 'application/pdf' })).toBeNull()
    expect(getFileCategory({ name: '.pdf', type: 'application/pdf' })).toBeNull()
  })
})

describe('validateFileName', () => {
  it('acepta segmentos intermedios que coinciden con extensiones ejecutables', () => {
    expect(validateFileName('cotizacion.proveedor.com.pdf')).toBeNull()
  })

  it('rechaza nombres inseguros', () => {
    expect(validateFileName('a:b.pdf')).toBe(
      'el nombre del archivo contiene caracteres no permitidos',
    )
    expect(validateFileName('a/b.pdf')).toBe(
      'el nombre del archivo no puede contener separadores de ruta',
    )
    expect(validateFileName('CON.pdf')).toBe(
      'el nombre del archivo es un nombre reservado del sistema',
    )
    expect(validateFileName('informe.')).toBe(
      'el nombre del archivo no puede terminar en punto o espacio',
    )
    expect(validateFileName('a\u0007b.pdf')).toBe(
      'el nombre del archivo contiene caracteres de control no permitidos',
    )
    expect(validateFileName('factura\u202Etxt.pdf')).toBe(
      'el nombre del archivo contiene caracteres invisibles no permitidos',
    )
    expect(validateFileName(`${'a'.repeat(197)}.pdf`)).toBe(
      'el nombre del archivo excede 200 caracteres',
    )
  })
})

describe('validateFile', () => {
  it('acepta un archivo válido de una categoría permitida', () => {
    expect(validateFile(makeFile('orden.pdf', 10, 'application/pdf'), ['document'])).toBeNull()
  })

  it('evalúa la extensión final del nombre', () => {
    expect(
      validateFile(makeFile('reporte.exe.pdf', 10, 'application/pdf'), ['document']),
    ).toBeNull()
    expect(
      validateFile(makeFile('reporte.pdf.exe', 10, 'application/x-msdownload'), ['document']),
    ).toBe('tipo de archivo no reconocido o inconsistente con su extensión')
  })

  it('rechaza archivos vacíos, categorías no permitidas y tamaños excedidos', () => {
    expect(validateFile(makeFile('vacio.pdf', 0, 'application/pdf'), ['document'])).toBe(
      'el archivo está vacío (0 bytes)',
    )
    expect(validateFile(makeFile('foto.png', 10, 'image/png'), ['document'])).toBe(
      'tipo de archivo no permitido en este formulario',
    )
    const grande = withSize(makeFile('grande.pdf', 1, 'application/pdf'), 26 * 1024 * 1024)
    expect(validateFile(grande, ['document'])).toBe('excede el límite de 25 MB para documentos')
  })
})

describe('buildAcceptAttribute', () => {
  it('incluye solo las extensiones y tipos de las categorías indicadas', () => {
    const accept = buildAcceptAttribute(['document']).split(',')
    expect(accept).toContain('.pdf')
    expect(accept).toContain('application/pdf')
    expect(accept).not.toContain('.png')
  })
})

describe('planAddition', () => {
  const a = makeFile('a.pdf', 100, 'application/pdf', 1)
  const b = makeFile('b.pdf', 100, 'application/pdf', 2)
  const c = makeFile('c.pdf', 100, 'application/pdf', 3)

  it('descarta duplicados y el excedente de cantidad', () => {
    const plan = planAddition([], [a, a, b, c], { maxFiles: 2, maxTotalSize: 10_000 })
    expect(plan.accepted).toEqual([a, b])
    expect(plan.rejections).toEqual([
      { name: 'a.pdf', message: 'Archivo duplicado' },
      { name: 'c.pdf', message: 'Máximo 2 archivo(s)' },
    ])
  })

  it('considera los documentos guardados en la capacidad y el tamaño total', () => {
    const guardado: FileUploadItem = {
      kind: 'stored',
      id: '7',
      name: 'orden.pdf',
      size: 2000,
      type: 'application/pdf',
    }
    const plan = planAddition([guardado], [a], { maxFiles: 5, maxTotalSize: 2048 })
    expect(plan.accepted).toEqual([])
    expect(plan.rejections).toEqual([{ name: 'a.pdf', message: 'Excede el total de 2 KB' }])
  })
})

describe('getItemKey', () => {
  it('distingue documentos guardados de archivos pendientes', () => {
    expect(
      getItemKey({ kind: 'stored', id: '7', name: 'orden.pdf', size: 1, type: 'application/pdf' }),
    ).toBe('stored:7')
    expect(getItemKey({ kind: 'pending', file: makeFile('a.pdf', 1, 'application/pdf') })).toMatch(
      /^pending:/,
    )
  })
})

describe('fileUploadItemSchema', () => {
  it('valida ambos tipos de elemento', () => {
    const file = makeFile('a.pdf', 1, 'application/pdf')
    expect(fileUploadItemSchema.safeParse({ kind: 'pending', file }).success).toBe(true)
    expect(
      fileUploadItemSchema.safeParse({
        kind: 'stored',
        id: '7',
        name: 'orden.pdf',
        size: 10,
        type: 'application/pdf',
      }).success,
    ).toBe(true)
    expect(
      fileUploadItemSchema.safeParse({
        kind: 'stored',
        id: '',
        name: 'orden.pdf',
        size: 10,
        type: 'application/pdf',
      }).success,
    ).toBe(false)
  })
})

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

describe('getCategoryExtensions', () => {
  it('entrega todas las extensiones de la categoría cuando no hay restricción', () => {
    expect(getCategoryExtensions('document')).toEqual([
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.csv',
    ])
  })

  it('entrega solo las extensiones permitidas de la categoría', () => {
    expect(getCategoryExtensions('document', ['.xlsx'])).toEqual(['.xlsx'])
    expect(getCategoryExtensions('image', ['.xlsx'])).toEqual([])
  })

  it('compara las extensiones sin distinguir mayúsculas', () => {
    expect(getCategoryExtensions('document', ['.XLSX'])).toEqual(['.xlsx'])
  })
})

describe('buildAcceptAttribute con extensiones restringidas', () => {
  it('incluye las extensiones indicadas y el tipo MIME de los formatos completos', () => {
    expect(buildAcceptAttribute(['document'], ['.xlsx'])).toBe(`${XLSX_MIME},.xlsx`)
  })

  it('omite el tipo MIME de un formato incluido solo en parte', () => {
    expect(buildAcceptAttribute(['image'], ['.jpg'])).toBe('.jpg')
  })

  it('no incluye extensiones de categorías no habilitadas', () => {
    expect(buildAcceptAttribute(['image'], ['.xlsx'])).toBe('')
  })
})

describe('validateFile con extensiones restringidas', () => {
  it('acepta un archivo con una extensión permitida, sin distinguir mayúsculas', () => {
    expect(
      validateFile(makeFile('planilla.xlsx', 10, XLSX_MIME), ['document'], ['.xlsx']),
    ).toBeNull()
    expect(
      validateFile(makeFile('PLANILLA.XLSX', 10, XLSX_MIME), ['document'], ['.xlsx']),
    ).toBeNull()
  })

  it('rechaza un archivo de la categoría con otra extensión', () => {
    expect(
      validateFile(makeFile('orden.pdf', 10, 'application/pdf'), ['document'], ['.xlsx']),
    ).toBe('tipo de archivo no permitido en este formulario')
  })

  it('mantiene las demás validaciones', () => {
    expect(validateFile(makeFile('vacia.xlsx', 0, XLSX_MIME), ['document'], ['.xlsx'])).toBe(
      'el archivo está vacío (0 bytes)',
    )
  })
})
