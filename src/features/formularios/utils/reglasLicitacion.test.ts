import { describe, expect, it } from 'vitest'
import {
  GARANTIA_MINIMA_LICITACION_MESES,
  MULTA_DIARIA_ESTANDAR,
  PLAZO_PAGO_ESTANDAR_DIAS,
  TOPE_CAUSAL_7B_UTM,
  TOPE_DIAS_MULTA_ESTANDAR,
  UMBRAL_CONTRATO_OBLIGATORIO_UTM,
  UMBRAL_GARANTIA_SERIEDAD_UTM,
  UMBRAL_SOLO_OC_UTM,
  VALOR_UTM_REFERENCIA_CLP,
  calcularMaximoGarantiaSeriedadClp,
  calcularMontoUtm,
  calcularTotalesCotizacionTratoDirecto,
  contarCriteriosTecnicosActivos,
  obtenerFormalizacionForzada,
  obtenerMinimoComisionEvaluadora,
  obtenerTramoUtm,
  sumarPonderacionesCriterios,
} from './reglasLicitacion'

describe('reglasLicitacion', () => {
  describe('constantes normativas', () => {
    it('mantiene los valores de referencia oficiales', () => {
      expect(VALOR_UTM_REFERENCIA_CLP).toBe(67250)
      expect(UMBRAL_SOLO_OC_UTM).toBe(100)
      expect(UMBRAL_CONTRATO_OBLIGATORIO_UTM).toBe(1000)
      expect(UMBRAL_GARANTIA_SERIEDAD_UTM).toBe(5000)
      expect(TOPE_CAUSAL_7B_UTM).toBe(100)
      expect(GARANTIA_MINIMA_LICITACION_MESES).toBe(6)
      expect(MULTA_DIARIA_ESTANDAR).toBe(0.5)
      expect(TOPE_DIAS_MULTA_ESTANDAR).toBe(20)
      expect(PLAZO_PAGO_ESTANDAR_DIAS).toBe(30)
    })
  })

  describe('calcularMontoUtm', () => {
    it('retorna 0 para montos nulos, negativos o cero', () => {
      expect(calcularMontoUtm(null)).toBe(0)
      expect(calcularMontoUtm(0)).toBe(0)
      expect(calcularMontoUtm(-5000)).toBe(0)
    })

    it('calcula correctamente el monto en UTM con dos decimales', () => {
      expect(calcularMontoUtm(672500, 67250)).toBe(10)
      expect(calcularMontoUtm(212042, 67250)).toBe(3.15)
    })

    it('retorna 0 si el valor UTM divisor es invalido', () => {
      expect(calcularMontoUtm(100000, 0)).toBe(0)
      expect(calcularMontoUtm(100000, -1)).toBe(0)
    })
  })

  describe('obtenerTramoUtm', () => {
    it('clasifica menor_100 cuando el monto es inferior a 100 UTM', () => {
      expect(obtenerTramoUtm(0)).toBe('menor_100')
      expect(obtenerTramoUtm(99.99)).toBe('menor_100')
    })

    it('clasifica entre_100_y_1000 entre 100 y 1000 UTM inclusive', () => {
      expect(obtenerTramoUtm(100)).toBe('entre_100_y_1000')
      expect(obtenerTramoUtm(500)).toBe('entre_100_y_1000')
      expect(obtenerTramoUtm(1000)).toBe('entre_100_y_1000')
    })

    it('clasifica mayor_1000 sobre 1000 UTM', () => {
      expect(obtenerTramoUtm(1000.01)).toBe('mayor_1000')
      expect(obtenerTramoUtm(5000)).toBe('mayor_1000')
    })
  })

  describe('obtenerFormalizacionForzada', () => {
    it('fuerza solo_oc bajo 100 UTM', () => {
      expect(obtenerFormalizacionForzada(50)).toBe('solo_oc')
    })

    it('fuerza contrato_y_oc sobre 1000 UTM', () => {
      expect(obtenerFormalizacionForzada(1500)).toBe('contrato_y_oc')
    })

    it('retorna null en el tramo intermedio permitiendo eleccion', () => {
      expect(obtenerFormalizacionForzada(100)).toBeNull()
      expect(obtenerFormalizacionForzada(500)).toBeNull()
      expect(obtenerFormalizacionForzada(1000)).toBeNull()
    })
  })

  describe('obtenerMinimoComisionEvaluadora', () => {
    it('exige 1 integrante hasta 1000 UTM', () => {
      expect(obtenerMinimoComisionEvaluadora(99)).toBe(1)
      expect(obtenerMinimoComisionEvaluadora(1000)).toBe(1)
    })

    it('exige minimo 3 integrantes sobre 1000 UTM', () => {
      expect(obtenerMinimoComisionEvaluadora(1000.1)).toBe(3)
      expect(obtenerMinimoComisionEvaluadora(5000)).toBe(3)
    })
  })

  describe('calcularMaximoGarantiaSeriedadClp', () => {
    it('retorna 0 para montos nulos o no positivos', () => {
      expect(calcularMaximoGarantiaSeriedadClp(null)).toBe(0)
      expect(calcularMaximoGarantiaSeriedadClp(0)).toBe(0)
      expect(calcularMaximoGarantiaSeriedadClp(-100)).toBe(0)
    })

    it('calcula el 3% maximo del monto en CLP', () => {
      expect(calcularMaximoGarantiaSeriedadClp(10000000)).toBe(300000)
    })
  })

  describe('contarCriteriosTecnicosActivos', () => {
    it('cuenta criterios booleanos activos mas adicionales', () => {
      const criterios = {
        aplicaPlazoEntrega: true,
        aplicaExperiencia: true,
        aplicaPlazoGarantia: false,
        otrosCriterios: [{ ponderacion: 10 }, { ponderacion: 5 }],
      }
      expect(contarCriteriosTecnicosActivos(criterios)).toBe(4)
    })

    it('retorna 0 cuando ningun criterio tecnico esta marcado', () => {
      expect(contarCriteriosTecnicosActivos({})).toBe(0)
    })
  })

  describe('sumarPonderacionesCriterios', () => {
    it('suma ponderaciones activas incluyendo precio y adicionales', () => {
      const total = sumarPonderacionesCriterios({
        ponderacionPrecio: 50,
        aplicaRequisitosFormales: true,
        ponderacionRequisitosFormales: 5,
        aplicaPactoIntegridad: true,
        ponderacionPactoIntegridad: 5,
        aplicaPlazoEntrega: true,
        ponderacionPlazoEntrega: 20,
        aplicaExperiencia: false,
        ponderacionExperiencia: 20,
        otrosCriterios: [{ ponderacion: 20 }],
      })
      expect(total).toBe(100)
    })

    it('ignora criterios inactivos aunque tengan valor numerico asignado', () => {
      const total = sumarPonderacionesCriterios({
        ponderacionPrecio: 70,
        aplicaPlazoEntrega: false,
        ponderacionPlazoEntrega: 30,
      })
      expect(total).toBe(70)
    })
  })

  describe('calcularTotalesCotizacionTratoDirecto', () => {
    it('calcula neto, iva y total para items con IVA afecto', () => {
      const lineas = [
        { cantidad: 2, precioUnitarioNeto: 50000 },
        { cantidad: 1, precioUnitarioNeto: 100000 },
      ]
      const totales = calcularTotalesCotizacionTratoDirecto(lineas, true)
      expect(totales.neto).toBe(200000)
      expect(totales.iva).toBe(38000)
      expect(totales.total).toBe(238000)
    })

    it('calcula total sin IVA cuando afectoIva es false', () => {
      const lineas = [{ cantidad: 1, precioUnitarioNeto: 178187 }]
      const totales = calcularTotalesCotizacionTratoDirecto(lineas, false)
      expect(totales.neto).toBe(178187)
      expect(totales.iva).toBe(0)
      expect(totales.total).toBe(178187)
    })

    it('ignora lineas con cantidades o precios invalidos', () => {
      const lineas = [
        { cantidad: null, precioUnitarioNeto: 1000 },
        { cantidad: 1, precioUnitarioNeto: null },
        { cantidad: 0, precioUnitarioNeto: 5000 },
        { cantidad: -1, precioUnitarioNeto: 5000 },
      ]
      const totales = calcularTotalesCotizacionTratoDirecto(lineas, true)
      expect(totales.neto).toBe(0)
      expect(totales.iva).toBe(0)
      expect(totales.total).toBe(0)
    })
  })
})
