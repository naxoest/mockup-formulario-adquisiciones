import { describe, it, expect } from 'vitest'
import {
  claseTextoSeguimiento,
  formatearDiasRelativos,
  formatearFecha,
  varianteCriticidad,
} from './MonitoreoCriticidad.utils'
import { formatShortDate } from '@/utils/date'

describe('formatearDiasRelativos', () => {
  it('nombra el dia actual sin cifra', () => {
    expect(formatearDiasRelativos(0)).toBe('hoy')
  })

  it('nombra el dia anterior sin cifra', () => {
    expect(formatearDiasRelativos(1)).toBe('ayer')
  })

  it('expresa varios dias transcurridos en pasado', () => {
    expect(formatearDiasRelativos(5)).toBe('hace 5 días')
  })

  it('expresa dias negativos como futuro', () => {
    expect(formatearDiasRelativos(-3)).toBe('dentro de 3 días')
  })
})

describe('formatearFecha', () => {
  it('delega en el formateador transversal del proyecto', () => {
    expect(formatearFecha(new Date(2026, 7, 18))).toBe(formatShortDate(new Date(2026, 7, 18)))
  })
})

describe('varianteCriticidad', () => {
  it('asigna una variante distinta a cada nivel', () => {
    expect(varianteCriticidad('critico')).toBe('error')
    expect(varianteCriticidad('atencion')).toBe('warning')
    expect(varianteCriticidad('controlado')).toBe('success')
  })
})

describe('claseTextoSeguimiento', () => {
  it('asigna una clase a cada uno de los cuatro niveles', () => {
    expect(claseTextoSeguimiento('critico')).toBe('text-scarlet-700')
    expect(claseTextoSeguimiento('atencion')).toBe('text-saffron-700')
    expect(claseTextoSeguimiento('normal')).toBe('text-mercury-700')
    expect(claseTextoSeguimiento('sinRegistro')).toBe('text-mercury-500')
  })
})
