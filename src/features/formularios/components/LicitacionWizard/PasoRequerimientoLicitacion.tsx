import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { DatePicker } from '@/components/ui/DatePicker'
import { FieldArray } from '@/components/ui/FieldArray'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { LicitacionPublicaFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  OPCIONES_CATEGORIA_LICITACION,
  OPCIONES_FORMALIZACION_LICITACION,
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
  const productosWatch = useWatch({ control, name: 'productos' })
  const serviciosWatch = useWatch({ control, name: 'servicios' })
  const bibliografiaWatch = useWatch({ control, name: 'bibliografia' })

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
      <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-mercury-900">
              Formalización según Umbral en UTM ({montoUtm.toLocaleString('es-CL')} UTM)
            </p>
            <p className="text-xs text-mercury-600">
              {tramoUtm === 'menor_100' &&
                'Tramo menor a 100 UTM: Se formaliza exclusivamente mediante Orden de Compra aceptada.'}
              {tramoUtm === 'entre_100_y_1000' &&
                'Tramo entre 100 y 1.000 UTM: La unidad solicitante define si requiere solo OC o Contrato + OC.'}
              {tramoUtm === 'mayor_1000' &&
                'Tramo mayor a 1.000 UTM: Es obligatorio formalizar mediante Contrato y Orden de Compra aceptada.'}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <Field<LicitacionPublicaFormValues>
            name="formalizacion"
            label="Mecanismo de formalización"
            required
          >
            <RadioGroup options={opcionesFormalizacion} />
          </Field>
        </div>
      </div>

      <Field<LicitacionPublicaFormValues>
        name="categoriaRequerimiento"
        label="Estructura del Requerimiento a Licitar"
        description="Seleccione la naturaleza principal de los ítems incluidos en esta licitación."
        required
      >
        <RadioGroup options={OPCIONES_CATEGORIA_LICITACION} />
      </Field>

      {categoria === 'productos' && (
        <div className="space-y-3 border-t border-mercury-200 pt-4">
          <h4 className="text-sm font-semibold text-mercury-900">
            Detalle de Productos Solicitados
          </h4>
          <FieldArray<LicitacionPublicaFormValues>
            name="productos"
            addLabel="Agregar producto"
            emptyState="Agregue al menos un producto detallando unidad de medida, materialidad y garantía."
            defaultItem={() => ({
              descripcion: '',
              cantidad: 1,
              unidadMedida: 'Unidad',
              materialidad: '',
              permiteEquivalentes: true,
              mesesGarantia: 12,
              requiereInstalacion: false,
            })}
            renderSummary={({ index }) => {
              const item = productosWatch?.[index]
              return (
                <span className="text-sm font-medium text-mercury-800">
                  {item?.descripcion?.trim()
                    ? `${item.descripcion} (${item.cantidad ?? 0} ${item.unidadMedida || 'unid.'})`
                    : `Producto #${index + 1}`}
                </span>
              )
            }}
            renderDetail={({ index }) => (
              <div className="space-y-4">
                <Field<LicitacionPublicaFormValues>
                  name={`productos.${index}.descripcion`}
                  label="Descripción técnica del producto"
                  required
                >
                  <Input placeholder="Ej. Microscopio binocular óptico LED" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field<LicitacionPublicaFormValues>
                    name={`productos.${index}.cantidad`}
                    label="Cantidad"
                    required
                  >
                    <NumberInput min={1} />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`productos.${index}.unidadMedida`}
                    label="Unidad de medida"
                    required
                  >
                    <Input placeholder="Ej. Unidad, Caja, Kit" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`productos.${index}.mesesGarantia`}
                    label="Garantía exigida (meses)"
                    required
                  >
                    <NumberInput min={0} suffix="meses" />
                  </Field>
                </div>

                <Field<LicitacionPublicaFormValues>
                  name={`productos.${index}.materialidad`}
                  label="Materialidad y especificaciones de fabricación"
                  required
                >
                  <Input placeholder="Ej. Acero inoxidable AISI 316 y óptica tratada" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`productos.${index}.permiteEquivalentes`}
                    label="Equivalencias técnicas"
                    hideLabel
                  >
                    <Checkbox
                      label="Acepta productos equivalentes"
                      description="Permite ofertar bienes de igual o superior estándar técnico."
                    />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`productos.${index}.requiereInstalacion`}
                    label="Instalación y puesta en marcha"
                    hideLabel
                  >
                    <Checkbox
                      label="Requiere instalación en dependencias ULagos"
                      description="El adjudicatario debe incluir montaje y habilitación."
                    />
                  </Field>
                </div>
              </div>
            )}
          />
        </div>
      )}

      {categoria === 'servicios' && (
        <div className="space-y-3 border-t border-mercury-200 pt-4">
          <h4 className="text-sm font-semibold text-mercury-900">
            Detalle de Servicios a Contratar
          </h4>
          <FieldArray<LicitacionPublicaFormValues>
            name="servicios"
            addLabel="Agregar servicio"
            emptyState="Agregue al menos un servicio especificando metodología, fechas, hitos y normativas."
            defaultItem={() => ({
              nombreServicio: '',
              metodologiaExigida: '',
              hitosPrincipales: '',
              fechaInicioEstimada: new Date(),
              fechaTerminoEstimada: new Date(),
              normativasAplicables: '',
            })}
            renderSummary={({ index }) => {
              const item = serviciosWatch?.[index]
              return (
                <span className="text-sm font-medium text-mercury-800">
                  {item?.nombreServicio?.trim() || `Servicio #${index + 1}`}
                </span>
              )
            }}
            renderDetail={({ index }) => (
              <div className="space-y-4">
                <Field<LicitacionPublicaFormValues>
                  name={`servicios.${index}.nombreServicio`}
                  label="Nombre del servicio"
                  required
                >
                  <Input placeholder="Ej. Servicio de mantención preventiva de calderas" />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name={`servicios.${index}.metodologiaExigida`}
                  label="Metodología de trabajo exigida"
                  required
                >
                  <TextArea rows={3} placeholder="Describa la metodología y plan de trabajo..." />
                </Field>

                <Field<LicitacionPublicaFormValues>
                  name={`servicios.${index}.hitosPrincipales`}
                  label="Hitos y entregables verificables"
                  required
                >
                  <TextArea rows={2} placeholder="Ej. Hito 1: Diagnóstico; Hito 2: Informe final" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`servicios.${index}.fechaInicioEstimada`}
                    label="Fecha estimada de inicio"
                    required
                  >
                    <DatePicker />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`servicios.${index}.fechaTerminoEstimada`}
                    label="Fecha estimada de término"
                    required
                  >
                    <DatePicker />
                  </Field>
                </div>

                <Field<LicitacionPublicaFormValues>
                  name={`servicios.${index}.normativasAplicables`}
                  label="Normativas técnicas o legales aplicables"
                  required
                >
                  <Input placeholder="Ej. NCh 2728, DS N° 594 Minsal" />
                </Field>
              </div>
            )}
          />
        </div>
      )}

      {categoria === 'bibliografia' && (
        <div className="space-y-3 border-t border-mercury-200 pt-4">
          <h4 className="text-sm font-semibold text-mercury-900">
            Detalle de Material Bibliográfico
          </h4>
          <FieldArray<LicitacionPublicaFormValues>
            name="bibliografia"
            addLabel="Agregar título bibliográfico"
            emptyState="Agregue al menos un título con ISBN/ISSN, autor, editorial y visación de Biblioteca."
            defaultItem={() => ({
              titulo: '',
              autor: '',
              editorial: '',
              isbnIssn: '',
              edicionAnio: 2026,
              cantidadEjemplares: 5,
              visadoDireccionBiblioteca: true,
            })}
            renderSummary={({ index }) => {
              const item = bibliografiaWatch?.[index]
              return (
                <span className="text-sm font-medium text-mercury-800">
                  {item?.titulo?.trim()
                    ? `${item.titulo} — ${item.autor || 'Sin autor'} (${item.cantidadEjemplares ?? 0} ej.)`
                    : `Título bibliográfico #${index + 1}`}
                </span>
              )
            }}
            renderDetail={({ index }) => (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.titulo`}
                    label="Título de la obra"
                    required
                  >
                    <Input placeholder="Ej. Principios de Medicina Interna" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.autor`}
                    label="Autor(es)"
                    required
                  >
                    <Input placeholder="Ej. Joseph Loscalzo et al." />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <Field<LicitacionPublicaFormValues>
                      name={`bibliografia.${index}.editorial`}
                      label="Editorial"
                      required
                    >
                      <Input placeholder="Ej. McGraw-Hill" />
                    </Field>
                  </div>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.isbnIssn`}
                    label="ISBN / ISSN"
                    required
                  >
                    <Input placeholder="978-1-264-26850-4" />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.edicionAnio`}
                    label="Año edición"
                    required
                  >
                    <NumberInput
                      min={1900}
                      max={2100}
                      thousandSeparator={false}
                      showStepper={false}
                    />
                  </Field>
                </div>

                <div className="grid items-center gap-4 sm:grid-cols-2">
                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.cantidadEjemplares`}
                    label="Cantidad de ejemplares"
                    required
                  >
                    <NumberInput min={1} />
                  </Field>

                  <Field<LicitacionPublicaFormValues>
                    name={`bibliografia.${index}.visadoDireccionBiblioteca`}
                    label="Visación Dirección de Biblioteca"
                    hideLabel
                  >
                    <Checkbox
                      label="Validado por la Dirección de Biblioteca"
                      description="Obligatorio para adquisiciones de material bibliográfico."
                    />
                  </Field>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
