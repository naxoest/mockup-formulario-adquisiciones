import { useFormContext, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { OPCIONES_TIPO_SOLICITUD_EDELFOS } from '@/features/formularios/utils/catalogosFormulario'
import {
  VALOR_UTM_REFERENCIA_CLP,
  calcularMontoUtm,
} from '@/features/formularios/utils/reglasLicitacion'
import { formatCLP } from '@/utils/currency'

interface CamposCabeceraValues {
  titulo: string
  codigoEdelfos: string
  tipoSolicitud: string
  montoEstimadoClp: number | null
  coordinador: {
    nombreCompleto: string
    run: string
    correo: string
    cargo: string
    crCodigo: number | null
    crNombre: string
  }
}

export function PasoIdentificacionYCoordinador() {
  const { control } = useFormContext<CamposCabeceraValues>()
  const montoClp = useWatch({ control, name: 'montoEstimadoClp' })
  const montoUtm = calcularMontoUtm(montoClp)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            1. Identificación de la Solicitud E-delfos
          </h3>
          <p className="text-xs text-mercury-500">
            Vincule el requerimiento con el código y tipo de gasto registrado en el sistema
            E-delfos.
          </p>
        </div>

        <Field<CamposCabeceraValues>
          name="titulo"
          label="Nombre o título de la adquisición"
          description="Describa claramente el bien o servicio a contratar."
          required
        >
          <Input placeholder="Ej. Adquisición de equipamiento para Laboratorio de Docencia" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<CamposCabeceraValues>
            name="tipoSolicitud"
            label="Tipo de solicitud E-delfos"
            required
          >
            <Combobox
              options={OPCIONES_TIPO_SOLICITUD_EDELFOS}
              placeholder="Seleccione tipo de solicitud"
            />
          </Field>

          <Field<CamposCabeceraValues>
            name="codigoEdelfos"
            label="Código de solicitud E-delfos"
            required
          >
            <Input placeholder="Ej. SABIENES-2026-1042" />
          </Field>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field<CamposCabeceraValues>
            name="montoEstimadoClp"
            label="Monto total estimado (CLP)"
            description="Valor total estimado para determinar umbrales en UTM."
            required
          >
            <NumberInput min={1} prefix="$" showStepper={false} placeholder="Ej. 15.000.000" />
          </Field>

          <div className="rounded-xl border border-mercury-200 bg-mercury-50 p-3.5">
            <p className="text-xs font-medium text-mercury-500">Equivalencia referencial en UTM</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-primary-700">
              {montoUtm.toLocaleString('es-CL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              UTM
            </p>
            <p className="mt-0.5 text-xs text-mercury-500">
              Base referencial: 1 UTM = {formatCLP(VALOR_UTM_REFERENCIA_CLP)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            2. Coordinador / Supervisor del Contrato (Jefe de CR)
          </h3>
          <p className="text-xs text-mercury-500">
            Funcionario responsable de supervisar el cumplimiento, visar pagos, otorgar recepción
            conforme y notificar eventuales incumplimientos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<CamposCabeceraValues>
            name="coordinador.nombreCompleto"
            label="Nombre completo del coordinador"
            required
          >
            <Input placeholder="Ej. Dra. Marcela Soto Valdivia" />
          </Field>

          <Field<CamposCabeceraValues> name="coordinador.run" label="RUN del coordinador" required>
            <Input placeholder="Ej. 12.345.678-5" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<CamposCabeceraValues>
            name="coordinador.correo"
            label="Correo institucional"
            required
          >
            <Input type="email" placeholder="nombre.apellido@ulagos.cl" />
          </Field>

          <Field<CamposCabeceraValues>
            name="coordinador.cargo"
            label="Cargo institucional"
            required
          >
            <Input placeholder="Ej. Jefe de Centro de Responsabilidad" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field<CamposCabeceraValues> name="coordinador.crCodigo" label="Código CR" required>
            <NumberInput
              min={1}
              thousandSeparator={false}
              showStepper={false}
              placeholder="30412"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field<CamposCabeceraValues>
              name="coordinador.crNombre"
              label="Nombre del Centro de Responsabilidad (CR)"
              required
            >
              <Input placeholder="Ej. Departamento de Ciencias Biológicas — Campus Osorno" />
            </Field>
          </div>
        </div>
      </div>
    </div>
  )
}
