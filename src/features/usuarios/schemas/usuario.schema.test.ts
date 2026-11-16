import { describe, expect, it } from 'vitest'
import {
  crearUsuarioEdicionSchema,
  usuarioCreacionSchema,
  usuarioEdicionSchema,
} from './usuario.schema'

const baseEdicion = {
  nombres: 'Camila',
  apellidoPaterno: 'Fernández',
  apellidoMaterno: 'Rojas',
  emailInstitucional: 'camila.fernandez@ejemplo.cl',
  roles: ['1', '3'],
}

const base = { run: '13.579.246-2', ...baseEdicion }

describe('usuarioCreacionSchema', () => {
  it('acepta una entrada completa y valida', () => {
    expect(usuarioCreacionSchema.safeParse(base).success).toBe(true)
  })

  it('acepta el run sin puntos ni guion', () => {
    expect(usuarioCreacionSchema.safeParse({ ...base, run: '135792462' }).success).toBe(true)
  })

  it('rechaza un run con digito verificador incorrecto', () => {
    const resultado = usuarioCreacionSchema.safeParse({ ...base, run: '13.579.246-9' })
    expect(resultado.success).toBe(false)
  })

  it('pide el run cuando falta', () => {
    const resultado = usuarioCreacionSchema.safeParse({ ...base, run: '' })
    expect(resultado.error?.issues[0]?.message).toBe('Ingrese el RUN')
  })

  it('rechaza un correo mal formado', () => {
    const resultado = usuarioCreacionSchema.safeParse({
      ...base,
      emailInstitucional: 'camila.fernandez',
    })
    expect(resultado.error?.issues[0]?.message).toBe('Ingrese un correo válido')
  })

  it('exige el correo institucional', () => {
    const resultado = usuarioCreacionSchema.safeParse({ ...base, emailInstitucional: '' })
    expect(resultado.error?.issues[0]?.message).toBe('Ingrese el correo institucional')
  })

  it('rechaza nombres vacios', () => {
    expect(usuarioCreacionSchema.safeParse({ ...base, nombres: '   ' }).success).toBe(false)
  })

  it('rechaza un apellido que excede el limite de la columna', () => {
    const resultado = usuarioCreacionSchema.safeParse({
      ...base,
      apellidoPaterno: 'a'.repeat(51),
    })
    expect(resultado.success).toBe(false)
  })

  it('acepta un usuario sin roles', () => {
    expect(usuarioCreacionSchema.safeParse({ ...base, roles: [] }).success).toBe(true)
  })

  it('no transforma la entrada', () => {
    const resultado = usuarioCreacionSchema.parse(base)
    expect(resultado.run).toBe('13.579.246-2')
  })
})

describe('crearUsuarioEdicionSchema', () => {
  it('no exige el run', () => {
    expect(usuarioEdicionSchema.safeParse(baseEdicion).success).toBe(true)
  })

  it('exige el correo institucional a quien no tiene correo estudiantil', () => {
    const resultado = crearUsuarioEdicionSchema(false).safeParse({
      ...baseEdicion,
      emailInstitucional: '',
    })
    expect(resultado.error?.issues[0]?.message).toBe('Ingrese el correo institucional')
  })

  it('permite dejar vacio el correo institucional a quien tiene correo estudiantil', () => {
    const resultado = crearUsuarioEdicionSchema(true).safeParse({
      ...baseEdicion,
      emailInstitucional: '',
    })
    expect(resultado.success).toBe(true)
  })

  it('valida el formato aunque el correo institucional sea opcional', () => {
    const resultado = crearUsuarioEdicionSchema(true).safeParse({
      ...baseEdicion,
      emailInstitucional: 'x',
    })
    expect(resultado.error?.issues[0]?.message).toBe('Ingrese un correo válido')
  })
})
