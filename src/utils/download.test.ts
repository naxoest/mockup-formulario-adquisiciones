import { downloadBlob } from '@/utils/download'

describe('downloadBlob', () => {
  const urlCreada = 'blob:http://localhost/abc'
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    createObjectURL = vi.fn(() => urlCreada)
    revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL
    URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('dispara la descarga con el nombre indicado', () => {
    let descargado: string | null = null
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      descargado = this.download
    })

    downloadBlob(new Blob(['contenido']), 'reporte.pdf')

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(descargado).toBe('reporte.pdf')
    clickSpy.mockRestore()
  })

  it('no deja el ancla en el documento', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadBlob(new Blob(['contenido']), 'reporte.pdf')

    expect(document.querySelector('a')).toBeNull()
    clickSpy.mockRestore()
  })

  it('revoca la url despues del turno actual y no antes', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadBlob(new Blob(['contenido']), 'reporte.pdf')

    expect(revokeObjectURL).not.toHaveBeenCalled()

    vi.runAllTimers()

    expect(revokeObjectURL).toHaveBeenCalledWith(urlCreada)
    clickSpy.mockRestore()
  })
})
