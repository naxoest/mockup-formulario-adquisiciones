import { Checkbox } from '@/components/ui/Checkbox'
import { FileUpload } from '@/components/ui/FileUpload'
import { Field } from '@/components/ui/Form'
import type { TratoDirectoFormValues } from '@/features/formularios/schemas/formulariosAdquisicion.schema'

export function PasoRespaldosTratoDirecto() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            1. Certificaciones y Compromisos Normativos
          </h3>
          <p className="text-xs text-mercury-500">
            Declaraciones obligatorias de la unidad solicitante previas a la emisión de la
            resolución de Trato Directo.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-mercury-200 bg-mercury-50 p-4">
          <Field<TratoDirectoFormValues>
            name="certificaNoConvenioMarco"
            label="Revisión de Convenio Marco"
            hideLabel
          >
            <Checkbox
              label="Certifico que el producto o servicio NO se encuentra en el Catálogo de Convenio Marco (o que las condiciones regionales no lo permiten)"
              description="Requisito previo obligatorio conforme a la Ley N° 19.886."
            />
          </Field>

          <div className="border-t border-mercury-200 pt-3">
            <Field<TratoDirectoFormValues>
              name="compromisoNoFragmentacion"
              label="Prohibición de fragmentación"
              hideLabel
            >
              <Checkbox
                label="Asumo el compromiso institucional de NO fragmentar compras para eludir los umbrales de licitación pública"
                description="El fraccionamiento artificial de adquisiciones infringe el Reglamento de Compras Públicas."
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-mercury-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-mercury-900">
            2. Documentos de Respaldo Obligatorios
          </h3>
          <p className="text-xs text-mercury-500">
            Adjunte la cotización vigente del proveedor y su declaración jurada firmada.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field<TratoDirectoFormValues>
            name="archivoCotizacion"
            label="Cotización oficial del proveedor"
            description="Documento con detalle de precios, vigencia e identificación del proveedor."
            required
          >
            <FileUpload categories={['document']} maxFiles={1} />
          </Field>

          <Field<TratoDirectoFormValues>
            name="archivoDeclaracionJurada"
            label="Declaración Jurada del proveedor"
            description="Declaración de ausencia de inhabilidades e incompatibilidades legales."
            required
          >
            <FileUpload categories={['document']} maxFiles={1} />
          </Field>
        </div>
      </div>
    </div>
  )
}
