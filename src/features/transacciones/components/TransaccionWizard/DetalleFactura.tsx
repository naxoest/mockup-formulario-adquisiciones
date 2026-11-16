import { useFormContext, useWatch } from 'react-hook-form'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field } from '@/components/ui/Form'
import { NumberInput } from '@/components/ui/NumberInput'
import { formatShortDate } from '@/utils/date'
import type { TransaccionFormState } from '../../types/transaccion.types'
import { LineasFactura } from './LineasFactura'
import { LineasFacturaRegistrada } from './LineasFacturaRegistrada'
import type { MontoDeOrden } from './TransaccionWizard.sincronizacion'

export function DetalleFactura({
  index,
  facturables,
  montosDeOrden,
  transaccionConfirmada,
}: {
  index: number
  facturables: MontoDeOrden[]
  montosDeOrden: MontoDeOrden[]
  transaccionConfirmada: boolean
}) {
  const { control } = useFormContext<TransaccionFormState>()

  const id = useWatch({ control, name: `facturas.${index}.id` })
  const folio = useWatch({ control, name: `facturas.${index}.folio` })
  const fechaEmision = useWatch({ control, name: `facturas.${index}.fechaEmision` })

  const registrada = id !== null && id !== undefined
  const cabeceraEditable = !registrada || !transaccionConfirmada

  return (
    <div className="space-y-4">
      {cabeceraEditable ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field<TransaccionFormState>
            name={`facturas.${index}.folio`}
            label="Número de factura"
            description="Número que identifica a la factura."
            required
          >
            <NumberInput showStepper={false} decimals={0} placeholder="Ej: 88214" />
          </Field>
          <Field<TransaccionFormState>
            name={`facturas.${index}.fechaEmision`}
            label="Fecha de emisión"
            description="Fecha que consta en el documento."
            required
          >
            <DatePicker maxDate={new Date()} />
          </Field>
        </div>
      ) : (
        <div className="space-y-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-mercury-700">Número de factura</dt>
              <dd className="mt-1 font-mono text-sm text-mercury-900">{folio ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-mercury-700">Fecha de emisión</dt>
              <dd className="mt-1 text-sm text-mercury-900">
                {fechaEmision ? formatShortDate(fechaEmision) : '—'}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-mercury-500">
            La transacción está confirmada: los datos de esta factura no se pueden modificar.
          </p>
        </div>
      )}
      {registrada ? (
        <LineasFacturaRegistrada index={index} montosDeOrden={montosDeOrden} />
      ) : (
        <LineasFactura index={index} facturables={facturables} />
      )}
    </div>
  )
}
