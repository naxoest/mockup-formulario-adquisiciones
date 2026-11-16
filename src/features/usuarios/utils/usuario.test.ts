import { describe, expect, it } from 'vitest'
import {
  construirPeticionCreacion,
  construirPeticionEdicion,
  construirValoresEdicion,
  esCampoCreacion,
  esCampoEdicion,
  formatearFechaDeRegistro,
  nombreDeUsuario,
} from './usuario'
import type {
  UsuarioCreacionValues,
  UsuarioEdicionValues,
} from '@/features/usuarios/schemas/usuario.schema'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

const valoresEdicion: UsuarioEdicionValues = {
  nombres: 'Camila',
  apellidoPaterno: 'Fernández',
  apellidoMaterno: 'Rojas',
  emailInstitucional: 'camila.fernandez@ejemplo.cl',
  roles: ['1', '3'],
}

const valores: UsuarioCreacionValues = { run: '13.579.246-2', ...valoresEdicion }

const usuario: Usuario = {
  run: 13579246,
  digitoVerificador: '2',
  emailInstitucional: 'camila.fernandez@ejemplo.cl',
  emailEstudiantil: null,
  nombres: 'Camila',
  apellidoPaterno: 'Fernández',
  apellidoMaterno: 'Rojas',
  esEstudiante: false,
  estaActivo: true,
  fotoUrl: null,
  portada: null,
  creadoEn: '2026-03-02T10:45:00',
  actualizadoEn: '2026-07-18T09:20:00',
  roles: [
    { id: 1, nombre: 'analista' },
    { id: 3, nombre: 'solicitante' },
  ],
}

describe('esCampoCreacion', () => {
  it('reconoce los campos del formulario', () => {
    expect(esCampoCreacion('run')).toBe(true)
    expect(esCampoCreacion('emailInstitucional')).toBe(true)
  })

  it('rechaza un campo desconocido', () => {
    expect(esCampoCreacion('digitoVerificador')).toBe(false)
  })
})

describe('esCampoEdicion', () => {
  it('reconoce los campos editables', () => {
    expect(esCampoEdicion('emailInstitucional')).toBe(true)
  })

  it('rechaza el run porque no es editable', () => {
    expect(esCampoEdicion('run')).toBe(false)
  })
})

describe('construirValoresEdicion', () => {
  it('traslada los datos del usuario al formulario', () => {
    const resultado = construirValoresEdicion(usuario)
    expect(resultado.nombres).toBe('Camila')
    expect(resultado.apellidoPaterno).toBe('Fernández')
    expect(resultado.emailInstitucional).toBe('camila.fernandez@ejemplo.cl')
  })

  it('convierte los identificadores de rol a texto', () => {
    expect(construirValoresEdicion(usuario).roles).toEqual(['1', '3'])
  })

  it('convierte el correo nulo en cadena vacia', () => {
    const resultado = construirValoresEdicion({ ...usuario, emailInstitucional: null })
    expect(resultado.emailInstitucional).toBe('')
  })

  it('devuelve un arreglo vacio cuando no hay roles', () => {
    expect(construirValoresEdicion({ ...usuario, roles: [] }).roles).toEqual([])
  })
})

describe('construirPeticionEdicion', () => {
  it('convierte los roles a numeros', () => {
    expect(construirPeticionEdicion(valoresEdicion).roles).toEqual([1, 3])
  })

  it('envia solo los campos que administra el formulario', () => {
    expect(Object.keys(construirPeticionEdicion(valoresEdicion)).sort()).toEqual([
      'apellidoMaterno',
      'apellidoPaterno',
      'emailInstitucional',
      'nombres',
      'roles',
    ])
  })

  it('envia como nulo un correo institucional vacio', () => {
    const peticion = construirPeticionEdicion({ ...valoresEdicion, emailInstitucional: '' })
    expect(peticion.emailInstitucional).toBeNull()
  })
})

describe('construirPeticionCreacion', () => {
  it('separa el run del digito verificador', () => {
    const peticion = construirPeticionCreacion(valores)
    expect(peticion.run).toBe(13579246)
    expect(peticion.digitoVerificador).toBe('2')
  })

  it('acepta el run sin puntos ni guion', () => {
    expect(construirPeticionCreacion({ ...valores, run: '135792462' }).run).toBe(13579246)
  })

  it('normaliza el digito verificador K a mayuscula', () => {
    expect(construirPeticionCreacion({ ...valores, run: '8.765.432-k' }).digitoVerificador).toBe(
      'K',
    )
  })

  it('crea un usuario sin vinculo estudiantil', () => {
    const peticion = construirPeticionCreacion(valores)
    expect(peticion.esEstudiante).toBe(false)
    expect(peticion.emailEstudiantil).toBeNull()
  })

  it('convierte los roles a numeros', () => {
    expect(construirPeticionCreacion(valores).roles).toEqual([1, 3])
  })

  it('admite un usuario sin roles', () => {
    expect(construirPeticionCreacion({ ...valores, roles: [] }).roles).toEqual([])
  })

  it('lanza si el run no puede interpretarse', () => {
    expect(() => construirPeticionCreacion({ ...valores, run: 'x' })).toThrow()
  })
})

describe('nombreDeUsuario', () => {
  it('asigna cada parte del nombre a su campo', () => {
    expect(nombreDeUsuario(usuario)).toEqual({
      givenNames: 'Camila',
      paternalSurname: 'Fernández',
      maternalSurname: 'Rojas',
    })
  })
})

describe('formatearFechaDeRegistro', () => {
  it('muestra la fecha de una marca local sin desplazarla por la zona horaria', () => {
    expect(formatearFechaDeRegistro('2026-03-02T23:45:00')).toBe('2 de marzo de 2026')
  })
})
