import { describe, expect, it } from 'vitest'
import { construirAvisoDeCambios } from './unidadSolicitante'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'

const SEDE_UNO = { value: 'sede_uno', label: 'Sede uno' }
const SEDE_DOS = { value: 'sede_dos', label: 'Sede dos' }
const TIPOS = [
  { value: 'carrera', label: 'Carrera' },
  { value: 'unidad', label: 'Unidad' },
]

const unidad: UnidadSolicitante = {
  id: 1,
  cr: 101,
  nombre: 'Carrera uno',
  tipo: TIPOS[0],
  sedes: [SEDE_UNO, SEDE_DOS],
  activo: true,
  solicitudes: 2,
  requerimientos: 1,
  registradoPor: 'Usuario de prueba',
  fechaRegistro: '2026-01-05T09:00:00',
}

const peticion = {
  cr: 101,
  nombre: 'Carrera uno',
  tipo: 'carrera',
  sedes: ['sede_uno', 'sede_dos'],
}

describe('construirAvisoDeCambios', () => {
  it('no avisa si solo cambia el nombre', () => {
    expect(construirAvisoDeCambios(unidad, { ...peticion, nombre: 'Otra' }, TIPOS)).toBeNull()
  })

  it('no avisa si el registro no tiene datos asociados', () => {
    const sinRegistros = { ...unidad, solicitudes: 0, requerimientos: 0 }

    expect(construirAvisoDeCambios(sinRegistros, { ...peticion, cr: 150 }, TIPOS)).toBeNull()
  })

  it('describe el cambio de CR y orienta a crear un registro nuevo', () => {
    const aviso = construirAvisoDeCambios(unidad, { ...peticion, cr: 150 }, TIPOS)

    expect(aviso).toContain('2 solicitudes y 1 requerimiento')
    expect(aviso).toContain('el CR cambiará de 101 a 150')
    expect(aviso).toContain('registre una nueva carrera o unidad')
  })

  it('avisa la sede quitada sin orientar a crear un registro nuevo', () => {
    const aviso = construirAvisoDeCambios(unidad, { ...peticion, sedes: ['sede_uno'] }, TIPOS)

    expect(aviso).toContain('se quitará la sede Sede dos')
    expect(aviso).not.toContain('registre una nueva carrera o unidad')
  })
})
