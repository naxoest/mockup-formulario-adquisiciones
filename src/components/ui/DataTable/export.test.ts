import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { exportToCSV, exportToExcel } from './export'
import type { ColumnDef } from './DataTable.types'

interface TestRow {
  id: number
  name: string
  note: string | null
}

const columns: ColumnDef<TestRow>[] = [
  { field: 'id', header: 'ID' },
  { field: 'name', header: 'Nombre' },
  { field: 'note', header: 'Nota' },
]

const data: TestRow[] = [
  { id: 1, name: 'Diego', note: 'ok' },
  { id: 2, name: 'Con, coma', note: null },
  { id: 3, name: 'Con "comillas"', note: 'linea1\nlinea2' },
]

let createdBlobs: Array<{ blob: Blob; filename: string }> = []

beforeEach(() => {
  createdBlobs = []

  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock-url'),
    writable: true,
    configurable: true,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  })

  const realCreateElement = Document.prototype.createElement
  vi.spyOn(document, 'createElement').mockImplementation(function (this: Document, tag: string) {
    const el = realCreateElement.call(this, tag) as HTMLElement
    if (tag === 'a') {
      const anchor = el as HTMLAnchorElement
      vi.spyOn(anchor, 'click').mockImplementation(() => {})
      const originalSetAttribute = anchor.setAttribute.bind(anchor)
      anchor.setAttribute = (name: string, value: string) => {
        if (name === 'download') {
          const lastIndex = createdBlobs.length - 1
          if (lastIndex >= 0) createdBlobs[lastIndex].filename = value
        }
        originalSetAttribute(name, value)
      }
    }
    return el as unknown as ReturnType<Document['createElement']>
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

function captureBlob(blob: Blob) {
  createdBlobs.push({ blob, filename: '' })
}

async function readBlobAsText(blob: Blob): Promise<string> {
  return await blob.text()
}

describe('exportToCSV', () => {
  it('creates a blob with CSV mime type', () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'test.csv')
      expect(createdBlobs).toHaveLength(1)
      expect(createdBlobs[0].blob.type).toContain('text/csv')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('uses the provided filename', () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'archivo.csv')
      expect(createdBlobs[0].filename).toBe('archivo.csv')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('includes headers as first line', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'test.csv')
      const content = await readBlobAsText(createdBlobs[0].blob)
      const firstLine = content.split('\n')[0].replace('\ufeff', '')
      expect(firstLine).toBe('ID,Nombre,Nota')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('escapes values with commas using double quotes', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'test.csv')
      const content = await readBlobAsText(createdBlobs[0].blob)
      expect(content).toContain('"Con, coma"')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('escapes double quotes by doubling them', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'test.csv')
      const content = await readBlobAsText(createdBlobs[0].blob)
      expect(content).toContain('"Con ""comillas"""')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('renders null as empty string', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToCSV(data, columns, 'test.csv')
      const content = await readBlobAsText(createdBlobs[0].blob)
      const lines = content.split('\n')
      expect(lines[2]).toBe('2,"Con, coma",')
    } finally {
      globalThis.Blob = originalBlob
    }
  })
})

describe('exportToExcel', () => {
  it('creates a blob with excel mime type', () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToExcel(data, columns, 'test.xls')
      expect(createdBlobs[0].blob.type).toContain('application/vnd.ms-excel')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('uses the provided filename', () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToExcel(data, columns, 'archivo.xls')
      expect(createdBlobs[0].filename).toBe('archivo.xls')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('includes HTML table structure', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToExcel(data, columns, 'test.xls')
      const content = await readBlobAsText(createdBlobs[0].blob)
      expect(content).toContain('<table')
      expect(content).toContain('</table>')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('escapes HTML entities in values', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      const rowsWithHtml: TestRow[] = [{ id: 1, name: '<script>', note: 'a & b' }]
      exportToExcel(rowsWithHtml, columns, 'test.xls')
      const content = await readBlobAsText(createdBlobs[0].blob)
      expect(content).toContain('&lt;script&gt;')
      expect(content).toContain('a &amp; b')
    } finally {
      globalThis.Blob = originalBlob
    }
  })

  it('renders null as empty cell', async () => {
    const originalBlob = globalThis.Blob
    globalThis.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        captureBlob(this as unknown as Blob)
      }
    } as unknown as typeof Blob

    try {
      exportToExcel(data, columns, 'test.xls')
      const content = await readBlobAsText(createdBlobs[0].blob)
      expect(content).toContain('<td></td>')
    } finally {
      globalThis.Blob = originalBlob
    }
  })
})
