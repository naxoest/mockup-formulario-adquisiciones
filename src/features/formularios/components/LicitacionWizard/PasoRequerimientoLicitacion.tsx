import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { Combobox } from '@/components/ui/Combobox'
import { FieldArray } from '@/components/ui/FieldArray'
import { FileUpload } from '@/components/ui/FileUpload'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { LicitacionPublicaFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  OPCIONES_CATEGORIA_LICITACION,
  OPCIONES_DIRECCION_DESPACHO,
  OPCIONES_DURACION_CONTRATO,
  OPCIONES_ENTREGA_PARCIALIZADA,
  OPCIONES_FORMALIZACION_LICITACION,
  OPCIONES_FORMA_PAGO_LICITACION,
  OPCIONES_TOPE_CONTRATO,
} from '@/features/formularios/utils/catalogosFormulario'
import {
  calcularMontoUtm,
  obtenerFormalizacionForzada,
  obtenerTramoUtm,
} from '@/features/formularios/utils/reglasLicitacion'

export function PasoRequerimientoLicitacion() {
  const { control, setValue } = useFormContext<LicitacionPublicaFormValues>()
  const montoClp = useWatch({ control, name: 'montoEstimadoClp' })
  const categoria = useWatch({ control, name: 'categoriaRequerimiento' })
  const formalizacion = useWatch({ control, name: 'formalizacion' })
  const modalidadDuracion = useWatch({ control, name: 'modalidadDuracionContrato' })
  const direccionCodigo = useWatch({ control, name: 'direccionDespachoCodigo' })
  const formaPago = useWatch({ control, name: 'modalidadFormaPago' })
  const productosWatch = useWatch({ control, name: 'productos' })
  const bibliografiaWatch = useWatch({ control, name: 'bibliografia' })
  const incumplimientosWatch = useWatch({ control, name: 'otrosIncumplimientos' })

  const montoUtm = calcularMontoUtm(montoClp)
  const tramoUtm = obtenerTramoUtm(montoUtm)
  const formalizacionForzada = obtenerFormalizacionForzada(montoUtm)

  useEffect(() => {
    if (formalizacionForzada !== null) {
      setValue('formalizacion', formalizacionForzada, { shouldValidate: true })
    }
  }, [formalizacionForzada, setValue])

  const opcionesFormalizacion = OPCIONES_FORMALIZACION_LICITACION.map((opcion) => ({
    ...opcion,
    disabled: formalizacionForzada !== null && opcion.value !== formalizacionForzada,
  }))

  return (
    <div className="space-y-6">
      <Field<LicitacionPublicaFormValues>
        name="categoriaRequerimiento"
        label="I. Descripción del Producto o Servicio Requerido"
        description="Nota oficial: Usar la opción que corresponda (Productos, Servicios o Bibliografía)."
        required
      >
        <RadioGroup options={OPCIONES_CATEGORIA_LICITACION} />
      </Field>

      {categoria === 'productos' && (
        <div className="space-y-4 border-t border-mercury-200 pt-4">
          <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-3 text-xs text-saffron-900">
            Cuando las ofertas no señalen descripción técnica de los productos o no cumplan con la
            totalidad de los requerimientos de las bases técnicas, la oferta será considerada
            inadmisible.
          </div>

          <FieldArray<LicitacionPublicaFormValues>
            name="productos"
            addLabel="Agregar ítem de producto"
            emptyState="Agregue al menos un ítem indicando cantidad, especificaciones técnicas y garantía."
            defaultItem={() => ({
              cantidad: 1,
              especificacionesTecnicas: '',
              imagenReferencia: [],
              requiereGarantia: true,
              mesesGarantia: 12,
            })}
            renderSummary={({ index }) => {
              const item = productosWatch?.[index]
              const resumen = item?.especificacionesTecnicas?.trim()
              return (
                <span className="text-sm font-medium text-mercury-800">
                  Ítem #{index + 1} ({item?.cantidad ?? 0} unid.)
                  {resumen ? ` — ${resumen.slice(0, 60)}${resumen.length > 60 ? '...' : ''}` : ''}
                </span>
              )
            }}
            renderDetail={({ index }) => {
              const requiereGarantiaItem = productosWatch?.[index]?.requiereGarantia ?? true
              return (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Field<LicitacionPublicaFormValues>
                      name={`productos.${index}.cantidad`}
                      label="Cantidad"
                      required
                    >
                      <NumberInput min={1} />
                    </Field>

                    <div className="sm:col-span-3">
                      <Field<LicitacionPublicaFormValues>
                        name={`productos.${index}.especificacionesTecnicas`}
                        label="Características / Especificaciones Técnicas"
                        description="Incluir: Unidad de medida (litro, kilos, caja, unidad, etc.), materialidad, medidas, necesidad de instalación, capacitación y puesta en marcha, equivalencias."
                        required
                      >
                        <TextArea
                          rows={3}
                          placeholder="Detalle unidad de medida, materialidad, dimensiones, instalación/capacitación y equivalencia técnica..."
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid items-start gap-4 sm:grid-cols-2">
                    <div className="space-y-3 rounded-xl border border-mercury-200 bg-mercury-50 p-3.5">
                      <Field<LicitacionPublicaFormValues>
                        name={`productos.${index}.requiereGarantia`}
                        label="Garantía del bien"
                        hideLabel
                      >
                        <Checkbox
                          label="Exigir garantía del bien o servicio (desmarcar si NO requiere garantía)"
                          description="Si requiere garantía, indique el plazo en meses (mínimo legal 6 meses)."
                        />
                      </Field>

                      {requiereGarantiaItem && (
                        <Field<LicitacionPublicaFormValues>
                          name={`productos.${index}.mesesGarantia`}
                          label="Plazo de garantía exigido (meses)"
                          required
                        >
                          <NumberInput min={6} suffix="meses" />
                        </Field>
                      )}
                    </div>

                    <Field<LicitacionPublicaFormValues>
                      name={`productos.${index}.imagenReferencia`}
                      label="Imagen de referencia (solo cuando lo estime necesario)"
                      optional
                    >
                      <FileUpload categories={['image', 'document']} maxFiles={1} />
                    </Field>
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}

      {categoria === 'servicios' && (
        <div className="space-y-4 border-t border-mercury-200 pt-4">
          <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-3 text-xs text-saffron-900">
            Los oferentes deben cumplir con la totalidad de los requerimientos aquí descritos; de lo
            contrario, su oferta no será sometida a evaluación y quedará fuera de bases.
          </div>

          <Field<LicitacionPublicaFormValues>
            name="especificacionesTecnicasServicio"
            label="Especificaciones Técnicas del Servicio Requerido"
            description="Detallar claramente características del servicio, incluyendo fechas, metodología, condiciones para realizarlos, cumplimiento de reglamentación, hitos a cumplir, entre otros."
            required
          >
            <TextArea
              rows={6}
              placeholder="Describa en detalle el alcance del servicio, fechas, metodología de trabajo, normativas y entregables..."
            />
          </Field>
        </div>
      )}

      {categoria === 'bibliografia' && (
        <div className="space-y-4 border-t border-mercury-200 pt-4">
          <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-3 text-xs text-saffron-900">
            <p>
              <strong>Nota 1:</strong> Toda la bibliografía debe ser recepcionada en Biblioteca.
              Cuando las ofertas no cumplan con el ISBN y/o ISSN indicado, serán inadmisibles.
            </p>
            <p className="mt-1">
              <strong>Nota 2:</strong> En la evaluación debe participar la Dirección de Biblioteca y
              Dirección de Docencia (o quien corresponda en Campus y Sedes), además del Jefe de CR.
            </p>
          </div>

          <Field<LicitacionPublicaFormValues>
            name="planillaValidacionBiblioteca"
            label="Planilla de validación de la Dirección de Biblioteca"
            description="Adjunte el documento de visación emitido por la Dirección de Biblioteca o encargado de Campus/Sede."
            required
          >
            <FileUpload categories={['document']} maxFiles={1} />
          </Field>

          <FieldArray<LicitacionPublicaFormValues>
            name="bibliografia"
            addLabel="Agregar ítem bibliográfico"
            emptyState="Agregue los títulos requeridos detallando autor, editorial, N° edición, idioma, ISBN/ISSN y cantidad."
            defaultItem={() => ({
              titulo: '',
              autor: '',
              editorial: '',
              numeroEdicion: '',
              idioma: 'Español',
              isbnIssn: '',
              cantidad: 1,
            })}
            renderSummary={({ index }) => {
              const item = bibliografiaWatch?.[index]
              return (
                <span className="text-sm font-medium text-mercury-800">
                  {item?.titulo?.trim()
                    ? `${item.titulo} — ${item.autor || 'Sin autor'} (${item.cantidad ?? 0} ej.)`
                    : `Ítem bibliográfico #${index + 1}`}
                </span>
              )
            }}
            renderDetail={({ index }) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.titulo`}
                    label="Título"
                    required
                  >
                    <Input placeholder="Ej. Principios de Medicina Interna de Harrison" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.autor`}
                    label="Autor"
                    required
                  >
                    <Input placeholder="Ej. Joseph Loscalzo et al." />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.editorial`}
                    label="Editorial"
                    required
                  >
                    <Input placeholder="Ej. McGraw-Hill" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.numeroEdicion`}
                    label="N° Edición"
                    required
                  >
                    <Input placeholder="Ej. 21ª Edición (2024)" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.idioma`}
                    label="Idioma"
                    required
                  >
                    <Input placeholder="Ej. Español / Inglés" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.isbnIssn`}
                    label="ISBN o ISSN según corresponda"
                    required
                  >
                    <Input placeholder="Ej. 978-1-264-26850-4" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.cantidad`}
                    label="Cantidad"
                    required
                  >
                    <NumberInput min={1} />
                  </Field>
                </div>
              </div>
            )}
          />
        </div>
      )}

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <p className="text-sm font-semibold text-mercury-900">
            Formalización ({montoUtm.toLocaleString('es-CL')} UTM)
          </p>
          <p className="mb-3 text-xs text-mercury-600">
            {tramoUtm === 'menor_100' &&
              'Menor a 100 UTM: Siempre se formalizará solo con OC aceptada.'}
            {tramoUtm === 'entre_100_y_1000' &&
              'Mayor a 100 y menor a 1.000 UTM: Indique explícitamente si será solo OC aceptada o con Contrato y OC aceptada.'}
            {tramoUtm === 'mayor_1000' &&
              'Mayor a 1.000 UTM: Es obligación formalizar con Contrato y OC aceptada (Opción 2).'}
          </p>

          <Field<LicitacionPublicaFormValues>
            name="formalizacion"
            label="Opción de Formalización"
            required
          >
            <RadioGroup options={opcionesFormalizacion} />
          </Field>
        </div>

        {formalizacion === 'contrato_y_oc' && (
          <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
            <Field<LicitacionPublicaFormValues>
              name="modalidadDuracionContrato"
              label="Tiempo y Duración del Contrato (solo cuando aplica contrato)"
              required
            >
              <RadioGroup options={OPCIONES_DURACION_CONTRATO} />
            </Field>

            {modalidadDuracion === 'meses_fijos' && (
              <Field<LicitacionPublicaFormValues>
                name="duracionContratoMeses"
                label="Periodo de duración del contrato (meses)"
                description="Se iniciará una vez totalmente tramitado el Decreto Universitario que apruebe el contrato."
                required
              >
                <NumberInput min={1} suffix="meses" />
              </Field>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <Field<LicitacionPublicaFormValues>
          name="direccionDespachoCodigo"
          label="Dirección de despacho o entrega del servicio"
          required
        >
          <Combobox
            options={OPCIONES_DIRECCION_DESPACHO}
            placeholder="Seleccione dirección de despacho"
          />
        </Field>

        {direccionCodigo === 'otra' && (
          <Field<LicitacionPublicaFormValues>
            name="direccionDespachoOtra"
            label="Indicar dirección de despacho"
            required
          >
            <Input placeholder="Especifique calle, número, dependencia y ciudad" />
          </Field>
        )}
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h4 className="text-sm font-semibold text-mercury-900">
            Multas y/o Sanciones por Incumplimiento
          </h4>
          <p className="text-xs text-mercury-500">
            Multa por cada día hábil de atraso sobre el valor neto de las cantidades atrasadas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<LicitacionPublicaFormValues>
            name="disposiciones.porcentajeMultaDiaria"
            label="Porcentaje diario por día hábil de atraso (%)"
            description="Estándar oficial: 0,5% del valor neto atrasado."
            required
          >
            <NumberInput min={0.1} max={5} step={0.1} decimals={1} suffix="%" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="disposiciones.topeDiasMulta"
            label="Tope de días hábiles de atraso"
            description="Estándar oficial: 20 días hábiles."
            required
          >
            <NumberInput min={1} max={60} suffix="días hábiles" />
          </Field>
        </div>

        <Field<LicitacionPublicaFormValues>
          name="disposiciones.topePorcentajeContrato"
          label="Tope máximo acumulado de multas sobre el contrato"
          required
        >
          <RadioGroup options={OPCIONES_TOPE_CONTRATO} />
        </Field>

        <FieldArray<LicitacionPublicaFormValues>
          name="otrosIncumplimientos"
          addLabel="Agregar otro incumplimiento o nivel de servicio"
          emptyState="Sin multas adicionales por niveles de servicio (opcional)."
          defaultItem={() => ({
            tipoIncumplimiento: '',
            sancionAplicar: '',
          })}
          renderSummary={({ index }) => {
            const item = incumplimientosWatch?.[index]
            return (
              <span className="text-sm font-medium text-mercury-800">
                {item?.tipoIncumplimiento?.trim() || `Incumplimiento adicional #${index + 1}`}
              </span>
            )
          }}
          renderDetail={({ index }) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field<LicitacionPublicaFormValues>
                name={`otrosIncumplimientos.${index}.tipoIncumplimiento`}
                label="Tipo de Incumplimiento (ej. tiempo de respuesta, incidentes)"
                required
              >
                <Input placeholder="Ej. Incumplimiento en tiempo de respuesta de soporte" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name={`otrosIncumplimientos.${index}.sancionAplicar`}
                label="Sanción a aplicar"
                required
              >
                <Input placeholder="Ej. 1 UTM por evento o día hábil de retraso" />
              </Field>
            </div>
          )}
        />
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <Field<LicitacionPublicaFormValues>
          name="modalidadFormaPago"
          label="Forma de Pago (visado por Jefe de Centro de Responsabilidad)"
          required
        >
          <RadioGroup options={OPCIONES_FORMA_PAGO_LICITACION} />
        </Field>

        {formaPago === 'entrega_parcializada' && (
          <div className="grid gap-4 rounded-xl border border-mercury-200 bg-mercury-50 p-4 sm:grid-cols-2">
            <Field<LicitacionPublicaFormValues>
              name="tipoEntregaParcializada"
              label="Modalidad de entrega parcializada"
              required
            >
              <Combobox options={OPCIONES_ENTREGA_PARCIALIZADA} />
            </Field>

            <Field<LicitacionPublicaFormValues>
              name="detalleEntregaParcializada"
              label="Especificación adicional de parcialidades"
              optional
            >
              <Input placeholder="Ej. Estados de pago mensuales contra informe visado" />
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}
