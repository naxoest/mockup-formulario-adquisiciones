import { describe, it, expect } from 'vitest'
import { aActualizacion, valoresIniciales } from './GestionMonitoreo.utils'
import { gestionMonitoreoSchema } from '@/features/transacciones/schemas/gestionMonitoreo.schema'
import type { GestionMonitoreoValues } from '@/features/transacciones/schemas/gestionMonitoreo.schema'
import { construirFilaMonitoreo } from '@/features/transacciones/utils/criticidad'
import { calcularEvaluacion } from '@/mocks/handlers/monitoreo.derivacion'
import type { RegistroMonitoreo } from '@/features/transacciones/types/monitoreo.types'

const referencia = new Date(2026, 7, 18)

const base: RegistroMonitoreo = {
  transaccionId: 7,
  nombre: 'Proceso',
  analista: { run: 16234875, nombre: 'Camila Ferrada' },
  evaluacion: calcularEvaluacion({
    impactoAcademico: 5,
    urgenciaTemporal: 4,
    exposicionInstitucional: 3,
    riesgoOperacional: 2,
  }),
  ultimoMovimiento: new Date(2026, 7, 12, 10, 12),
  proximaAccion: 'Reiterar cotización',
  fechaProximaRevision: new Date(2026, 7, 21),
  bloqueadorPrincipal: { value: 'proveedores', label: 'Proveedores' },
  escalarAJefatura: true,
  cerrado: false,
  observaciones: 'Sin respuesta del proveedor',
}

function fila(cambios: Partial<RegistroMonitoreo> = {}) {
  return construirFilaMonitoreo({ ...base, ...cambios }, referencia)
}

describe('valoresIniciales', () => {
  it('aplana los cuatro factores', () => {
    const valores = valoresIniciales(fila())
    expect(valores.impactoAcademico).toBe(5)
    expect(valores.urgenciaTemporal).toBe(4)
    expect(valores.exposicionInstitucional).toBe(3)
    expect(valores.riesgoOperacional).toBe(2)
  })

  it('deja los factores sin definir cuando la transaccion no ha sido evaluada', () => {
    const valores = valoresIniciales(fila({ evaluacion: null }))
    expect(valores.impactoAcademico).toBeUndefined()
    expect(valores.urgenciaTemporal).toBeUndefined()
    expect(valores.exposicionInstitucional).toBeUndefined()
    expect(valores.riesgoOperacional).toBeUndefined()
  })

  it('conserva el resto de los campos cuando no hay evaluacion', () => {
    const valores = valoresIniciales(fila({ evaluacion: null }))
    expect(valores.proximaAccion).toBe('Reiterar cotización')
    expect(valores.escalarAJefatura).toBe(true)
  })

  it('conserva los textos existentes', () => {
    expect(valoresIniciales(fila()).observaciones).toBe('Sin respuesta del proveedor')
  })

  it('entrega el codigo del bloqueador y no su etiqueta', () => {
    expect(valoresIniciales(fila()).bloqueadorPrincipal).toBe('proveedores')
  })

  it('convierte los textos nulos en cadena vacia', () => {
    const valores = valoresIniciales(
      fila({
        proximaAccion: null,
        bloqueadorPrincipal: null,
        observaciones: null,
      }),
    )
    expect(valores.proximaAccion).toBe('')
    expect(valores.bloqueadorPrincipal).toBe('')
    expect(valores.observaciones).toBe('')
  })

  it('conserva las fechas nulas como nulas', () => {
    const valores = valoresIniciales(fila({ fechaProximaRevision: null }))
    expect(valores.fechaProximaRevision).toBeNull()
  })

  it('conserva los booleanos', () => {
    const valores = valoresIniciales(fila())
    expect(valores.escalarAJefatura).toBe(true)
    expect(valores.cerrado).toBe(false)
  })
})

describe('gestionMonitoreoSchema', () => {
  const validos = valoresIniciales(fila())

  it('acepta los valores iniciales de un registro existente', () => {
    expect(gestionMonitoreoSchema.safeParse(validos).success).toBe(true)
  })

  it('rechaza los valores iniciales de una transaccion sin evaluar', () => {
    const resultado = gestionMonitoreoSchema.safeParse(valoresIniciales(fila({ evaluacion: null })))
    expect(resultado.success).toBe(false)
  })

  it('rechaza un factor fuera del rango superior', () => {
    expect(gestionMonitoreoSchema.safeParse({ ...validos, impactoAcademico: 6 }).success).toBe(
      false,
    )
  })

  it('rechaza un factor fuera del rango inferior', () => {
    expect(gestionMonitoreoSchema.safeParse({ ...validos, urgenciaTemporal: 0 }).success).toBe(
      false,
    )
  })

  it('rechaza un factor decimal', () => {
    expect(gestionMonitoreoSchema.safeParse({ ...validos, riesgoOperacional: 3.5 }).success).toBe(
      false,
    )
  })

  it('rechaza un factor nulo', () => {
    expect(
      gestionMonitoreoSchema.safeParse({ ...validos, exposicionInstitucional: null }).success,
    ).toBe(false)
  })

  it('acepta un texto vacio sin transformarlo', () => {
    const resultado = gestionMonitoreoSchema.parse({ ...validos, bloqueadorPrincipal: '' })
    expect(resultado.bloqueadorPrincipal).toBe('')
  })

  it('admite una fecha nula', () => {
    const resultado = gestionMonitoreoSchema.parse({ ...validos, fechaProximaRevision: null })
    expect(resultado.fechaProximaRevision).toBeNull()
  })
})

describe('aActualizacion', () => {
  const valoresValidos = (): GestionMonitoreoValues =>
    gestionMonitoreoSchema.parse(valoresIniciales(fila()))

  it('reagrupa los factores en su objeto', () => {
    expect(aActualizacion(valoresValidos()).factores).toEqual({
      impactoAcademico: 5,
      urgenciaTemporal: 4,
      exposicionInstitucional: 3,
      riesgoOperacional: 2,
    })
  })

  it('escribe el bloqueador como codigo plano', () => {
    expect(aActualizacion(valoresValidos()).bloqueadorPrincipal).toBe('proveedores')
  })

  it('escribe la proxima revision como fecha de calendario', () => {
    expect(aActualizacion(valoresValidos()).fechaProximaRevision).toBe('2026-08-21')
  })

  it('conserva la proxima revision nula', () => {
    const valores = { ...valoresValidos(), fechaProximaRevision: null }
    expect(aActualizacion(valores).fechaProximaRevision).toBeNull()
  })

  it('convierte un bloqueador vacio en nulo para borrarlo en el servidor', () => {
    const valores = { ...valoresValidos(), bloqueadorPrincipal: '' }
    expect(aActualizacion(valores).bloqueadorPrincipal).toBeNull()
  })

  it('convierte un texto de solo espacios en nulo', () => {
    const valores = { ...valoresValidos(), observaciones: '   ' }
    expect(aActualizacion(valores).observaciones).toBeNull()
  })

  it('recorta los espacios de un texto con contenido', () => {
    const valores = { ...valoresValidos(), proximaAccion: '  Llamar  ' }
    expect(aActualizacion(valores).proximaAccion).toBe('Llamar')
  })

  it('propaga los booleanos sin alterarlos', () => {
    const valores: GestionMonitoreoValues = {
      ...valoresValidos(),
      cerrado: true,
      escalarAJefatura: false,
    }
    const actualizacion = aActualizacion(valores)
    expect(actualizacion.cerrado).toBe(true)
    expect(actualizacion.escalarAJefatura).toBe(false)
  })
})
