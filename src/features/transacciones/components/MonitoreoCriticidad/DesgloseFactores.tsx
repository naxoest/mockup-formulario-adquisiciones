import { formatearIndice } from '@/features/transacciones/components/IndicadorCriticidad'
import type {
  EvaluacionCriticidad,
  FilaMonitoreo,
} from '@/features/transacciones/types/monitoreo.types'

const VALOR_MAXIMO_FACTOR = 5

const formateadorPeso = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

interface LineaFactor {
  clave: string
  etiqueta: string
  valor: number
  peso: number
}

function lineasDeFactores({ factores, pesos }: EvaluacionCriticidad): LineaFactor[] {
  return [
    {
      clave: 'impactoAcademico',
      etiqueta: 'Impacto académico',
      valor: factores.impactoAcademico,
      peso: pesos.impactoAcademico,
    },
    {
      clave: 'urgenciaTemporal',
      etiqueta: 'Urgencia temporal',
      valor: factores.urgenciaTemporal,
      peso: pesos.urgenciaTemporal,
    },
    {
      clave: 'exposicionInstitucional',
      etiqueta: 'Exposición institucional',
      valor: factores.exposicionInstitucional,
      peso: pesos.exposicionInstitucional,
    },
    {
      clave: 'riesgoOperacional',
      etiqueta: 'Riesgo operacional',
      valor: factores.riesgoOperacional,
      peso: pesos.riesgoOperacional,
    },
  ]
}

export function DesgloseFactores({ fila }: { fila: FilaMonitoreo }) {
  const evaluacion = fila.evaluacion

  return (
    <div className="flex flex-col gap-4">
      {evaluacion === null ? (
        <p className="text-sm text-mercury-600">
          Esta transacción todavía no tiene evaluación de criticidad.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {lineasDeFactores(evaluacion).map((linea) => (
              <div key={linea.clave} className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs text-mercury-600">{linea.etiqueta}</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-base font-medium tabular-nums text-mercury-800">
                    {linea.valor}
                  </span>
                  <span className="text-xs tabular-nums text-mercury-500">
                    de {VALOR_MAXIMO_FACTOR}, peso {formateadorPeso.format(linea.peso)}
                  </span>
                </span>
                <span className="h-1 w-full rounded-full bg-mercury-200" aria-hidden="true">
                  <span
                    className="block h-1 rounded-full bg-primary-500"
                    style={{ width: `${(linea.valor / VALOR_MAXIMO_FACTOR) * 100}%` }}
                  />
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-mercury-600">
            Índice resultante: {formatearIndice(evaluacion.indice)} de {VALOR_MAXIMO_FACTOR},0
          </p>
        </>
      )}

      {fila.observaciones === null ? null : (
        <p className="text-sm text-mercury-700">{fila.observaciones}</p>
      )}
    </div>
  )
}
