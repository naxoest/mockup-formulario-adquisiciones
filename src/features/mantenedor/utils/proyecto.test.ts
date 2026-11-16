import { describe, expect, it } from 'vitest'
import {
  construirAvisoDeCambiosProyecto,
  construirValoresFormularioProyecto,
  esCampoProyecto,
} from './proyecto'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

const proyecto: Proyecto = {
  id: 1,
  cr: 201,
  nombre: 'Proyecto FONDECYT Regular 12001',
  activo: true,
  solicitudes: 3,
  registradoPor: 'Usuario de prueba',
  fechaRegistro: '2026-01-05T09:00:00',
}

const peticion = {
  cr: 201,
  nombre: 'Proyecto FONDECYT Regular 12001',
}

describe('proyecto utils', () => {
  it('valida campos pertenecientes al proyecto', () => {
    expect(esCampoProyecto('cr')).toBe(true)
    expect(esCampoProyecto('nombre')).toBe(true)
    expect(esCampoProyecto('tipo')).toBe(false)
    expect(esCampoProyecto('otro')).toBe(false)
  })

  it('construye valores por defecto para nuevo proyecto', () => {
    expect(construirValoresFormularioProyecto()).toEqual({
      cr: null,
      nombre: '',
    })
  })

  it('construye valores de formulario a partir de un proyecto existente', () => {
    expect(construirValoresFormularioProyecto(proyecto)).toEqual({
      cr: 201,
      nombre: 'Proyecto FONDECYT Regular 12001',
    })
  })

  describe('construirAvisoDeCambiosProyecto', () => {
    it('no avisa si solo cambia el nombre', () => {
      expect(
        construirAvisoDeCambiosProyecto(proyecto, { ...peticion, nombre: 'Nuevo Nombre' }),
      ).toBeNull()
    })

    it('no avisa si el proyecto no tiene solicitudes asociadas', () => {
      const sinSolicitudes = { ...proyecto, solicitudes: 0 }
      expect(construirAvisoDeCambiosProyecto(sinSolicitudes, { ...peticion, cr: 999 })).toBeNull()
    })

    it('describe el cambio de CR y orienta a registrar un proyecto nuevo', () => {
      const aviso = construirAvisoDeCambiosProyecto(proyecto, { ...peticion, cr: 999 })

      expect(aviso).toContain('3 solicitudes')
      expect(aviso).toContain('el CR cambiará de 201 a 999')
      expect(aviso).toContain('registre un nuevo proyecto')
    })
  })
})
