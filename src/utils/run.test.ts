import { describe, expect, it } from 'vitest'
import { computeVerifierDigit, formatRun, isValidRun, parseRun } from './run'

describe('computeVerifierDigit', () => {
  it('calcula un digito numerico', () => {
    expect(computeVerifierDigit(12345678)).toBe('5')
  })

  it('devuelve K cuando el resto obliga al valor 10', () => {
    expect(computeVerifierDigit(8765432)).toBe('K')
  })

  it('devuelve 0 cuando la suma es multiplo de once', () => {
    expect(computeVerifierDigit(12345675)).toBe('0')
  })

  it('calcula el digito de un run de siete cifras', () => {
    expect(computeVerifierDigit(9876543)).toBe('3')
  })
})

describe('parseRun', () => {
  it('acepta el formato con puntos y guion', () => {
    expect(parseRun('12.345.678-5')).toEqual({ run: 12345678, verifier: '5' })
  })

  it('acepta el formato sin puntos', () => {
    expect(parseRun('12345678-5')).toEqual({ run: 12345678, verifier: '5' })
  })

  it('acepta el formato sin puntos ni guion', () => {
    expect(parseRun('123456785')).toEqual({ run: 12345678, verifier: '5' })
  })

  it('normaliza la K minuscula', () => {
    expect(parseRun('8.765.432-k')).toEqual({ run: 8765432, verifier: 'K' })
  })

  it('ignora los espacios', () => {
    expect(parseRun(' 12.345.678 - 5 ')).toEqual({ run: 12345678, verifier: '5' })
  })

  it('rechaza una cadena vacia', () => {
    expect(parseRun('')).toBeNull()
  })

  it('rechaza una entrada de un solo caracter', () => {
    expect(parseRun('5')).toBeNull()
  })

  it('rechaza letras en el cuerpo', () => {
    expect(parseRun('1A345678-5')).toBeNull()
  })

  it('rechaza un verificador que no sea digito ni K', () => {
    expect(parseRun('12345678-J')).toBeNull()
  })

  it('rechaza el run cero', () => {
    expect(parseRun('0-0')).toBeNull()
  })
})

describe('formatRun', () => {
  it('agrupa de a tres cifras con punto', () => {
    expect(formatRun(12345678, '5')).toBe('12.345.678-5')
  })

  it('agrupa un run de siete cifras', () => {
    expect(formatRun(9876543, '3')).toBe('9.876.543-3')
  })

  it('no agrega separador bajo mil', () => {
    expect(formatRun(999, '7')).toBe('999-7')
  })

  it('emite el verificador en mayuscula', () => {
    expect(formatRun(8765432, 'k')).toBe('8.765.432-K')
  })
})

describe('isValidRun', () => {
  it('acepta un run con verificador correcto', () => {
    expect(isValidRun('12.345.678-5')).toBe(true)
  })

  it('acepta un run cuyo verificador es K', () => {
    expect(isValidRun('8.765.432-K')).toBe(true)
  })

  it('acepta un run cuyo verificador es 0', () => {
    expect(isValidRun('12.345.675-0')).toBe(true)
  })

  it('rechaza un run con verificador incorrecto', () => {
    expect(isValidRun('12.345.678-9')).toBe(false)
  })

  it('rechaza una entrada mal formada', () => {
    expect(isValidRun('no es un run')).toBe(false)
  })
})
