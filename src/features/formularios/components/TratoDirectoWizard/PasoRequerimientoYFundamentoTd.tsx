import { useFormContext, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { FieldArray } from '@/components/ui/FieldArray'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { TratoDirectoFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  OPCIONES_CAMPUS_SEDE,
  OPCIONES_CAUSAL_TRATO_DIRECTO,
  OPCIONES_CONVENIO_MARCO_TRATO_DIRECTO,
  OPCIONES_TIPO_SOLICITUD_EDELFOS,
} from '@/features/formularios/utils/catalogosFormulario'

export function PasoRequerimientoYFundamentoTd() {
  const { control } = useFormContext<TratoDirectoFormValues>()
  const itemsWatch = useWatch({ control, name: 'itemsRequeridos' })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            Encabezado — Formulario de Adquisición por Trato o Contratación Directa (v.4)
          </h3>
          <p className="text-xs text-mercury-500">
            Ciudad/Campus, fecha, clasificación y folio de solicitud E-delfos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TratoDirectoFormValues> name="campusSede" label="Campus / Sede" required>
            <Combobox options={OPCIONES_CAMPUS_SEDE} placeholder="Seleccione Campus o Sede" />
          </Field>

          <Field<TratoDirectoFormValues>
            name="fechaFormulario"
            label="Fecha del formulario"
            required
          >
            <DatePicker />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TratoDirectoFormValues>
            name="tipoSolicitud"
            label="Clasificación de Solicitud"
            required
          >
            <Combobox
              options={OPCIONES_TIPO_SOLICITUD_EDELFOS}
              placeholder="Seleccione clasificación"
            />
          </Field>

          <Field<TratoDirectoFormValues>
            name="codigoEdelfos"
            label="Folio de Solicitud (ej. SASERVI N° 80448)"
            required
          >
            <Input placeholder="Ej. SASERVI N° 80448" />
          </Field>
        </div>

        <Field<TratoDirectoFormValues>
          name="titulo"
          label="Nombre del producto o servicio requerido"
          required
        >
          <Input placeholder="Ej. Renovación Suscripción Digital Diario El Mercurio" />
        </Field>
      </div>

      <div className="space-y-3 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            1. La unidad que suscribe requiere:
          </h3>
          <p className="text-xs text-mercury-500">
            Detallar claramente las características del bien y/o servicio requerido (materialidad,
            medidas, instalación/capacitación, o condiciones, reglamentación e hitos en caso de
            servicios).
          </p>
        </div>

        <FieldArray<TratoDirectoFormValues>
          name="itemsRequeridos"
          addLabel="Agregar línea a la tabla de requerimiento"
          emptyState="Agregue al menos un ítem indicando cantidad y descripción detallada."
          defaultItem={() => ({
            cantidad: 1,
            descripcionDetallada: '',
          })}
          renderSummary={({ index }) => {
            const item = itemsWatch?.[index]
            return (
              <span className="text-sm font-medium text-mercury-800">
                CANT. {item?.cantidad ?? 1} —{' '}
                {item?.descripcionDetallada?.trim() || `Ítem requerido #${index + 1}`}
              </span>
            )
          }}
          renderDetail={({ index }) => (
            <div className="grid gap-4 sm:grid-cols-4">
              <Field<TratoDirectoFormValues>
                name={`itemsRequeridos.${index}.cantidad`}
                label="CANT."
                required
              >
                <NumberInput min={1} />
              </Field>

              <div className="sm:col-span-3">
                <Field<TratoDirectoFormValues>
                  name={`itemsRequeridos.${index}.descripcionDetallada`}
                  label="DESCRIPCIÓN DETALLADA DE LO REQUERIDO"
                  required
                >
                  <TextArea
                    rows={2}
                    placeholder="Ej. Renovación Suscripción Digital Diario El Mercurio por 1 año"
                  />
                </Field>
              </div>
            </div>
          )}
        />
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <Field<TratoDirectoFormValues>
          name="situacionConvenioMarco"
          label="2. En el catálogo de convenio marco actualmente vigente en el sistema de información a cargo de la Dirección de Compras y Contratación Pública:"
          required
        >
          <RadioGroup options={OPCIONES_CONVENIO_MARCO_TRATO_DIRECTO} />
        </Field>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <Field<TratoDirectoFormValues>
          name="causal"
          label="3. Causal del Artículo 71 del Reglamento de la Ley de Compras N° 19.886:"
          description="El Artículo 71 autoriza con carácter excepcional el Trato o Contratación Directa en la causal seleccionada."
          required
        >
          <Combobox
            options={OPCIONES_CAUSAL_TRATO_DIRECTO}
            placeholder="Seleccionar causal de contratación directa"
          />
        </Field>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            4. La presente solicitud se fundamenta en:
          </h3>
        </div>

        <Field<TratoDirectoFormValues>
          name="objetivoImportancia"
          label="a) Objetivo e importancia de la compra"
          description="Señale el objeto, motivo e importancia de la compra; en el caso de Proyectos indicar la relevancia para la ejecución del proyecto."
          required
        >
          <TextArea
            rows={4}
            placeholder="Describa el impacto académico, estudiantil, de investigación o institucional..."
          />
        </Field>

        <Field<TratoDirectoFormValues>
          name="motivosEleccionProveedor"
          label="b) Motivos que argumentan elección del(los) proveedor(es)"
          description="Indique los motivos técnicos, de cobertura o exclusividad que argumentan la elección del proveedor."
          required
        >
          <TextArea
            rows={3}
            placeholder="Fundamente por qué se eligió a este proveedor específico..."
          />
        </Field>

        <Field<TratoDirectoFormValues>
          name="justificacionCausalEscogida"
          label="c) Justificación de la causal de contratación directa escogida"
          description="Cualquiera sea la causal que se invoque, no basta la sola referencia a disposiciones legales; se requiere la demostración efectiva y documentada de los motivos que justifican por qué no es posible licitar."
          required
        >
          <TextArea
            rows={4}
            placeholder="Ej. Análisis de costos de proceso competitivo (81,66 UTM) frente al valor de la compra e informe adjunto..."
          />
        </Field>
      </div>
    </div>
  )
}
