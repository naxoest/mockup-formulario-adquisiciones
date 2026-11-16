import { describe, expect, it } from 'vitest'
import { paginaUsuariosResponseSchema, usuarioResponseSchema } from './usuarioResponse.schema'

const usuario = {
  run: 13579246,
  digitoVerificador: '2',
  emailInstitucional: 'camila.fernandez@ejemplo.cl',
  emailEstudiantil: null,
  nombres: 'Camila',
  apellidoPaterno: 'Fernández',
  apellidoMaterno: 'Rojas',
  esEstudiante: false,
  estaActivo: true,
  creadoEn: '2026-03-02T10:45:00',
  actualizadoEn: '2026-07-18T09:20:00',
  roles: [{ id: 1, nombre: 'analista' }],
}

describe('usuarioResponseSchema', () => {
  it('acepta un usuario tal como lo entrega el backend', () => {
    expect(usuarioResponseSchema.safeParse(usuario).success).toBe(true)
  })

  it('acepta un correo que el backend no valida como correo', () => {
    const resultado = usuarioResponseSchema.safeParse({
      ...usuario,
      emailInstitucional: 'sin-formato',
    })
    expect(resultado.success).toBe(true)
  })

  it('acepta un usuario con solo correo estudiantil', () => {
    const resultado = usuarioResponseSchema.safeParse({
      ...usuario,
      emailInstitucional: null,
      emailEstudiantil: 'camila.fernandez@alumnos.ejemplo.cl',
      esEstudiante: true,
    })
    expect(resultado.success).toBe(true)
  })

  it('acepta un apellido materno vacio', () => {
    expect(usuarioResponseSchema.safeParse({ ...usuario, apellidoMaterno: '' }).success).toBe(true)
  })

  it('acepta nombres de mas de cincuenta caracteres', () => {
    const resultado = usuarioResponseSchema.safeParse({ ...usuario, nombres: 'a'.repeat(80) })
    expect(resultado.success).toBe(true)
  })

  it('acepta un digito verificador k en minuscula', () => {
    const resultado = usuarioResponseSchema.safeParse({ ...usuario, digitoVerificador: 'k' })
    expect(resultado.success).toBe(true)
  })

  it('rechaza un digito verificador de mas de un caracter', () => {
    const resultado = usuarioResponseSchema.safeParse({ ...usuario, digitoVerificador: '12' })
    expect(resultado.success).toBe(false)
  })

  it('rechaza un run que no es positivo', () => {
    expect(usuarioResponseSchema.safeParse({ ...usuario, run: 0 }).success).toBe(false)
  })

  it('deja la foto en nulo cuando el backend no la envia', () => {
    expect(usuarioResponseSchema.parse(usuario).fotoUrl).toBeNull()
  })

  it('conserva la URL de la foto', () => {
    const url = 'https://sistema.ejemplo.cl/api/usuarios/13579246/foto?v=abc'

    expect(usuarioResponseSchema.parse({ ...usuario, fotoUrl: url }).fotoUrl).toBe(url)
  })

  it('deja la portada en nulo cuando el backend no la envia', () => {
    expect(usuarioResponseSchema.parse(usuario).portada).toBeNull()
  })

  it('conserva la clave de la portada', () => {
    expect(usuarioResponseSchema.parse({ ...usuario, portada: 'volcan-osorno' }).portada).toBe(
      'volcan-osorno',
    )
  })

  it('rechaza una foto que no es texto', () => {
    expect(usuarioResponseSchema.safeParse({ ...usuario, fotoUrl: 7 }).success).toBe(false)
  })
})

describe('paginaUsuariosResponseSchema', () => {
  it('conserva los datos y la paginacion', () => {
    const pagina = paginaUsuariosResponseSchema.parse({
      datos: [usuario],
      paginacion: { pagina: 1, por_pagina: 100, total: 1 },
    })

    expect(pagina.datos).toHaveLength(1)
    expect(pagina.paginacion).toEqual({ pagina: 1, por_pagina: 100, total: 1 })
  })

  it('rechaza una respuesta sin paginacion', () => {
    expect(paginaUsuariosResponseSchema.safeParse({ datos: [usuario] }).success).toBe(false)
  })
})
