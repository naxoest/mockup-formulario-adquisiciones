import { useForm, type FieldPath, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm, type ModalComponentProps } from '@/components/ui/Modal'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import { useCrearFormularioAdquisicion } from '@/features/formularios/api/formulariosAdquisicion'
import { PasoDisposicionesContractuales } from '@/features/formularios/components/CamposComunes/PasoDisposicionesContractuales'
import { PasoIdentificacionYCoordinador } from '@/features/formularios/components/CamposComunes/PasoIdentificacionYCoordinador'
import { PasoJustificacionTratoDirecto } from '@/features/formularios/components/TratoDirectoWizard/PasoJustificacionTratoDirecto'
import { PasoRespaldosTratoDirecto } from '@/features/formularios/components/TratoDirectoWizard/PasoRespaldosTratoDirecto'
import { VALORES_INICIALES_DISPOSICIONES } from '@/features/formularios/schemas/disposicionesComunes.schema'
import {
  tratoDirectoFormSchema,
  type TratoDirectoFormValues,
} from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { transformarTratoDirectoAPayload } from '@/features/formularios/utils/catalogosFormulario'
import { zodResolver } from '@/lib/zodResolver'

const CAMPOS_POR_PASO: Record<number, FieldPath<TratoDirectoFormValues>[]> = {
  0: [
    'titulo',
    'tipoSolicitud',
    'codigoEdelfos',
    'montoEstimadoClp',
    'coordinador.nombreCompleto',
    'coordinador.run',
    'coordinador.correo',
    'coordinador.cargo',
    'coordinador.crCodigo',
    'coordinador.crNombre',
  ],
  1: [
    'proveedorNombre',
    'proveedorRut',
    'causal',
    'objetivoImportancia',
    'justificacionProveedorUnico',
    'informeCostos7b',
  ],
  2: [
    'certificaNoConvenioMarco',
    'compromisoNoFragmentacion',
    'archivoCotizacion',
    'archivoDeclaracionJurada',
  ],
  3: ['disposiciones'],
}

function obtenerValoresInicialesTratoDirecto(): TratoDirectoFormValues {
  return {
    titulo: '',
    codigoEdelfos: '',
    tipoSolicitud: 'SASERVI',
    montoEstimadoClp: null,
    coordinador: {
      nombreCompleto: '',
      run: '',
      correo: '',
      cargo: '',
      crCodigo: null,
      crNombre: '',
    },
    proveedorNombre: '',
    proveedorRut: '',
    causal: 'proveedor_unico',
    objetivoImportancia: '',
    justificacionProveedorUnico: '',
    informeCostos7b: '',
    certificaNoConvenioMarco: false,
    compromisoNoFragmentacion: false,
    archivoCotizacion: [],
    archivoDeclaracionJurada: [],
    disposiciones: { ...VALORES_INICIALES_DISPOSICIONES },
  }
}

export function TratoDirectoWizardModal({ open, resolve, onExited }: ModalComponentProps<boolean>) {
  const stepper = useStepper({ totalSteps: 4 })
  const confirmar = useConfirm()
  const mutacionCrear = useCrearFormularioAdquisicion()

  const form = useForm<TratoDirectoFormValues>({
    resolver: zodResolver(tratoDirectoFormSchema) as Resolver<TratoDirectoFormValues>,
    defaultValues: obtenerValoresInicialesTratoDirecto(),
    mode: 'onTouched',
  })

  const cerrarModal = async () => {
    if (mutacionCrear.isPending) return
    if (form.formState.isDirty) {
      const descartar = await confirmar({
        title: '¿Descartar borrador de Trato Directo?',
        message: 'Se perderán los datos ingresados en este formulario.',
        confirmText: 'Descartar',
        cancelText: 'Continuar editando',
        variant: 'warning',
      })
      if (!descartar) return
    }
    resolve(false)
  }

  const avanzarPaso = async () => {
    const camposActuales = CAMPOS_POR_PASO[stepper.active] ?? []
    const valido = await form.trigger(camposActuales)
    if (valido) {
      stepper.next()
    }
  }

  const guardarFormulario = (valores: TratoDirectoFormValues) => {
    const payload = transformarTratoDirectoAPayload(valores)
    mutacionCrear.mutate(payload, {
      onSuccess: (creado) => {
        toast.success(`Formulario ${creado.folio} de Trato Directo registrado`)
        resolve(true)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'No se pudo guardar el formulario')
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => void cerrarModal()}
      onExited={onExited}
      size="xl"
      closeOnBackdrop={!mutacionCrear.isPending}
      closeOnEscape={!mutacionCrear.isPending}
      showCloseButton={!mutacionCrear.isPending}
    >
      <Modal.Header>Nuevo Formulario de Adquisición por Trato Directo</Modal.Header>
      <Form form={form} onSubmit={guardarFormulario} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-6">
          <Stepper active={stepper.active} onStepClick={stepper.goTo} size="sm">
            <Stepper.Step label="Identificación" description="E-delfos y CR" />
            <Stepper.Step label="Justificación" description="Art. 71 y Proveedor" />
            <Stepper.Step label="Respaldos" description="Cotización y DJ" />
            <Stepper.Step label="Disposiciones" description="Multas y pagos" />
          </Stepper>

          {stepper.active === 0 && <PasoIdentificacionYCoordinador />}
          {stepper.active === 1 && <PasoJustificacionTratoDirecto />}
          {stepper.active === 2 && <PasoRespaldosTratoDirecto />}
          {stepper.active === 3 && <PasoDisposicionesContractuales />}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => void cerrarModal()}
            disabled={mutacionCrear.isPending}
          >
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            {!stepper.isFirst && (
              <Button
                variant="secondary"
                onClick={stepper.previous}
                disabled={mutacionCrear.isPending}
              >
                Anterior
              </Button>
            )}
            {!stepper.isLast ? (
              <Button variant="primary" onClick={() => void avanzarPaso()}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={mutacionCrear.isPending}>
                Registrar Trato Directo
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
