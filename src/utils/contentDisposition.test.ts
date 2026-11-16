import { parseContentDispositionFilename } from '@/utils/contentDisposition'

describe('parseContentDispositionFilename', () => {
  it('devuelve null cuando no hay cabecera', () => {
    expect(parseContentDispositionFilename(null)).toBeNull()
  })

  it('devuelve null cuando la cabecera no declara nombre', () => {
    expect(parseContentDispositionFilename('attachment')).toBeNull()
  })

  it('lee un nombre entre comillas', () => {
    expect(parseContentDispositionFilename('attachment; filename="reporte.pdf"')).toBe(
      'reporte.pdf',
    )
  })

  it('lee un nombre sin comillas', () => {
    expect(parseContentDispositionFilename('attachment; filename=reporte.pdf')).toBe('reporte.pdf')
  })

  it('decodifica la forma extendida en utf-8', () => {
    expect(
      parseContentDispositionFilename("attachment; filename*=UTF-8''reporte%20agosto.pdf"),
    ).toBe('reporte agosto.pdf')
  })

  it('prioriza la forma extendida sobre la simple', () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="respaldo.pdf"; filename*=UTF-8\'\'reporte.pdf',
      ),
    ).toBe('reporte.pdf')
  })

  it('cae a la forma simple cuando el charset extendido no es utf-8', () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="respaldo.pdf"; filename*=ISO-8859-1\'\'reporte.pdf',
      ),
    ).toBe('respaldo.pdf')
  })

  it('devuelve null cuando la forma extendida esta mal codificada', () => {
    expect(parseContentDispositionFilename("attachment; filename*=UTF-8''%E0%A4%A")).toBeNull()
  })
})
