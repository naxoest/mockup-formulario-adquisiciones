import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field, Form } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { NumberInput } from '@/components/ui/NumberInput'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { TextArea } from '@/components/ui/TextArea'
import { zodResolver } from '@/lib/zodResolver'
import {
  bloqueadoresQueryOptions,
  useActualizarMonitoreo,
} from '@/features/transacciones/api/monitoreo'
import {
  gestionMonitoreoSchema,
  type GestionMonitoreoValues,
} from '@/features/transacciones/schemas/gestionMonitoreo.schema'
import { aActualizacion, valoresIniciales } from './GestionMonitoreo.utils'
import type { GestionMonitoreoModalProps } from './GestionMonitoreoModal.types'

const FACTORES = [
  { nombre: 'impactoAcademico', etiqueta: 'Impacto académico' },
  { nombre: 'urgenciaTemporal', etiqueta: 'Urgencia temporal' },
  { nombre: 'exposicionInstitucional', etiqueta: 'Exposición institucional' },
  { nombre: 'riesgoOperacional', etiqueta: 'Riesgo operacional' },
] as const

export function GestionMonitoreoModal({
  fila,
  open,
  resolve,
  onExited,
}: GestionMonitoreoModalProps) {
  const actualizar = useActualizarMonitoreo()
  const bloqueadores = useQuery(bloqueadoresQueryOptions)

  const opcionesBloqueador =
    bloqueadores.data ?? (fila.bloqueadorPrincipal ? [fila.bloqueadorPrincipal] : [])

  const form = useForm<GestionMonitoreoValues>({
    resolver: zodResolver(gestionMonitoreoSchema),
    defaultValues: valoresIniciales(fila),
  })

  const enviar = async (valores: GestionMonitoreoValues) => {
    try {
      await actualizar.mutateAsync({
        transaccionId: fila.transaccionId,
        cambios: aActualizacion(valores),
      })
      toast.success('Gestión registrada')
      resolve(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo registrar la gestión')
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        resolve(false)
      }}
      onExited={onExited}
      size="lg"
    >
      <Modal.Header tone="default">Gestión del proceso</Modal.Header>

      <Form form={form} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="flex flex-col gap-6">
          <p className="text-sm text-mercury-600">{fila.nombre}</p>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-mercury-700">Factores de criticidad</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FACTORES.map((factor) => (
                <Field key={factor.nombre} name={factor.nombre} label={factor.etiqueta} required>
                  <NumberInput min={1} max={5} step={1} />
                </Field>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-mercury-700">Gestión</legend>
            <Field name="proximaAccion" label="Próxima acción" optional>
              <TextArea rows={2} maxLength={200} showCounter />
            </Field>
            <Field name="fechaProximaRevision" label="Fecha de la próxima revisión" optional>
              <DatePicker />
            </Field>
            <Field
              name="bloqueadorPrincipal"
              label="Bloqueador principal"
              optional
              description={
                bloqueadores.isError ? 'No se pudo cargar el catálogo de bloqueadores' : undefined
              }
            >
              <Select disabled={bloqueadores.isPending || bloqueadores.isError}>
                <option value="">Sin bloqueador</option>
                {opcionesBloqueador.map((opcion) => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </Select>
            </Field>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-sm font-medium text-mercury-700">Seguimiento</legend>
            <Field name="escalarAJefatura" hideLabel label="Escalar a jefatura">
              <Switch
                label="Escalar a jefatura"
                description="Marca el proceso para revisión de la jefatura"
              />
            </Field>
            <Field name="cerrado" hideLabel label="Cerrar seguimiento">
              <Switch
                label="Cerrar seguimiento"
                description="Deja de monitorear el proceso sin alterar el estado de la transacción"
              />
            </Field>
          </fieldset>

          <Field name="observaciones" label="Observaciones" optional>
            <TextArea rows={3} maxLength={400} showCounter />
          </Field>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              resolve(false)
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={actualizar.isPending}>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
