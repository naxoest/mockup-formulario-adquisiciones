import { useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Combobox } from '@/components/ui/Combobox'
import { FieldArray } from '@/components/ui/FieldArray'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { LicitacionPublicaFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  OPCIONES_MECANISMO_GARANTIA,
  OPCIONES_MECANISMO_PLAZO_ENTREGA,
  OPCIONES_MECANISMO_PRECIO,
  OPCIONES_MODO_EXPERIENCIA,
  OPCIONES_TIPO_EVALUACION,
} from '@/features/formularios/utils/catalogosFormulario'
import {
  calcularMontoUtm,
  contarCriteriosTecnicosActivos,
  obtenerMinimoComisionEvaluadora,
  sumarPonderacionesCriterios,
} from '@/features/formularios/utils/reglasLicitacion'
import { cn } from '@/utils/cn'

const OPCIONES_TIPO_DIAS = [
  { value: 'habiles', label: 'Días hábiles' },
  { value: 'corridos', label: 'Días corridos' },
]

export function PasoEvaluacionLicitacion() {
  const { control } = useFormContext<LicitacionPublicaFormValues>()
  const montoClp = useWatch({ control, name: 'montoEstimadoClp' })
  const comisionWatch = useWatch({ control, name: 'comisionEvaluadora' })
  const criteriosWatch = useWatch({ control, name: 'criteriosEvaluacion' })

  const montoUtm = calcularMontoUtm(montoClp)
  const minimoIntegrantes = obtenerMinimoComisionEvaluadora(montoUtm)
  const totalIntegrantes = comisionWatch?.length ?? 0
  const sumaPonderaciones = sumarPonderacionesCriterios(criteriosWatch ?? {})
  const tecnicosActivos = contarCriteriosTecnicosActivos(criteriosWatch ?? {})
  const sumaCorrecta = sumaPonderaciones === 100 && tecnicosActivos >= 1

  return (
    <div className="space-y-6">
      <Field<LicitacionPublicaFormValues>
        name="tipoEvaluacion"
        label="III. Evaluación y Adjudicación de las Ofertas — Tipo de Evaluación"
        required
      >
        <RadioGroup options={OPCIONES_TIPO_EVALUACION} />
      </Field>

      <div className="space-y-3 border-t border-mercury-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-mercury-900">
              Funcionarias/os con Responsabilidad Administrativa que Evaluarán las Ofertas
            </h3>
            <p className="text-xs text-mercury-500">
              Menores a 1.000 UTM: mínimo 1 funcionario (Jefe de CR + funcionario pertinente).
              Mayores a 1.000 UTM: comisión evaluadora de mínimo 3 funcionarias/os.
            </p>
          </div>
          <Badge variant={totalIntegrantes >= minimoIntegrantes ? 'success' : 'warning'}>
            {totalIntegrantes} de {minimoIntegrantes} mín. requeridos (
            {montoUtm.toLocaleString('es-CL')} UTM)
          </Badge>
        </div>

        <FieldArray<LicitacionPublicaFormValues>
          name="comisionEvaluadora"
          addLabel="Agregar integrante evaluador"
          emptyState="Designe a quienes evaluarán las ofertas indicando Nombre, RUT, Cargo, Calidad Contractual y Correo."
          defaultItem={() => ({
            nombreCompleto: '',
            run: '',
            cargo: '',
            calidadContractual: 'Planta',
            correo: '',
          })}
          renderSummary={({ index }) => {
            const integrante = comisionWatch?.[index]
            return (
              <span className="text-sm font-medium text-mercury-800">
                {integrante?.nombreCompleto?.trim()
                  ? `${integrante.nombreCompleto} — ${integrante.cargo || 'Sin cargo'} (${integrante.calidadContractual || 'Sin calidad'})`
                  : `Evaluador #${index + 1}`}
              </span>
            )
          }}
          renderDetail={({ index }) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field<LicitacionPublicaFormValues>
                  name={`comisionEvaluadora.${index}.nombreCompleto`}
                  label="Nombre"
                  required
                >
                  <Input placeholder="Ej. Dra. Marcela Soto Valdivia" />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name={`comisionEvaluadora.${index}.run`}
                  label="RUT"
                  required
                >
                  <Input placeholder="Ej. 12.345.678-5" />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field<LicitacionPublicaFormValues>
                  name={`comisionEvaluadora.${index}.cargo`}
                  label="Cargo"
                  required
                >
                  <Input placeholder="Ej. Jefa de CR" />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name={`comisionEvaluadora.${index}.calidadContractual`}
                  label="Calidad Contractual"
                  required
                >
                  <Input placeholder="Ej. Planta / Contrata" />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name={`comisionEvaluadora.${index}.correo`}
                  label="Correo electrónico institucional"
                  required
                >
                  <Input type="email" placeholder="nombre@ulagos.cl" />
                </Field>
              </div>
            </div>
          )}
        />
      </div>

      <div className="space-y-5 border-t border-mercury-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-mercury-900">
              Criterios de Evaluación (Mínimo 2: Económico + Técnico · Suma = 100%)
            </h3>
            <p className="text-xs text-mercury-500">
              Seleccione los criterios aplicables al requerimiento; el puntaje final se expresará
              con dos decimales.
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
            Suma activa: {sumaPonderaciones}% / 100% · Técnicos activos: {tecnicosActivos}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
          <h4 className="text-sm font-semibold text-mercury-900">
            1. Tipo de Criterio: Administrativos
          </h4>

          <div className="grid items-start gap-4 rounded-lg bg-mercury-50 p-3.5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field<LicitacionPublicaFormValues>
                name="criteriosEvaluacion.aplicaRequisitosFormales"
                label="Cumplimiento de Requisitos Formales"
                hideLabel
              >
                <Checkbox
                  label="Incluir Criterio: CUMPLIMIENTO DE REQUISITOS FORMALES (sugerido 5%)"
                  description="100 pts: sin errores u omisiones · 50 pts: cumple por art. 40 inc. 2° Reglamento Ley 19.886 · 0 pts: incompleta o fuera de plazo."
                />
              </Field>
            </div>

            {criteriosWatch?.aplicaRequisitosFormales && (
              <Field<LicitacionPublicaFormValues>
                name="criteriosEvaluacion.ponderacionRequisitosFormales"
                label="Ponderación (%)"
                required
              >
                <NumberInput min={1} max={100} suffix="%" />
              </Field>
            )}
          </div>

          <div className="grid items-start gap-4 rounded-lg bg-mercury-50 p-3.5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field<LicitacionPublicaFormValues>
                name="criteriosEvaluacion.aplicaPactoIntegridad"
                label="Pacto de Integridad"
                hideLabel
              >
                <Checkbox
                  label="Incluir Criterio: PACTO DE INTEGRIDAD (sugerido 2%)"
                  description="100 pts: presenta Anexo N° 04 firmado + Programa de Integridad/Compliance conocido por su personal (Ley 20.393) · 0 pts: no cumple."
                />
              </Field>
            </div>

            {criteriosWatch?.aplicaPactoIntegridad && (
              <Field<LicitacionPublicaFormValues>
                name="criteriosEvaluacion.ponderacionPactoIntegridad"
                label="Ponderación (%)"
                required
              >
                <NumberInput min={1} max={100} suffix="%" />
              </Field>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <h4 className="text-sm font-semibold text-mercury-900">
                2. Tipo de Criterio: Económico — PRECIO (Obligatorio)
              </h4>
              <p className="text-xs text-mercury-500">
                Evalúa con mayor calificación (máximo 100 puntos) a la propuesta que oferte el menor
                precio.
              </p>
            </div>

            <Field<LicitacionPublicaFormValues>
              name="criteriosEvaluacion.ponderacionPrecio"
              label="Ponderación Precio (%)"
              required
            >
              <NumberInput min={1} max={100} suffix="%" />
            </Field>
          </div>

          <Field<LicitacionPublicaFormValues>
            name="criteriosEvaluacion.mecanismoPrecio"
            label="Mecanismo de Asignación de Puntaje para Precio"
            required
          >
            <RadioGroup options={OPCIONES_MECANISMO_PRECIO} />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
          <h4 className="text-sm font-semibold text-mercury-900">
            3. Tipo de Criterio: Técnicos (Seleccionar según sean aplicables a la licitación)
          </h4>

          <div className="space-y-4 rounded-lg border border-mercury-200 bg-mercury-50 p-4">
            <div className="grid items-start gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.aplicaPlazoEntrega"
                  label="Plazo de Entrega"
                  hideLabel
                >
                  <Checkbox
                    label="Seleccionar Criterio Técnico: PLAZO DE ENTREGA"
                    description="Se declararán inadmisibles ofertas que no presenten plazo, indiquen rangos o superen el máximo de días."
                  />
                </Field>
              </div>

              {criteriosWatch?.aplicaPlazoEntrega && (
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.ponderacionPlazoEntrega"
                  label="Ponderación Plazo (%)"
                  required
                >
                  <NumberInput min={1} max={100} suffix="%" />
                </Field>
              )}
            </div>

            {criteriosWatch?.aplicaPlazoEntrega && (
              <div className="space-y-4 border-t border-mercury-200 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name="criteriosEvaluacion.tipoDiasPlazoEntrega"
                    label="Tipo de cómputo de días"
                    required
                  >
                    <Combobox options={OPCIONES_TIPO_DIAS} />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name="criteriosEvaluacion.plazoMaximoEntregaDias"
                    label="No debe sobrepasar como máximo (días)"
                    required
                  >
                    <NumberInput min={1} suffix="días máx." />
                  </Field>
                </div>

                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.mecanismoPlazoEntrega"
                  label="Mecanismo de evaluación del Plazo de Entrega"
                  required
                >
                  <RadioGroup options={OPCIONES_MECANISMO_PLAZO_ENTREGA} />
                </Field>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-mercury-200 bg-mercury-50 p-4">
            <div className="grid items-start gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.aplicaExperiencia"
                  label="Experiencia"
                  hideLabel
                >
                  <Checkbox
                    label="Seleccionar Criterio Técnico: EXPERIENCIA"
                    description="Evalúa experiencia en trabajos o servicios similares acreditada con Anexo Experiencia firmado y respaldos."
                  />
                </Field>
              </div>

              {criteriosWatch?.aplicaExperiencia && (
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.ponderacionExperiencia"
                  label="Ponderación Experiencia (%)"
                  required
                >
                  <NumberInput min={1} max={100} suffix="%" />
                </Field>
              )}
            </div>

            {criteriosWatch?.aplicaExperiencia && (
              <div className="space-y-4 border-t border-mercury-200 pt-3">
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.especificacionRubroExperiencia"
                  label="Especificar el tipo o rubro de experiencia solicitada"
                  required
                >
                  <Input placeholder="Ej. Suministro e instalación de equipamiento científico en instituciones de educación superior" />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.modoMedicionExperiencia"
                  label="Modalidad de medición de la experiencia"
                  required
                >
                  <RadioGroup options={OPCIONES_MODO_EXPERIENCIA} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field<LicitacionPublicaFormValues>
                    name="criteriosEvaluacion.rangoMaximoExperiencia"
                    label="Tramo 100 Puntos"
                    required
                  >
                    <Input placeholder="Ej. Más de 5 servicios/años" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name="criteriosEvaluacion.rangoMedioExperiencia"
                    label="Tramo 50 Puntos"
                    required
                  >
                    <Input placeholder="Ej. Entre 3 y 5 servicios/años" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name="criteriosEvaluacion.rangoMinimoExperiencia"
                    label="Tramo 20 Puntos"
                    required
                  >
                    <Input placeholder="Ej. Entre 1 y 2 servicios/años" />
                  </Field>
                </div>

                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.documentosRespaldoExperiencia"
                  label="Documentos exigidos para respaldar efectivamente la experiencia"
                  required
                >
                  <Input placeholder="Ej. Certificados de recepción conforme, contratos ejecutados u órdenes de compra" />
                </Field>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-mercury-200 bg-mercury-50 p-4">
            <div className="grid items-start gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.aplicaPlazoGarantia"
                  label="Plazo de Garantía"
                  hideLabel
                >
                  <Checkbox
                    label="Seleccionar Criterio Técnico: PLAZO DE GARANTÍA"
                    description="El plazo de Garantía Legal de 6 meses comienza desde la Recepción Conforme (inadmisibles ofertas inferiores a 6 meses)."
                  />
                </Field>
              </div>

              {criteriosWatch?.aplicaPlazoGarantia && (
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.ponderacionPlazoGarantia"
                  label="Ponderación Garantía (%)"
                  required
                >
                  <NumberInput min={1} max={100} suffix="%" />
                </Field>
              )}
            </div>

            {criteriosWatch?.aplicaPlazoGarantia && (
              <div className="border-t border-mercury-200 pt-3">
                <Field<LicitacionPublicaFormValues>
                  name="criteriosEvaluacion.mecanismoPlazoGarantia"
                  label="Mecanismo de evaluación del Plazo de Garantía"
                  required
                >
                  <RadioGroup options={OPCIONES_MECANISMO_GARANTIA} />
                </Field>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-mercury-600">
              Otros Criterios Técnicos Adicionales (Según formato oficial)
            </h5>
            <FieldArray<LicitacionPublicaFormValues>
              name="criteriosEvaluacion.otrosCriterios"
              addLabel="Agregar otro criterio de evaluación"
              emptyState="Sin criterios adicionales personalizados."
              defaultItem={() => ({
                nombre: '',
                ponderacion: 10,
                mecanismoAsignacion: '',
              })}
              renderSummary={({ index }) => {
                const crit = criteriosWatch?.otrosCriterios?.[index]
                return (
                  <span className="text-sm font-medium text-mercury-800">
                    {crit?.nombre?.trim()
                      ? `${crit.nombre} (${crit.ponderacion ?? 0}%)`
                      : `Criterio adicional #${index + 1}`}
                  </span>
                )
              }}
              renderDetail={({ index }) => (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Field<LicitacionPublicaFormValues>
                        name={`criteriosEvaluacion.otrosCriterios.${index}.nombre`}
                        label="Nombre Criterio"
                        required
                      >
                        <Input placeholder="Ej. Servicio técnico regional o sustentabilidad" />
                      </Field>
                    </div>

                    <Field<LicitacionPublicaFormValues>
                      name={`criteriosEvaluacion.otrosCriterios.${index}.ponderacion`}
                      label="Ponderación del puntaje final (%)"
                      required
                    >
                      <NumberInput min={1} max={100} suffix="%" />
                    </Field>
                  </div>

                  <Field<LicitacionPublicaFormValues>
                    name={`criteriosEvaluacion.otrosCriterios.${index}.mecanismoAsignacion`}
                    label="Mecanismo de Asignación de Puntaje"
                    required
                  >
                    <TextArea
                      rows={2}
                      placeholder="Describa la escala de 0 a 100 puntos y condiciones de evaluación..."
                    />
                  </Field>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
