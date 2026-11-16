import { AccesoDenegadoError } from '@/features/auth/errores'
import { exigirPermiso, PERMISOS, tienePermiso, type Permiso } from '@/features/auth/permisos'
import type { Rol } from '@/features/auth/types'

const administrador: Rol = { id: 2, nombre: 'administrador' }
const analista: Rol = { id: 1, nombre: 'analista' }
const solicitante: Rol = { id: 3, nombre: 'solicitante' }

const MATRIZ: Array<[Permiso, boolean, boolean, boolean]> = [
  ['inicio:ver', true, true, false],
  ['transacciones:ver', true, true, false],
  ['transacciones:eliminar', true, false, false],
  ['transacciones:asignarAnalistas', true, false, false],
  ['monitoreo:ver', true, false, false],
  ['requerimientos:ver', true, true, false],
  ['requerimientos:importar', true, false, false],
  ['analisis:ver', true, true, false],
  ['misSolicitudes:ver', true, false, true],
  ['perfil:ver', true, true, true],
  ['usuarios:gestionar', true, false, false],
  ['mantenedor:ver', true, false, false],
]

describe('tienePermiso', () => {
  it.each(MATRIZ)(
    '%s corresponde a la matriz acordada',
    (permiso, paraAdministrador, paraAnalista, paraSolicitante) => {
      expect(tienePermiso([administrador], permiso)).toBe(paraAdministrador)
      expect(tienePermiso([analista], permiso)).toBe(paraAnalista)
      expect(tienePermiso([solicitante], permiso)).toBe(paraSolicitante)
    },
  )

  it('la matriz de la prueba cubre todos los permisos definidos', () => {
    const probados = MATRIZ.map(([permiso]) => permiso).sort((a, b) => a.localeCompare(b))
    const definidos = Object.keys(PERMISOS).sort((a, b) => a.localeCompare(b))

    expect(probados).toEqual(definidos)
  })

  it('suma los permisos de varios roles', () => {
    const roles = [analista, solicitante]

    expect(tienePermiso(roles, 'misSolicitudes:ver')).toBe(true)
    expect(tienePermiso(roles, 'transacciones:ver')).toBe(true)
    expect(tienePermiso(roles, 'monitoreo:ver')).toBe(false)
  })

  it('no otorga permisos sin roles ni con roles desconocidos', () => {
    expect(tienePermiso([], 'inicio:ver')).toBe(false)
    expect(tienePermiso([{ id: 9, nombre: 'auditor' }], 'inicio:ver')).toBe(false)
  })
})

describe('exigirPermiso', () => {
  it('no lanza error cuando el permiso esta otorgado', () => {
    expect(() => exigirPermiso([administrador], 'monitoreo:ver')).not.toThrow()
  })

  it('lanza AccesoDenegadoError cuando el permiso no esta otorgado', () => {
    expect(() => exigirPermiso([analista], 'monitoreo:ver')).toThrow(AccesoDenegadoError)
  })
})
