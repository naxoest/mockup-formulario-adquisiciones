import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Field, Form } from '@/components/ui/Form'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { ApiError } from '@/lib/apiClient'
import { zodResolver } from '@/lib/zodResolver'
import {
  analistasQueryOptions,
  asignacionAnalistasQueryOptions,
  useActualizarAsignacionAnalistas,
} from '@/features/transacciones/api/analistas'
import {
  asignacionAnalistasFormSchema,
  type AsignacionAnalistasValues,
} from '@/features/transacciones/schemas/asignacionAnalistas.schema'
import type {
  AnalistaReferencia,
  AsignacionAnalistas,
} from '@/features/transacciones/types/transaccion.types'
import { aPeticion, campoDelError, valoresIniciales } from './TransaccionAnalistas.utils'
import type { TransaccionAnalistasModalProps } from './TransaccionAnalistasModal.types'

interface FormularioAsignacionProps {
  transaccionId: number
  asignacion: AsignacionAnalistas
  analistas: AnalistaReferencia[]
  onCancelar: () => void
  onGuardado: () => void
}

function FormularioAsignacion({
  transaccionId,
  asignacion,
  analistas,
  onCancelar,
  onGuardado,
}: FormularioAsignacionProps) {
  const actualizar = useActualizarAsignacionAnalistas()

  const form = useForm<AsignacionAnalistasValues>({
    resolver: zodResolver(asignacionAnalistasFormSchema),
    defaultValues: valoresIniciales(asignacion),
  })

  const opciones = analistas.map((analista) => ({
    value: String(analista.run),
    label: analista.nombre,
  }))

  const enviar = async (valores: AsignacionAnalistasValues) => {
    try {
      await actualizar.mutateAsync({ transaccionId, datos: aPeticion(valores) })
      toast.success('Analistas actualizados')
      onGuardado()
    } catch (error) {
      const campo = error instanceof ApiError && error.field ? campoDelError(error.field) : null

      if (campo !== null && error instanceof Error) {
        form.setError(campo, { message: error.message })
        return
      }

      toast.error(
        error instanceof Error ? error.message : 'No se pudieron actualizar los analistas',
      )
    }
  }

  return (
    <Form form={form} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
      <Modal.Body className="flex flex-col gap-4">
        <Field
          name="principal"
          label="Analista principal"
          description="Responsable de la transacción."
          optional
        >
          <Select>
            <option value="">Sin principal</option>
            {opciones.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          name="apoyo"
          label="Analistas de apoyo"
          description="Apoyan la gestión de la transacción junto al analista principal."
          optional
        >
          <Combobox
            multiple
            options={opciones}
            placeholder="Seleccionar analistas"
            searchPlaceholder="Buscar analista"
            emptyMessage="No hay analistas disponibles"
          />
        </Field>

        <Field name="observacion" label="Observación" optional>
          <TextArea rows={2} maxLength={200} showCounter />
        </Field>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={actualizar.isPending}>
          Guardar
        </Button>
      </Modal.Footer>
    </Form>
  )
}

export function TransaccionAnalistasModal({
  transaccionId,
  open,
  resolve,
  onExited,
}: TransaccionAnalistasModalProps) {
  const asignacion = useQuery(asignacionAnalistasQueryOptions(transaccionId))
  const analistas = useQuery(analistasQueryOptions)

  const cerrar = () => {
    resolve(false)
  }

  return (
    <Modal open={open} onClose={cerrar} onExited={onExited} size="md">
      <Modal.Header tone="default">Analistas de la transacción #{transaccionId}</Modal.Header>

      {asignacion.isPending || analistas.isPending ? (
        <Modal.Body>
          <Loading variant="container" message="Cargando analistas" />
        </Modal.Body>
      ) : asignacion.isError || analistas.isError ? (
        <>
          <Modal.Body>
            <p className="text-sm text-scarlet-700">
              No se pudo cargar la asignación de analistas.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrar}>
              Cerrar
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <FormularioAsignacion
          transaccionId={transaccionId}
          asignacion={asignacion.data}
          analistas={analistas.data}
          onCancelar={cerrar}
          onGuardado={() => {
            resolve(true)
          }}
        />
      )}
    </Modal>
  )
}
