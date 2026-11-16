import { useFormContext, useWatch } from 'react-hook-form'
import { Combobox } from '@/components/ui/Combobox'
import { Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import type { TratoDirectoFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { OPCIONES_CAUSAL_TRATO_DIRECTO } from '@/features/formularios/utils/catalogosFormulario'

export function PasoJustificacionTratoDirecto() {
  const { control } = useFormContext<TratoDirectoFormValues>()
  const causalSeleccionada = useWatch({ control, name: 'causal' })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            1. Identificación del Proveedor Seleccionado
          </h3>
          <p className="text-xs text-mercury-500">
            Datos del proveedor con quien se propone celebrar la contratación directa excepcional.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TratoDirectoFormValues>
            name="proveedorNombre"
            label="Razón social o nombre del proveedor"
            required
          >
            <Input placeholder="Ej. Empresa El Mercurio S.A.P." />
          </Field>

          <Field<TratoDirectoFormValues> name="proveedorRut" label="RUT del proveedor" required>
            <Input placeholder="Ej. 11.111.111-1" />
          </Field>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            2. Causal Legal y Justificación Fundada (Art. 71 Ley N° 19.886)
          </h3>
          <p className="text-xs text-mercury-500">
            Dado su carácter excepcional, no basta con citar la ley; debe acreditarse técnica y
            documentalmente la causal invocada.
          </p>
        </div>

        <Field<TratoDirectoFormValues>
          name="causal"
          label="Causal legal invocada (Art. 71 Reglamento Ley 19.886)"
          required
        >
          <Combobox
            options={OPCIONES_CAUSAL_TRATO_DIRECTO}
            placeholder="Seleccione la causal de Trato Directo"
          />
        </Field>

        <Field<TratoDirectoFormValues>
          name="objetivoImportancia"
          label="Objetivo e importancia de la adquisición para la Universidad"
          description="Explique qué se compra y por qué es vital para la docencia, investigación o gestión institucional."
          required
        >
          <TextArea
            rows={3}
            maxLength={1500}
            showCounter
            placeholder="Detalle el impacto directo en las actividades académicas, científicas o administrativas..."
          />
        </Field>

        <Field<TratoDirectoFormValues>
          name="justificacionProveedorUnico"
          label="Razones técnicas, comerciales o de mercado para la elección del proveedor"
          description="Fundamente por qué este proveedor es la única opción viable en el mercado."
          required
        >
          <TextArea
            rows={3}
            maxLength={1500}
            showCounter
            placeholder="Ej. Titularidad exclusiva de derechos, soporte oficial de fábrica o incompatibilidad técnica con otras marcas..."
          />
        </Field>

        {causalSeleccionada === 'costo_desproporcionado_7b' && (
          <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-4">
            <Field<TratoDirectoFormValues>
              name="informeCostos7b"
              label="Informe de Costos de Licitación Desproporcionados (Requisito Causal 7b)"
              description="Obligatorio para la causal 7b: demuestre que el costo administrativo y de horas-hombre de realizar una licitación pública resulta desproporcionado respecto al monto del bien o servicio."
              required
            >
              <TextArea
                rows={3}
                maxLength={1500}
                showCounter
                placeholder="Detalle el análisis comparativo de costos operativos de licitar frente al valor neto de la compra..."
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  )
}
