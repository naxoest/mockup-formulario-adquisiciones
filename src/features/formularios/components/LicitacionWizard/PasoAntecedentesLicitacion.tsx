import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { Combobox } from '@/components/ui/Combobox'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { TextArea } from '@/components/ui/TextArea'
import type { LicitacionPublicaFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import {
  OPCIONES_CAMPUS_SEDE,
  OPCIONES_FORMATO_VISITA,
  OPCIONES_TIPO_PRESUPUESTO,
  OPCIONES_TIPO_SOLICITUD_EDELFOS,
  OPCIONES_VISITA_TERRENO,
} from '@/features/formularios/utils/catalogosFormulario'
import {
  UMBRAL_GARANTIA_SERIEDAD_UTM,
  VALOR_UTM_REFERENCIA_CLP,
  calcularMaximoGarantiaSeriedadClp,
  calcularMontoUtm,
} from '@/features/formularios/utils/reglasLicitacion'
import { formatCLP } from '@/utils/currency'

export function PasoAntecedentesLicitacion() {
  const { control, setValue } = useFormContext<LicitacionPublicaFormValues>()

  const montoClp = useWatch({ control, name: 'montoEstimadoClp' })
  const mismoJefeCr = useWatch({ control, name: 'antecedentes.coordinadorEsMismoJefeCr' })
  const jefeCrNombre = useWatch({ control, name: 'antecedentes.jefeCrNombre' })
  const jefeCrCargo = useWatch({ control, name: 'antecedentes.jefeCrCargo' })
  const tipoPresupuesto = useWatch({ control, name: 'antecedentes.tipoPresupuesto' })
  const requiereGarantiaSeriedad = useWatch({
    control,
    name: 'antecedentes.requiereGarantiaSeriedad',
  })
  const visitaTerreno = useWatch({ control, name: 'antecedentes.visitaTerreno' })
  const visitaFormato = useWatch({ control, name: 'antecedentes.visitaFormato' })

  const montoUtm = calcularMontoUtm(montoClp)
  const topeGarantiaClp = calcularMaximoGarantiaSeriedadClp(montoClp)

  useEffect(() => {
    if (mismoJefeCr) {
      setValue('coordinador.nombreCompleto', jefeCrNombre ?? '', { shouldValidate: false })
      setValue('coordinador.cargo', jefeCrCargo ?? '', { shouldValidate: false })
    }
  }, [mismoJefeCr, jefeCrNombre, jefeCrCargo, setValue])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            Encabezado del Formulario de Licitación Pública
          </h3>
          <p className="text-xs text-mercury-500">
            Identificación general de la adquisición, campus o sede requirente y fecha de emisión.
          </p>
        </div>

        <Field<LicitacionPublicaFormValues> name="titulo" label="Nombre de adquisición" required>
          <Input placeholder="Ej. Adquisición de microscopios binoculares y centrífugas" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<LicitacionPublicaFormValues>
            name="antecedentes.campusSede"
            label="Campus / Sede"
            required
          >
            <Combobox options={OPCIONES_CAMPUS_SEDE} placeholder="Seleccione Campus o Sede" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="antecedentes.fechaFormulario"
            label="Fecha del formulario"
            required
          >
            <DatePicker />
          </Field>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            II. Antecedentes Generales — Solicitud y Centro de Responsabilidad
          </h3>
          <p className="text-xs text-mercury-500">
            Datos de la solicitud (SASERVI, SABIENES, SASERDIR), CR de financiamiento y designación
            del Supervisor y Coordinador de la contratación.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<LicitacionPublicaFormValues>
            name="tipoSolicitud"
            label="Tipo de Solicitud (SASERVI, SABIENES, SASERDIR)"
            required
          >
            <Combobox
              options={OPCIONES_TIPO_SOLICITUD_EDELFOS}
              placeholder="Seleccione tipo de solicitud"
            />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="codigoEdelfos"
            label="Folio / N° de Solicitud"
            required
          >
            <Input placeholder="Ej. SABIENES-2026-1042" />
          </Field>
        </div>

        <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-3.5">
          <Field<LicitacionPublicaFormValues>
            name="antecedentes.formalizaSoloConFormularioLeasingObra"
            label="Formalización especial por Leasing o Estados de Pago"
            hideLabel
          >
            <Checkbox
              label="Se formaliza solicitud solo con el presente formulario (presupuesto reservado según correo adjunto)"
              description="Seleccionar solo cuando el pago sea vía leasing o contra Estados de pago de obras."
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field<LicitacionPublicaFormValues>
            name="coordinador.crCodigo"
            label="CR de Financiamiento"
            required
          >
            <NumberInput
              min={1}
              thousandSeparator={false}
              showStepper={false}
              placeholder="30412"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field<LicitacionPublicaFormValues>
              name="coordinador.crNombre"
              label="Nombre CR"
              required
            >
              <Input placeholder="Ej. Departamento de Ciencias Biológicas — Campus Osorno" />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<LicitacionPublicaFormValues>
            name="antecedentes.jefeCrNombre"
            label="Jefe Centro de Responsabilidad (Nombre)"
            required
          >
            <Input placeholder="Ej. Dra. Marcela Soto Valdivia" />
          </Field>

          <Field<LicitacionPublicaFormValues>
            name="antecedentes.jefeCrCargo"
            label="Cargo del Jefe de CR"
            required
          >
            <Input placeholder="Ej. Directora Departamento de Ciencias Biológicas" />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-mercury-200 p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-mercury-900">
              Responsable del Servicio — Supervisor y Coordinador de la Contratación
            </h4>
            <p className="text-xs text-mercury-500">
              Funcionaria/o con responsabilidad administrativa encargado de supervisar bases, dar
              recepción conforme, tramitar pagos/sanciones, notificar incumplimientos y responder
              consultas de la licitación.
            </p>
          </div>

          <Field<LicitacionPublicaFormValues>
            name="antecedentes.coordinadorEsMismoJefeCr"
            label="Mismo Jefe de CR"
            hideLabel
          >
            <Checkbox
              label="El Supervisor y Coordinador corresponde al mismo Jefe del Centro de Responsabilidad"
              description="Nota oficial: En el caso que sea distinto al Jefe del CR, ambos deben firmar la presente solicitud."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field<LicitacionPublicaFormValues>
              name="coordinador.nombreCompleto"
              label="Nombre del Supervisor y Coordinador"
              required
            >
              <Input disabled={mismoJefeCr} placeholder="Nombre completo" />
            </Field>

            <Field<LicitacionPublicaFormValues>
              name="coordinador.cargo"
              label="Cargo del Supervisor y Coordinador"
              required
            >
              <Input
                disabled={mismoJefeCr}
                placeholder="Cargo con responsabilidad administrativa"
              />
            </Field>

            <Field<LicitacionPublicaFormValues>
              name="coordinador.run"
              label="RUT del Supervisor y Coordinador"
              required
            >
              <Input placeholder="Ej. 12.345.678-5" />
            </Field>

            <Field<LicitacionPublicaFormValues>
              name="coordinador.correo"
              label="Correo electrónico institucional"
              required
            >
              <Input type="email" placeholder="nombre.apellido@ulagos.cl" />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            Presupuesto y Garantía de Seriedad de la Oferta
          </h3>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field<LicitacionPublicaFormValues>
            name="montoEstimadoClp"
            label="Presupuesto en pesos chilenos ($ CLP)"
            required
          >
            <NumberInput min={1} prefix="$" showStepper={false} placeholder="Ej. 82.500.000" />
          </Field>

          <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-3.5">
            <p className="text-xs font-medium text-mercury-500">Conversión a UTM</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-primary-700">
              {montoUtm.toLocaleString('es-CL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              UTM
            </p>
            <p className="mt-0.5 text-xs text-mercury-500">
              Valor UTM referencial: {formatCLP(VALOR_UTM_REFERENCIA_CLP)}
            </p>
          </div>
        </div>

        <Field<LicitacionPublicaFormValues>
          name="antecedentes.tipoPresupuesto"
          label="Carácter del Presupuesto"
          required
        >
          <RadioGroup options={OPCIONES_TIPO_PRESUPUESTO} />
        </Field>

        {tipoPresupuesto === 'estimado' && (
          <Field<LicitacionPublicaFormValues>
            name="antecedentes.hacerVisiblePresupuestoEstimado"
            label="Visibilidad del presupuesto estimado"
            hideLabel
          >
            <Checkbox
              label='Hacer visible el Presupuesto "estimado" en la publicación de la licitación'
              description="Indica en el portal Mercado Público el monto estimado referencial."
            />
          </Field>
        )}

        <div className="space-y-3 rounded-xl border border-mercury-200 p-4">
          <Field<LicitacionPublicaFormValues>
            name="antecedentes.requiereGarantiaSeriedad"
            label="Garantía de Seriedad de la Oferta"
            hideLabel
          >
            <Checkbox
              label={`Exigir Garantía de Seriedad de la Oferta (obligatorio sobre ${UMBRAL_GARANTIA_SERIEDAD_UTM.toLocaleString('es-CL')} UTM, tope máx. 3%)`}
              description={
                topeGarantiaClp > 0
                  ? `Tope máximo legal del 3% para este presupuesto: ${formatCLP(topeGarantiaClp)}`
                  : 'Ingrese el presupuesto para calcular el tope del 3%.'
              }
            />
          </Field>

          {requiereGarantiaSeriedad && (
            <Field<LicitacionPublicaFormValues>
              name="antecedentes.montoGarantiaSeriedadClp"
              label="Monto de la Garantía de Seriedad ($ CLP)"
              description={
                topeGarantiaClp > 0 ? `No puede exceder ${formatCLP(topeGarantiaClp)}.` : undefined
              }
              required
            >
              <NumberInput min={1} prefix="$" showStepper={false} />
            </Field>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <Field<LicitacionPublicaFormValues>
          name="antecedentes.visitaTerreno"
          label="Visita a Terreno"
          required
        >
          <RadioGroup options={OPCIONES_VISITA_TERRENO} />
        </Field>

        {visitaTerreno !== 'no_requiere' && (
          <div className="space-y-4 rounded-xl border border-mercury-200 bg-mercury-50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field<LicitacionPublicaFormValues>
                name="antecedentes.visitaDiasCorridosPublicacion"
                label="Días corridos desde publicación"
                required
              >
                <NumberInput min={1} suffix="días" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name="antecedentes.visitaHora"
                label="Hora de la visita"
                required
              >
                <Input placeholder="Ej. 10:30 hrs" />
              </Field>

              <Field<LicitacionPublicaFormValues>
                name="antecedentes.visitaGuiaNombreCargo"
                label="Guiada por (Nombre y Cargo)"
                required
              >
                <Input placeholder="Nombre y cargo (o quien subrogue)" />
              </Field>
            </div>

            <Field<LicitacionPublicaFormValues>
              name="antecedentes.visitaFormato"
              label="Modalidad de la Visita a Terreno"
              required
            >
              <RadioGroup options={OPCIONES_FORMATO_VISITA} />
            </Field>

            <Field<LicitacionPublicaFormValues>
              name="antecedentes.visitaDetalleLugarOEnlace"
              label={
                visitaFormato === 'presencial'
                  ? 'Lugar presencial de la visita'
                  : 'Tipo de enlace y forma de registro de asistencia (ej. registro fotográfico y/o chat)'
              }
              required
            >
              <Input
                placeholder={
                  visitaFormato === 'presencial'
                    ? 'Ej. Hall Central Campus Osorno, Av. Fuchslocher 1305'
                    : 'Ej. Enlace Google Meet con asistencia registrada en chat y captura fotográfica'
                }
              />
            </Field>
          </div>
        )}

        <Field<LicitacionPublicaFormValues>
          name="antecedentes.otrasConsideraciones"
          label="Otras Consideraciones a tener en cuenta"
          description="Información adicional no consultada que sea relevante para el proceso."
          optional
        >
          <TextArea
            rows={2}
            placeholder="Indique cualquier condición adicional relevante para las bases..."
          />
        </Field>
      </div>
    </div>
  )
}
