import { describe, expect, it } from 'vitest'
import { formatFullName, getInitials } from './personName'

const nombre = {
  givenNames: 'Camila Andrea',
  paternalSurname: 'Fernández',
  maternalSurname: 'Rojas',
}

describe('formatFullName', () => {
  it('une nombres, apellido paterno y apellido materno', () => {
    expect(formatFullName(nombre)).toBe('Camila Andrea Fernández Rojas')
  })

  it('omite las partes vacias', () => {
    expect(formatFullName({ ...nombre, maternalSurname: '' })).toBe('Camila Andrea Fernández')
  })

  it('elimina los espacios sobrantes de cada parte', () => {
    expect(
      formatFullName({ ...nombre, givenNames: '  Camila Andrea ', paternalSurname: 'Fernández ' }),
    ).toBe('Camila Andrea Fernández Rojas')
  })
})

describe('getInitials', () => {
  it('toma la inicial del primer nombre y la del apellido paterno', () => {
    expect(getInitials(nombre)).toBe('CF')
  })

  it('emite las iniciales en mayuscula', () => {
    expect(getInitials({ ...nombre, givenNames: 'camila', paternalSurname: 'fernández' })).toBe(
      'CF',
    )
  })

  it('ignora los espacios al inicio', () => {
    expect(getInitials({ ...nombre, givenNames: '  Camila' })).toBe('CF')
  })

  it('usa el apellido materno cuando falta el paterno', () => {
    expect(getInitials({ ...nombre, paternalSurname: '' })).toBe('CR')
  })
})
