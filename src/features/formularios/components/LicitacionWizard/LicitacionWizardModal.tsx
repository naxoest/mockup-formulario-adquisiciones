import { useForm, type FieldPath, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm, type ModalComponentProps } from '@/components/ui/Modal'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import { useCrearFormularioAdquisicion } from '@/features/formularios/api/formulariosAdquisicion'
import { PasoDisposicionesContractuales } from '@/features/formularios/components/CamposComunes/PasoDisposicionesContractuales'
import { PasoIdentificacionYCoordinador } from '@/features/formularios/components/CamposComunes/PasoIdentificacionYCoordinador'
import { PasoEvaluacionLicitacion } from '@/features/formularios/components/LicitacionWizard/PasoEvaluacionLicitacion'
import { PasoRequerimientoLicitacion } from '@/features/formularios/components/LicitacionWizard/PasoRequerimientoLicitacion'
import { VALORES_INICIALES_DISPOSICIONES } from '@/features/formularios/schemas/disposicionesComunes.schema'
import {
  licitacionPublicaFormSchema,
  type LicitacionPublicaFormValues,
} from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { transformarLicitacionAPayload } from '@/features/formularios/utils/catalogosFormulario'
import { GARANTIA_MINIMA_LICITACION_MESES } from '@/features/formularios/utils/reglasLicitacion'
import { zodResolver } from '@/lib/zodResolver'

const CAMPOS_POR_PASO: Record<number, FieldPath<LicitacionPublicaFormValues>[]> = {
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
  1: ['formalizacion', 'categoriaRequerimiento', 'productos', 'servicios', 'bibliografia'],
  2: ['comisionEvaluadora', 'criteriosEvaluacion'],
  3: ['disposiciones'],
}

function obtenerValoresInicialesLicitacion(): LicitacionPublicaFormValues {
  return {
    titulo: '',
    codigoEdelfos: '',
    tipoSolicitud: 'SABIENES',
    montoEstimadoClp: null,
    coordinador: {
      nombreCompleto: '',
      run: '',
      correo: '',
      cargo: '',
      crCodigo: null,
      crNombre: '',
    },
    formalizacion: 'solo_oc',
    categoriaRequerimiento: 'productos',
    productos: [
      {
        descripcion: '',
        cantidad: 1,
        unidadMedida: 'Unidad',
        materialidad: '',
        permiteEquivalentes: true,
        mesesGarantia: 12,
        requiereInstalacion: false,
      },
    ],
    servicios: [],
    bibliografia: [],
    comisionEvaluadora: [
      {
        nombreCompleto: '',
        run: '',
        cargo: '',
        unidad: '',
      },
    ],
    criteriosEvaluacion: {
      ponderacionAdministrativa: 10,
      ponderacionEconomica: 40,
      ponderacionPlazoEntrega: 20,
      ponderacionExperiencia: 15,
      ponderacionGarantia: 15,
      mesesGarantiaMinima: GARANTIA_MINIMA_LICITACION_MESES,
      exigePactoIntegridad: true,
    },
    disposiciones: { ...VALORES_INICIALES_DISPOSICIONES },
  }
}

export function LicitacionWizardModal({ open, resolve, onExited }: ModalComponentProps<boolean>) {
  const stepper = useStepper({ totalSteps: 4 })
  const confirmar = useConfirm()
  const mutacionCrear = useCrearFormularioAdquisicion()

  const form = useForm<LicitacionPublicaFormValues>({
    resolver: zodResolver(licitacionPublicaFormSchema) as Resolver<LicitacionPublicaFormValues>,
    defaultValues: obtenerValoresInicialesLicitacion(),
    mode: 'onTouched',
  })

  const cerrarModal = async () => {
    if (mutacionCrear.isPending) return
    if (form.formState.isDirty) {
      const descartar = await confirmar({
        title: '¿Descartar borrador de Licitación Pública?',
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

  const guardarFormulario = (valores: LicitacionPublicaFormValues) => {
    const payload = transformarLicitacionAPayload(valores)
    mutacionCrear.mutate(payload, {
      onSuccess: (creado) => {
        toast.success(`Formulario ${creado.folio} de Licitación Pública registrado`)
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
      <Modal.Header>Nuevo Formulario para Licitación Pública</Modal.Header>
      <Form form={form} onSubmit={guardarFormulario} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-6">
          <Stepper active={stepper.active} onStepClick={stepper.goTo} size="sm">
            <Stepper.Step label="Identificación" description="E-delfos y CR" />
            <Stepper.Step label="Requerimiento" description="Ítems y UTM" />
            <Stepper.Step label="Evaluación" description="Comisión y 100%" />
            <Stepper.Step label="Disposiciones" description="Multas y pagos" />
          </Stepper>

          {stepper.active === 0 && <PasoIdentificacionYCoordinador />}
          {stepper.active === 1 && <PasoRequerimientoLicitacion />}
          {stepper.active === 2 && <PasoEvaluacionLicitacion />}
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
                Registrar Licitación Pública
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
