import { beforeEach, describe, expect, it } from 'vitest'
import { createMockUsuario } from '@/mocks/data/auth.mock'
import {
  CLAVE_SESION_SIMULADA,
  cerrarSesionSimulada,
  habilitarPersistenciaDeSesion,
  iniciarSesionSimuladaPorRun,
  obtenerSesionSimulada,
  restablecerSesion,
} from '@/mocks/handlers/sesion.estado'

describe('sesion simulada', () => {
  beforeEach(() => {
    restablecerSesion()
  })

  it('parte sin sesion en cada prueba', () => {
    expect(obtenerSesionSimulada()).toBeNull()
  })

  it('no guarda la sesion mientras la persistencia esta deshabilitada', () => {
    iniciarSesionSimuladaPorRun(12345678)

    expect(sessionStorage.getItem(CLAVE_SESION_SIMULADA)).toBeNull()
  })

  it('guarda y borra la sesion con la persistencia habilitada', () => {
    habilitarPersistenciaDeSesion()
    iniciarSesionSimuladaPorRun(12345678)

    const guardada: unknown = JSON.parse(sessionStorage.getItem(CLAVE_SESION_SIMULADA) ?? 'null')

    expect(guardada).toEqual(createMockUsuario())

    cerrarSesionSimulada()

    expect(sessionStorage.getItem(CLAVE_SESION_SIMULADA)).toBeNull()
  })

  it('restaura la sesion guardada al habilitar la persistencia', () => {
    sessionStorage.setItem(CLAVE_SESION_SIMULADA, JSON.stringify(createMockUsuario()))

    habilitarPersistenciaDeSesion()

    expect(obtenerSesionSimulada()).toEqual(createMockUsuario())
  })

  it('descarta un valor guardado que no es una sesion valida', () => {
    sessionStorage.setItem(CLAVE_SESION_SIMULADA, '{no es json')

    habilitarPersistenciaDeSesion()

    expect(obtenerSesionSimulada()).toBeNull()
    expect(sessionStorage.getItem(CLAVE_SESION_SIMULADA)).toBeNull()
  })

  it('rechaza iniciar sesion con un run que no existe en el registro', () => {
    expect(() => iniciarSesionSimuladaPorRun(1)).toThrow()
  })
})
