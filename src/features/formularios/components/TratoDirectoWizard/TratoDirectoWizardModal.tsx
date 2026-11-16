import { useForm, type FieldPath, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm, type ModalComponentProps } from '@/components/ui/Modal'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import { useCrearFormularioAdquisicion } from '@/features/formularios/api/formulariosAdquisicion'
import { PasoJustificacionTratoDirecto } from '@/features/formularios/components/TratoDirectoWizard/PasoJustificacionTratoDirecto'
import { PasoRequerimientoYFundamentoTd } from '@/features/formularios/components/TratoDirectoWizard/PasoRequerimientoYFundamentoTd'
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
    'campusSede',
    'fechaFormulario',
    'tipoSolicitud',
    'codigoEdelfos',
    'titulo',
    'itemsRequeridos',
    'situacionConvenioMarco',
    'causal',
    'objetivoImportancia',
    'motivosEleccionProveedor',
    'justificacionCausalEscogida',
  ],
  1: ['proveedorNombre', 'proveedorRut', 'lineasCotizacion', 'afectoIva', 'condicionesCompra'],
  2: [
    'coordinador.crCodigo',
    'coordinador.crNombre',
    'jefeCrNombre',
    'jefeCrCargo',
    'coordinadorEsMismoJefeCr',
    'coordinador.nombreCompleto',
    'coordinador.cargo',
    'coordinador.run',
    'coordinador.correo',
    'otrosIncumplimientos',
    'disposiciones',
    'compromisoEstandarSimpleOc',
    'compromisoNoFragmentacion',
    'archivoCotizacion',
    'archivoDeclaracionJurada',
    'documentosAdicionales',
    'otroDocumentoAdicionalDetalle',
  ],
}

function obtenerValoresInicialesTratoDirecto(): TratoDirectoFormValues {
  return {
    campusSede: 'osorno',
    fechaFormulario: new Date(),
    titulo: '',
    codigoEdelfos: '',
    tipoSolicitud: 'SASERVI',
    montoEstimadoClp: 1,
    itemsRequeridos: [
      {
        cantidad: 1,
        descripcionDetallada: '',
      },
    ],
    situacionConvenioMarco: 'no_disponible',
    causal: 'costo_desproporcionado_7b',
    objetivoImportancia: '',
    motivosEleccionProveedor: '',
    justificacionCausalEscogida: '',
    proveedorNombre: '',
    proveedorRut: '',
    lineasCotizacion: [
      {
        cantidad: 1,
        detalle: '',
        precioUnitarioNeto: null,
      },
    ],
    afectoIva: true,
    condicionesCompra: {
      plazoEntregaDiasHabiles: 5,
      esServicio: true,
      fechaInicioServicio: '',
      fechaTerminoServicio: '',
      requiereGarantia: false,
      mesesGarantia: null,
      aplicaDireccionDespacho: false,
      direccionDespachoCodigo: 'osorno_fuchslocher',
      direccionDespachoOtra: '',
    },
    coordinador: {
      nombreCompleto: '',
      run: '',
      correo: '',
      cargo: '',
      crCodigo: null,
      crNombre: '',
    },
    jefeCrNombre: '',
    jefeCrCargo: '',
    coordinadorEsMismoJefeCr: true,
    otrosIncumplimientos: [],
    compromisoEstandarSimpleOc: true,
    compromisoNoFragmentacion: true,
    archivoCotizacion: [],
    archivoDeclaracionJurada: [],
    documentosAdicionales: [],
    otroDocumentoAdicionalDetalle: '',
    disposiciones: {
      ...VALORES_INICIALES_DISPOSICIONES,
      topePorcentajeContrato: '10',
    },
  }
}

export function TratoDirectoWizardModal({ open, resolve, onExited }: ModalComponentProps<boolean>) {
  const stepper = useStepper({ totalSteps: 3 })
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
      <Modal.Header>Formulario de Adquisición por Trato o Contratación Directa (v.4)</Modal.Header>
      <Form form={form} onSubmit={guardarFormulario} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-6">
          <Stepper active={stepper.active} onStepClick={stepper.goTo} size="sm">
            <Stepper.Step label="1–4. Fundamento" description="Ítems, Convenio y Art. 71" />
            <Stepper.Step label="5. Cotización" description="Proveedor, Neto/IVA y Plazos" />
            <Stepper.Step label="6–11. Respaldos" description="Coordinador, CR y Adjuntos" />
          </Stepper>

          {stepper.active === 0 && <PasoRequerimientoYFundamentoTd />}
          {stepper.active === 1 && <PasoJustificacionTratoDirecto />}
          {stepper.active === 2 && <PasoRespaldosTratoDirecto />}
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
