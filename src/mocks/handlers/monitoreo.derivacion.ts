import type {
  EvaluacionCriticidad,
  FactoresCriticidad,
  NivelCriticidad,
  PesosCriticidad,
} from '@/features/transacciones/types/monitoreo.types'

const PESOS_EN_DECIMAS: PesosCriticidad = {
  impactoAcademico: 4,
  urgenciaTemporal: 3,
  exposicionInstitucional: 2,
  riesgoOperacional: 1,
}

const UMBRAL_CRITICO_EN_DECIMAS = 40
const UMBRAL_ATENCION_EN_DECIMAS = 30

function calcularIndiceEnDecimas(factores: FactoresCriticidad): number {
  return (
    factores.impactoAcademico * PESOS_EN_DECIMAS.impactoAcademico +
    factores.urgenciaTemporal * PESOS_EN_DECIMAS.urgenciaTemporal +
    factores.exposicionInstitucional * PESOS_EN_DECIMAS.exposicionInstitucional +
    factores.riesgoOperacional * PESOS_EN_DECIMAS.riesgoOperacional
  )
}

function clasificarCriticidad(indiceEnDecimas: number): NivelCriticidad {
  if (indiceEnDecimas >= UMBRAL_CRITICO_EN_DECIMAS) return 'critico'
  if (indiceEnDecimas >= UMBRAL_ATENCION_EN_DECIMAS) return 'atencion'
  return 'controlado'
}

function pesosCriticidad(): PesosCriticidad {
  return {
    impactoAcademico: PESOS_EN_DECIMAS.impactoAcademico / 10,
    urgenciaTemporal: PESOS_EN_DECIMAS.urgenciaTemporal / 10,
    exposicionInstitucional: PESOS_EN_DECIMAS.exposicionInstitucional / 10,
    riesgoOperacional: PESOS_EN_DECIMAS.riesgoOperacional / 10,
  }
}

export function calcularEvaluacion(factores: FactoresCriticidad): EvaluacionCriticidad {
  const indiceEnDecimas = calcularIndiceEnDecimas(factores)

  return {
    factores: { ...factores },
    pesos: pesosCriticidad(),
    indice: indiceEnDecimas / 10,
    nivel: clasificarCriticidad(indiceEnDecimas),
  }
}
