import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('separa los registros con CRLF y deja vacías las celdas nulas', () => {
    expect(
      toCsv([
        ['a', null, 1],
        ['b', 'c', 2.5],
      ]),
    ).toBe('a,,1\r\nb,c,2.5')
  })

  it('encierra entre comillas los campos con coma, comillas o saltos de línea', () => {
    expect(toCsv([['x,y', 'dijo "sí"', 'dos\nlíneas']])).toBe('"x,y","dijo ""sí""","dos\nlíneas"')
  })

  it('neutraliza los textos que una planilla interpretaría como fórmula', () => {
    expect(toCsv([['=1+1', '+56', '-a', '@b', '\tc', '\uFF1Dd']])).toBe(
      "'=1+1,'+56,'-a,'@b,'\tc,'\uFF1Dd",
    )
    expect(toCsv([['\rx', '\ny']])).toBe('"\'\rx","\'\ny"')
    expect(toCsv([['=HYPERLINK("http://x")']])).toBe('"\'=HYPERLINK(""http://x"")"')
  })

  it('no altera los valores numéricos', () => {
    expect(toCsv([[-5, 3.4]])).toBe('-5,3.4')
  })
})
