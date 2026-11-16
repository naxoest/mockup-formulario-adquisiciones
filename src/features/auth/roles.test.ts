import { esNombreRol, etiquetaRol } from '@/features/auth/roles'

describe('etiquetaRol', () => {
  it('traduce los roles conocidos a su etiqueta visible', () => {
    expect(etiquetaRol('administrador')).toBe('Administrador')
    expect(etiquetaRol('analista')).toBe('Analista')
    expect(etiquetaRol('solicitante')).toBe('Solicitante')
  })

  it('muestra tal cual un rol desconocido', () => {
    expect(etiquetaRol('auditor')).toBe('auditor')
  })
})

describe('esNombreRol', () => {
  it('reconoce solo los roles definidos', () => {
    expect(esNombreRol('analista')).toBe(true)
    expect(esNombreRol('Analista')).toBe(false)
    expect(esNombreRol('toString')).toBe(false)
  })
})
