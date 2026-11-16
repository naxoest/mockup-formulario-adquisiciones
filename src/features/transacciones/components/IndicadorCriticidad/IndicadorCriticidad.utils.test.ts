import { describe, it, expect } from 'vitest'
import {
  claseSegmentoCriticidad,
  etiquetaCriticidad,
  formatearIndice,
  segmentosLlenos,
} from './IndicadorCriticidad.utils'

describe('formatearIndice', () => {
  it('presenta el indice con un decimal y coma decimal', () => {
    expect(formatearIndice(4.3)).toBe('4,3')
  })

  it('conserva el decimal en valores redondos', () => {
    expect(formatearIndice(4)).toBe('4,0')
  })
})

describe('etiquetaCriticidad', () => {
  it('etiqueta los tres niveles con tilde donde corresponde', () => {
    expect(etiquetaCriticidad('critico')).toBe('Crítico')
    expect(etiquetaCriticidad('atencion')).toBe('Atención')
    expect(etiquetaCriticidad('controlado')).toBe('Controlado')
  })
})

describe('claseSegmentoCriticidad', () => {
  it('asigna una paleta distinta a cada nivel', () => {
    expect(claseSegmentoCriticidad('critico')).toBe('bg-scarlet-500')
    expect(claseSegmentoCriticidad('atencion')).toBe('bg-saffron-500')
    expect(claseSegmentoCriticidad('controlado')).toBe('bg-jade-500')
  })
})

describe('segmentosLlenos', () => {
  it('devuelve el minimo de la escala', () => {
    expect(segmentosLlenos(1)).toBe(1)
  })

  it('devuelve el maximo de la escala', () => {
    expect(segmentosLlenos(5)).toBe(5)
  })

  it('redondea al entero mas cercano', () => {
    expect(segmentosLlenos(4.3)).toBe(4)
    expect(segmentosLlenos(3.4)).toBe(3)
    expect(segmentosLlenos(2.6)).toBe(3)
  })
})
