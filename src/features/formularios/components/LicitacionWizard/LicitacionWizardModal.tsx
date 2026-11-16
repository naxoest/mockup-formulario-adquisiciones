import { useForm, type FieldPath, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/ui/Form'
import { Modal, useConfirm, type ModalComponentProps } from '@/components/ui/Modal'
import { Stepper, useStepper } from '@/components/ui/Stepper'
import { useCrearFormularioAdquisicion } from '@/features/formularios/api/formulariosAdquisicion'
import { PasoAntecedentesLicitacion } from '@/features/formularios/components/LicitacionWizard/PasoAntecedentesLicitacion'
import { PasoEvaluacionLicitacion } from '@/features/formularios/components/LicitacionWizard/PasoEvaluacionLicitacion'
import { PasoRequerimientoLicitacion } from '@/features/formularios/components/LicitacionWizard/PasoRequerimientoLicitacion'
import { VALORES_INICIALES_DISPOSICIONES } from '@/features/formularios/schemas/disposicionesComunes.schema'
import {
  licitacionPublicaFormSchema,
  type LicitacionPublicaFormValues,
} from '@/features/formularios/schemas/formulariosAdquisicion.schema'
import { transformarLicitacionAPayload } from '@/features/formularios/utils/catalogosFormulario'
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
    'antecedentes',
  ],
  1: [
    'categoriaRequerimiento',
    'productos',
    'especificacionesTecnicasServicio',
    'planillaValidacionBiblioteca',
    'bibliografia',
    'formalizacion',
    'modalidadDuracionContrato',
    'duracionContratoMeses',
    'direccionDespachoCodigo',
    'direccionDespachoOtra',
    'disposiciones',
    'otrosIncumplimientos',
    'modalidadFormaPago',
    'tipoEntregaParcializada',
    'detalleEntregaParcializada',
  ],
  2: ['tipoEvaluacion', 'comisionEvaluadora', 'criteriosEvaluacion'],
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
    categoriaRequerimiento: 'productos',
    productos: [
      {
        cantidad: 1,
        especificacionesTecnicas: '',
        imagenReferencia: [],
        requiereGarantia: true,
        mesesGarantia: 12,
      },
    ],
    especificacionesTecnicasServicio: '',
    planillaValidacionBiblioteca: [],
    bibliografia: [],
    formalizacion: 'solo_oc',
    modalidadDuracionContrato: 'plazo_ofertado',
    duracionContratoMeses: null,
    direccionDespachoCodigo: 'osorno_fuchslocher',
    direccionDespachoOtra: '',
    otrosIncumplimientos: [],
    modalidadFormaPago: 'recepcion_conforme_total',
    tipoEntregaParcializada: 'mes_vencido',
    detalleEntregaParcializada: '',
    antecedentes: {
      campusSede: 'osorno',
      fechaFormulario: new Date(),
      formalizaSoloConFormularioLeasingObra: false,
      jefeCrNombre: '',
      jefeCrCargo: '',
      coordinadorEsMismoJefeCr: true,
      tipoPresupuesto: 'disponible',
      hacerVisiblePresupuestoEstimado: true,
      requiereGarantiaSeriedad: false,
      montoGarantiaSeriedadClp: null,
      visitaTerreno: 'no_requiere',
      visitaDiasCorridosPublicacion: null,
      visitaHora: '',
      visitaGuiaNombreCargo: '',
      visitaFormato: 'presencial',
      visitaDetalleLugarOEnlace: '',
      otrasConsideraciones: '',
    },
    tipoEvaluacion: 'completa',
    comisionEvaluadora: [
      {
        nombreCompleto: '',
        run: '',
        cargo: '',
        calidadContractual: 'Planta',
        correo: '',
      },
    ],
    criteriosEvaluacion: {
      aplicaRequisitosFormales: true,
      ponderacionRequisitosFormales: 5,
      aplicaPactoIntegridad: true,
      ponderacionPactoIntegridad: 2,
      ponderacionPrecio: 43,
      mecanismoPrecio: 'formula_proporcional',
      aplicaPlazoEntrega: true,
      ponderacionPlazoEntrega: 20,
      tipoDiasPlazoEntrega: 'habiles',
      plazoMaximoEntregaDias: 30,
      mecanismoPlazoEntrega: 'formula_menor_plazo',
      aplicaExperiencia: true,
      ponderacionExperiencia: 15,
      especificacionRubroExperiencia: '',
      modoMedicionExperiencia: 'cantidad_servicios',
      rangoMaximoExperiencia: 'Más de 5 servicios similares',
      rangoMedioExperiencia: 'Entre 3 y 5 servicios similares',
      rangoMinimoExperiencia: 'Entre 1 y 2 servicios similares',
      documentosRespaldoExperiencia: 'Certificados de recepción conforme u órdenes de compra',
      aplicaPlazoGarantia: true,
      ponderacionPlazoGarantia: 15,
      mecanismoPlazoGarantia: 'rangos_meses',
      otrosCriterios: [],
    },
    disposiciones: { ...VALORES_INICIALES_DISPOSICIONES },
  }
}

export function LicitacionWizardModal({ open, resolve, onExited }: ModalComponentProps<boolean>) {
  const stepper = useStepper({ totalSteps: 3 })
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
      <Modal.Header>
        Formulario Oficial para Licitación Pública — “Producto y/o Servicios”
      </Modal.Header>
      <Form form={form} onSubmit={guardarFormulario} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-6">
          <Stepper active={stepper.active} onStepClick={stepper.goTo} size="sm">
            <Stepper.Step label="II. Antecedentes" description="Solicitud, CR y Presupuesto" />
            <Stepper.Step label="I. Descripción" description="Ítems, Despacho y Pago" />
            <Stepper.Step label="III. Evaluación" description="Comisión y Criterios 100%" />
          </Stepper>

          {stepper.active === 0 && <PasoAntecedentesLicitacion />}
          {stepper.active === 1 && <PasoRequerimientoLicitacion />}
          {stepper.active === 2 && <PasoEvaluacionLicitacion />}
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
