import { useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { FieldArray } from '@/components/ui/FieldArray'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import type { LicitacionPublicaFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  GARANTIA_MINIMA_LICITACION_MESES,
  calcularMontoUtm,
  obtenerMinimoComisionEvaluadora,
  sumarPonderacionesCriterios,
} from '@/features/formularios/utils/reglasLicitacion'
import { cn } from '@/utils/cn'

export function PasoEvaluacionLicitacion() {
  const { control } = useFormContext<LicitacionPublicaFormValues>()
  const montoClp = useWatch({ control, name: 'montoEstimadoClp' })
  const comisionWatch = useWatch({ control, name: 'comisionEvaluadora' })
  const criteriosWatch = useWatch({ control, name: 'criteriosEvaluacion' })

  const montoUtm = calcularMontoUtm(montoClp)
  const minimoIntegrantes = obtenerMinimoComisionEvaluadora(montoUtm)
  const totalIntegrantes = comisionWatch?.length ?? 0
  const sumaPonderaciones = sumarPonderacionesCriterios(criteriosWatch ?? {})
  const sumaCorrecta = sumaPonderaciones === 100

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-mercury-900">1. Comisión Evaluadora</h3>
            <p className="text-xs text-mercury-500">
              Para montos menores o iguales a 1.000 UTM se exige mínimo 1 funcionario; sobre 1.000
              UTM se exigen mínimo 3 funcionarios.
            </p>
          </div>
          <Badge variant={totalIntegrantes >= minimoIntegrantes ? 'success' : 'warning'}>
            {totalIntegrantes} de {minimoIntegrantes} mín. requeridos
          </Badge>
        </div>

        <FieldArray<LicitacionPublicaFormValues>
          name="comisionEvaluadora"
          addLabel="Agregar integrante a la comisión"
          emptyState="Designe a los funcionarios que integrarán la comisión evaluadora."
          defaultItem={() => ({
            nombreCompleto: '',
            run: '',
            cargo: '',
            unidad: '',
          })}
          renderSummary={({ index }) => {
            const integrante = comisionWatch?.[index]
            return (
              <span className="text-sm font-medium text-mercury-800">
                {integrante?.nombreCompleto?.trim()
                  ? `${integrante.nombreCompleto} — ${integrante.cargo || 'Sin cargo'}`
                  : `Integrante #${index + 1}`}
              </span>
            )
          }}
          renderDetail={({ index }) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field<LicitacionPublicaFormValues>
                name={`comisionEvaluadora.${index}.nombreCompleto`}
                label="Nombre completo"
                required
              >
                <Input placeholder="Ej. Dr. Rodrigo Cáceres Paredes" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name={`comisionEvaluadora.${index}.run`}
                label="RUN"
                required
              >
                <Input placeholder="Ej. 11.111.111-1" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name={`comisionEvaluadora.${index}.cargo`}
                label="Cargo"
                required
              >
                <Input placeholder="Ej. Académico Investigador" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name={`comisionEvaluadora.${index}.unidad`}
                label="Unidad o Departamento"
                required
              >
                <Input placeholder="Ej. Departamento de Ciencias Biológicas" />
              </Field>
            </div>
          )}
        />
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-mercury-900">
              2. Criterios de Evaluación (Deben sumar 100%)
            </h3>
            <p className="text-xs text-mercury-500">
              Ponderación de criterios administrativos, económicos (precio) y técnicos (plazo,
              experiencia y garantía).
            </p>
          </div>

          <div
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums',
              sumaCorrecta
                ? 'border-jade-300 bg-jade-50 text-jade-700'
                : 'border-scarlet-300 bg-scarlet-50 text-scarlet-700',
            )}
          >
            Suma actual: {sumaPonderaciones}% / 100%
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.ponderacionAdministrativa"
            label="Administrativo (%)"
            description="Requisitos formales."
            required
          >
            <NumberInput min={0} max={100} suffix="%" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.ponderacionEconomica"
            label="Económico: Precio (%)"
            description="Inversamente proporcional al valor."
            required
          >
            <NumberInput min={0} max={100} suffix="%" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.ponderacionPlazoEntrega"
            label="Técnico: Plazo de entrega (%)"
            description="Oportunidad en la entrega."
            required
          >
            <NumberInput min={0} max={100} suffix="%" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.ponderacionExperiencia"
            label="Técnico: Experiencia (%)"
            description="Experiencia demostrable del oferente."
            required
          >
            <NumberInput min={0} max={100} suffix="%" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.ponderacionGarantia"
            label="Técnico: Plazo de garantía (%)"
            description="Cobertura técnica post-venta."
            required
          >
            <NumberInput min={0} max={100} suffix="%" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.mesesGarantiaMinima"
            label="Garantía mínima exigida"
            description={`Mínimo normativo: ${GARANTIA_MINIMA_LICITACION_MESES} meses.`}
            required
          >
            <NumberInput min={GARANTIA_MINIMA_LICITACION_MESES} suffix="meses" />
          </Field>
        </div>

        <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.exigePactoIntegridad"
            label="Pacto de Integridad"
            hideLabel
          >
            <Checkbox
              label="Incluir exigencia obligatoria de Pacto de Integridad en las bases"
              description="Compromiso ético y de probidad exigido a todos los oferentes participantes."
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
