import { useId, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { Stepper } from '@/components/ui/Stepper'
import type { RegistroPasoValues } from '@/features/transacciones/schemas/registroPaso.schema'
import type { DeshacerPasoRequest } from '@/features/transacciones/schemas/transaccionRequest.schema'
import type { Transaccion } from '@/features/transacciones/types/transaccion.types'
import { ConfirmacionDeshacer } from './ConfirmacionDeshacer'
import { FormularioPaso } from './FormularioPaso'
import { PasosRegistrados } from './PasosRegistrados'
import { ResumenPrecomprometido } from './ResumenPrecomprometido'

interface PasoAdquisicionesProps {
  transaccion: Transaccion
  formularioPaso: UseFormReturn<RegistroPasoValues>
  onDeshacerPaso: (id: number, datos: DeshacerPasoRequest) => Promise<Transaccion>
}

export function PasoAdquisiciones({
  transaccion,
  formularioPaso,
  onDeshacerPaso,
}: PasoAdquisicionesProps) {
  const idTitulo = useId()
  const [registroADeshacer, setRegistroADeshacer] = useState<string | null>(null)
  const { proceso } = transaccion
  const ultimo = proceso.registrados.at(-1)
  const confirmandoDeshacer = ultimo !== undefined && ultimo.registradoEn === registroADeshacer

  return (
    <section aria-labelledby={idTitulo} className="space-y-6">
      <div>
        <h3 id={idTitulo} className="mb-1.5 text-base font-semibold text-mercury-900">
          Proceso de adquisición
        </h3>
        <p className="text-xs text-mercury-500">
          Registre en orden los pasos del proceso. Cada paso queda registrado al pulsar Siguiente.
        </p>
      </div>

      <Stepper active={proceso.registrados.length} size="sm">
        {proceso.pasosAplicables.map((aplicable) => (
          <Stepper.Step key={aplicable.paso} label={aplicable.etiqueta} />
        ))}
      </Stepper>

      {proceso.motivoBloqueo !== null ? (
        <div className="rounded-lg border border-mercury-200 bg-mercury-50 px-4 py-3">
          <p className="text-sm font-medium text-mercury-900">
            No es posible registrar el siguiente paso
          </p>
          <p className="mt-1 text-sm text-mercury-600">{proceso.motivoBloqueo.mensaje}</p>
        </div>
      ) : proceso.siguientesPermitidos.length === 0 ? (
        <ResumenPrecomprometido transaccion={transaccion} />
      ) : (
        <FormularioPaso proceso={proceso} form={formularioPaso} />
      )}

      <PasosRegistrados
        registrados={proceso.registrados}
        onDeshacer={
          ultimo === undefined || confirmandoDeshacer
            ? undefined
            : () => setRegistroADeshacer(ultimo.registradoEn)
        }
      />

      {ultimo !== undefined && confirmandoDeshacer && (
        <ConfirmacionDeshacer
          ultimo={ultimo}
          onCancelar={() => setRegistroADeshacer(null)}
          onConfirmar={async (observacion) => {
            await onDeshacerPaso(transaccion.id, { paso: ultimo.paso, observacion })
            setRegistroADeshacer(null)
            toast.success('Paso deshecho')
          }}
        />
      )}
    </section>
  )
}
